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
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session) { navigate('/login'); return }

        const { user } = session
        const email = user.email
        const prenom = user.user_metadata?.given_name || user.user_metadata?.name?.split(' ')[0] || 'Utilisateur'
        const nom = user.user_metadata?.family_name || user.user_metadata?.name?.split(' ')[1] || ''

        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google-callback`, {
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
