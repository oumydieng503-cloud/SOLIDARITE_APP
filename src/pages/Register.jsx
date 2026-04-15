import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Register() {
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', password: '',
    telephone: '', role: 'donateur'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await register(formData)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "block text-gray-700 text-sm font-medium mb-2"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black tracking-tight">
            <span className="text-blue-600">Aid</span>
            <span className="text-green-500">Link</span>
            <span className="text-blue-600">.</span>
          </Link>
          <h1 className="text-2xl font-black text-gray-800 mt-4 mb-1">Créer un compte</h1>
          <p className="text-gray-500 text-sm">Rejoignez la communauté AidLink</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Prénom</label>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nom</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="votre@email.com" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Téléphone</label>
              <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} required
                placeholder="77 123 45 67" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Mot de passe</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required
                placeholder="Minimum 6 caractères" className={inputClass} />
            </div>

            {/* Rôle */}
            <div>
              <label className={labelClass}>Je suis</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormData({...formData, role: 'donateur'})}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition ${
                    formData.role === 'donateur'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}>
                  💙 Donateur
                </button>
                <button type="button" onClick={() => setFormData({...formData, role: 'beneficiaire'})}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition ${
                    formData.role === 'beneficiaire'
                      ? 'bg-green-500 border-green-500 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                  }`}>
                  💚 Bénéficiaire
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition shadow-md mt-2">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
