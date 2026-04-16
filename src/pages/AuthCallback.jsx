import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      try {
        // ✅ Écouter le changement de session (capte le hash dans l'URL)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe()

            const { user } = session
            const email = user.email
            const prenom = user.user_metadata?.given_name || user.user_metadata?.name?.split(' ')[0] || 'Utilisateur'
            const nom = user.user_metadata?.family_name || user.user_metadata?.name?.split(' ')[1] || ''

            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, prenom, nom, googleId: user.id })
              })

              const data = await res.json()
              if (data.success) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                navigate('/')
              } else {
                console.error('Erreur backend:', data.message)
                navigate('/login')
              }
            } catch (err) {
              console.error('Erreur fetch backend:', err)
              navigate('/login')
            }
          } else if (event === 'SIGNED_OUT') {
            navigate('/login')
          }
        })

        // ✅ Vérifier aussi si session existe déjà
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          subscription.unsubscribe()

          const { user } = session
          const email = user.email
          const prenom = user.user_metadata?.given_name || user.user_metadata?.name?.split(' ')[0] || 'Utilisateur'
          const nom = user.user_metadata?.family_name || user.user_metadata?.name?.split(' ')[1] || ''

          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-callback`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, prenom, nom, googleId: user.id })
            })

            const data = await res.json()
            if (data.success) {
              localStorage.setItem('token', data.token)
              localStorage.setItem('user', JSON.stringify(data.user))
              navigate('/')
            } else {
              navigate('/login')
            }
          } catch (err) {
            console.error(err)
            navigate('/login')
          }
        }

      } catch (err) {
        console.error('Erreur AuthCallback:', err)
        navigate('/login')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-white font-medium">Connexion en cours...</p>
        <p className="mt-2 text-blue-100 text-sm">Veuillez patienter</p>
      </div>
    </div>
  )
}

export default AuthCallback
