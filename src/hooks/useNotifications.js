import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from './useAuth'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user?.email) return

    // ✅ Écouter les changements sur les demandes en temps réel
    const channel = supabase
      .channel('demandes-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'demandes',
          filter: `email=eq.${user.email}`
        },
        (payload) => {
          const demande = payload.new

          // Créer une notification selon le statut
          let notif = null
          if (demande.statut === 'valide') {
            notif = {
              id: Date.now(),
              type: 'success',
              message: '✅ Votre demande a été validée ! Vous allez recevoir de l\'aide.',
              detail: demande.admin_message || '',
              date: new Date().toLocaleString(),
              read: false
            }
          } else if (demande.statut === 'rejete') {
            notif = {
              id: Date.now(),
              type: 'error',
              message: '❌ Votre demande a été rejetée.',
              detail: demande.admin_message || '',
              date: new Date().toLocaleString(),
              read: false
            }
          }

          if (notif) {
            setNotifications(prev => [notif, ...prev])
            setUnread(prev => prev + 1)

            // Notification du navigateur
            if (Notification.permission === 'granted') {
              new Notification('Solidarité App', {
                body: notif.message,
                icon: '/favicon.ico'
              })
            }
          }
        }
      )
      .subscribe()

    // Demander la permission pour les notifications navigateur
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.email])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return { notifications, unread, markAllRead, removeNotification }
}
