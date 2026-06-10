import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react'

function sanitizeText(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function formatMsgTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const INLINE_REGEX = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__)/g

function renderInline(text) {
  const parts = []
  const regex = new RegExp(INLINE_REGEX.source, 'g')
  let last = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('[')) {
      const labelEnd = token.indexOf(']')
      const label = token.slice(1, labelEnd)
      const url = token.slice(labelEnd + 2, -1)
      parts.push(
        <a key={match.index} href={url} target="_blank" rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
          {label}
        </a>
      )
    } else if (token.startsWith('`')) {
      parts.push(<code key={match.index} className="bg-black/40 text-emerald-300 px-1 py-0.5 rounded text-xs font-mono">{token.slice(1, -1)}</code>)
    } else if (token.startsWith('**')) {
      parts.push(<strong key={match.index} className="font-semibold text-white">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('__')) {
      parts.push(<strong key={match.index} className="font-semibold text-white">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*')) {
      parts.push(<em key={match.index} className="italic text-gray-300">{token.slice(1, -1)}</em>)
    }
    last = match.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length > 0 ? parts : text
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="my-2 rounded-lg border border-ryaha-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 border-b border-ryaha-border">
        <span className="text-xs text-gray-500 font-mono">{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-400 transition-colors px-1.5 py-0.5 rounded hover:bg-emerald-500/10"
          title="Скопировать код"
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          <span>{copied ? 'Скопировано' : 'Копировать'}</span>
        </button>
      </div>
      <pre className="bg-black/40 p-3 overflow-x-auto text-sm font-mono text-emerald-300 whitespace-pre">
        {code}
      </pre>
    </div>
  )
}

function MessageContent({ text }) {
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <CodeBlock key={i} lang={lang} code={codeLines.join('\n')} />
      )
      i++
      continue
    }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-bold text-white mt-3 mb-1">{renderInline(line.slice(4))}</h3>)
      i++; continue
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-bold text-white mt-3 mb-1">{renderInline(line.slice(3))}</h2>)
      i++; continue
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-xl font-bold text-white mt-3 mb-1">{renderInline(line.slice(2))}</h1>)
      i++; continue
    }

    if (/^[-*•] /.test(line)) {
      const listItems = []
      while (i < lines.length && /^[-*•] /.test(lines[i])) {
        listItems.push(<li key={i} className="ml-4">{renderInline(lines[i].slice(2))}</li>)
        i++
      }
      elements.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-0.5 my-1">{listItems}</ul>)
      continue
    }

    if (/^\d+\. /.test(line)) {
      const listItems = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push(<li key={i} className="ml-4">{renderInline(lines[i].replace(/^\d+\. /, ''))}</li>)
        i++
      }
      elements.push(<ol key={`ol-${i}`} className="list-decimal list-inside space-y-0.5 my-1">{listItems}</ol>)
      continue
    }

    if (/^>[ \t]?/.test(line)) {
      const quoteLines = []
      while (i < lines.length && /^>[ \t]?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>[ \t]?/, ''))
        i++
      }
      elements.push(
        <blockquote key={`bq-${i}`} className="border-l-2 border-indigo-500/50 pl-3 my-1 text-gray-400 italic">
          {quoteLines.map((ql, qi) => (
            <p key={qi}>{renderInline(ql)}</p>
          ))}
        </blockquote>
      )
      continue
    }

    if (/^\|.+\|/.test(line)) {
      const tableRows = []
      while (i < lines.length && /^\|.+\|/.test(lines[i])) {
        tableRows.push(lines[i])
        i++
      }
      const rows = tableRows.filter((r) => !/^\|[-: |]+\|$/.test(r.trim()))
      if (rows.length > 0) {
        const header = rows[0].split('|').filter((c) => c.trim() !== '')
        const body = rows.slice(1)
        elements.push(
          <div key={`tbl-${i}`} className="my-2 overflow-x-auto">
            <table className="text-xs border-collapse w-full">
              <thead>
                <tr>
                  {header.map((h, hi) => (
                    <th key={hi} className="px-2 py-1 border border-ryaha-border bg-black/40 text-left font-semibold text-gray-300">
                      {renderInline(h.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => {
                  const cells = row.split('|').filter((c) => c.trim() !== '')
                  return (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-black/20' : ''}>
                      {cells.map((cell, ci) => (
                        <td key={ci} className="px-2 py-1 border border-ryaha-border text-gray-300">
                          {renderInline(cell.trim())}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-ryaha-border my-2" />)
      i++; continue
    }

    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />)
      i++; continue
    }

    elements.push(<p key={i} className="leading-relaxed">{renderInline(line)}</p>)
    i++
  }

  return <div className="space-y-0.5 text-sm">{elements}</div>
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-gray-600 hover:text-gray-300"
      title="Скопировать"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  )
}

function ReactionButtons({ msgId, reactions, onReact }) {
  const reaction = reactions[msgId]
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onReact(msgId, 'up')}
        className={`p-1 rounded transition-colors ${reaction === 'up' ? 'text-green-400' : 'text-gray-600 hover:text-green-400'}`}
        title="Полезно"
      >
        <ThumbsUp size={13} />
      </button>
      <button
        onClick={() => onReact(msgId, 'down')}
        className={`p-1 rounded transition-colors ${reaction === 'down' ? 'text-red-400' : 'text-gray-600 hover:text-red-400'}`}
        title="Не полезно"
      >
        <ThumbsDown size={13} />
      </button>
    </div>
  )
}

function BounceDots() {
  return (
    <div className="flex gap-1.5 items-center py-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

function MessageList({ messages, isLoading, streamText, reactions, onReact }) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamText, scrollToBottom])

  return (
    <div className="h-[440px] overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 group ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot size={17} />
            </div>
          )}

          <div className="flex flex-col gap-1 max-w-[82%]">
            <div
              className={`rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-ryaha-hover border border-ryaha-border text-gray-200'
              }`}
            >
              {message.role === 'assistant' ? (
                <MessageContent text={message.content} />
              ) : (
                <p
                  className="whitespace-pre-wrap break-words text-sm"
                  dangerouslySetInnerHTML={{ __html: sanitizeText(message.content) }}
                />
              )}
            </div>
            {message.role === 'assistant' && message.isOffline && (
              <span className="text-xs text-yellow-400/70 mt-1 block">⚡ Офлайн-режим</span>
            )}
            {message.role === 'assistant' && (
              <div className="flex items-center gap-1 pl-1">
                <CopyButton text={message.content} />
                <ReactionButtons msgId={message.id} reactions={reactions} onReact={onReact} />
                {message.ts && (
                  <span className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1">{formatMsgTime(message.ts)}</span>
                )}
              </div>
            )}
            {message.role === 'user' && message.ts && (
              <div className="flex justify-end pr-1">
                <span className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">{formatMsgTime(message.ts)}</span>
              </div>
            )}
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User size={17} />
            </div>
          )}
        </div>
      ))}

      {isLoading && streamText && (
        <div className="flex gap-3 justify-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bot size={17} />
          </div>
          <div className="max-w-[82%] bg-ryaha-hover border border-ryaha-border rounded-2xl px-4 py-3 text-gray-200">
            <MessageContent text={streamText} />
            <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle rounded-sm" />
          </div>
        </div>
      )}

      {isLoading && !streamText && (
        <div className="flex gap-3 justify-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <Bot size={17} />
          </div>
          <div className="bg-ryaha-hover border border-ryaha-border rounded-2xl px-4 py-3">
            <BounceDots />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList
