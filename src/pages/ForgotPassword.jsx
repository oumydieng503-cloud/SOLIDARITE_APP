import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiCall } from '../api/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      if (data.success) {
        setSent(true)
      } else {
        setError(data.message || 'Une erreur est survenue')
      }
    } catch {
      setError('Une erreur est survenue')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-black text-white">
            <span className="text-white">Aid</span><span className="text-green-300">Link</span><span className="text-white">.</span>
          </Link>
          <h1 className="text-3xl font-black text-white mt-6 mb-2">Mot de passe oublié</h1>
          <p className="text-blue-100">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h3 className="text-gray-800 font-bold text-lg mb-2">Email envoyé !</h3>
              <p className="text-gray-400 text-sm mb-6">
                Si cet email existe dans notre système, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <Link to="/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-center">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com" required
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition shadow-lg">
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </form>
              <p className="text-center text-gray-400 text-sm mt-6">
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition">
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
