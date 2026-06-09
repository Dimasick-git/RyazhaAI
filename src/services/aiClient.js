/**
 * aiClient.js — Centralised AI provider service.
 *
 * Wraps the low-level streaming / non-streaming API calls from api.js and
 * exposes a single `sendMessage` function that:
 *   1. Attempts a streaming request first.
 *   2. Falls back to a plain (non-streaming) request if streaming fails.
 *
 * This keeps all provider-fallback logic out of UI components.
 */

import { sendMessageStream as _sendMessageStream, sendMessage as _sendMessage } from './api'

/**
 * Send a message to the AI backend with automatic streaming→plain fallback.
 *
 * @param {string} message          The user's message text.
 * @param {Array}  history          Prior conversation messages.
 * @param {string} [model]          Optional model identifier.
 * @param {Function} [onChunk]      Called with each streaming text chunk.
 *                                  If omitted, streaming is still attempted but
 *                                  the full text is returned only on completion.
 * @returns {{ cancel: () => void, promise: Promise<string> }}
 *   `cancel()` aborts an in-progress stream.
 *   `promise` resolves to the full response string.
 */
export function sendMessage(message, history = [], model, onChunk) {
  let innerCancel = () => {}

  const promise = (async () => {
    let full = ''

    const chunkHandler = (chunk) => {
      full += chunk
      if (onChunk) onChunk(chunk)
    }

    try {
      const { cancel, promise: streamPromise } = _sendMessageStream(
        message,
        history,
        chunkHandler,
        undefined,
        model,
      )
      innerCancel = cancel
      await streamPromise
      return full
    } catch {
      innerCancel = () => {}
      if (full) return full
      // Fallback to non-streaming request
      return await _sendMessage(message, history, model)
    }
  })()

  return {
    cancel: () => innerCancel(),
    promise,
  }
}
