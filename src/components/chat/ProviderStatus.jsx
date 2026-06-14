import { useState, useEffect, useRef } from 'react'
import { checkAPIStatus } from '../../services/api'

const POLL_INTERVAL = 60_000

function ProviderStatus() {
  const [status, setStatus] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const check = () => {
      if (document.hidden) return
      checkAPIStatus().then((s) => { if (!cancelled) setStatus(s) })
    }

    const schedule = () => {
      clearInterval(timerRef.current)
      timerRef.current = setInterval(check, POLL_INTERVAL)
    }

    const onVisibility = () => {
      if (!document.hidden) {
        check()
        schedule()
      } else {
        clearInterval(timerRef.current)
      }
    }

    check()
    schedule()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      clearInterval(timerRef.current)
      document.removeEventListener('visibilitychange', onVisibility)
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
