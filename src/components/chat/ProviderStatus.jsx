import { useState, useEffect } from 'react'
import { checkAPIStatus } from '../../services/api'

function ProviderStatus() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    checkAPIStatus().then(setStatus)
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
