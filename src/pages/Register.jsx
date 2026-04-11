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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

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

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500 opacity-5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-black text-white">
            Solidarité<span className="text-blue-400">.</span>
          </Link>
          <h1 className="text-3xl font-black text-white mt-6 mb-2">Créer un compte</h1>
          <p className="text-slate-400">Rejoignez la communauté Solidarité</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Prénom</label>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Nom</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} required
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="votre@email.com"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Téléphone</label>
              <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} required
                placeholder="77 123 45 67"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Mot de passe</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required
                placeholder="Minimum 6 caractères"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Je suis</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormData({...formData, role: 'donateur'})}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                    formData.role === 'donateur'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-500'
                  }`}>
                  Donateur
                </button>
                <button type="button" onClick={() => setFormData({...formData, role: 'beneficiaire'})}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                    formData.role === 'beneficiaire'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-emerald-500'
                  }`}>
                  Bénéficiaire
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-3 rounded-xl transition shadow-lg mt-2">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
