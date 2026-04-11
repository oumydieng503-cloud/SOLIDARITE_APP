import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'

function NotificationBell() {
  const { notifications, unread, markAllRead, removeNotification } = useNotifications()
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(!open)
    if (!open) markAllRead()
  }

  return (
    <div className="relative">
      {/* Cloche */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown notifications */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  notifications.forEach(n => removeNotification(n.id))
                }}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Tout effacer
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Aucune notification
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b hover:bg-gray-50 flex gap-3 ${
                    !notif.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      notif.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {notif.message}
                    </p>
                    {notif.detail && (
                      <p className="text-xs text-gray-500 mt-1">{notif.detail}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{notif.date}</p>
                  </div>
                  <button
                    onClick={() => removeNotification(notif.id)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

export default NotificationBell
