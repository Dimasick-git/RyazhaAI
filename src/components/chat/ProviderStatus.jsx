import { useState, useEffect, useRef } from 'react'
import { checkAPIStatus } from '../../services/api'

const POLL_INTERVAL = 60_000

function ProviderStatus() {
  const [status, setStatus] = useState(null)
  const intervalRef = useRef(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false

    const check = () =>
      checkAPIStatus().then((s) => {
        if (!cancelledRef.current) setStatus(s)
      })

    const startPolling = () => {
      check()
      intervalRef.current = setInterval(check, POLL_INTERVAL)
    }

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        startPolling()
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelledRef.current = true
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  if (!status) return null

  const isOnline = status.status === 'online'

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-green-400' : 'bg-gray-500'}`}
      />
      <span className="text-xs text-gray-500">
        {isOnline ? (status.streaming ? 'Stream' : 'API') : 'Demo'}
      </span>
    </div>
  )
}

export default ProviderStatus
