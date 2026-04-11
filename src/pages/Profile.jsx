import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiCall } from '../api/api'
import { User, Phone, Mail, Lock, Save, CheckCircle } from 'lucide-react'

const inputClass = "w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
const labelClass = "block text-slate-300 text-sm font-medium mb-2"

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('infos')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    telephone: user?.telephone || '',
  })

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handleInfoSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await apiCall(`/users/${user.email}/profile`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      })
      if (data.success) {
        await refreshUser()
        setSuccess('Informations mises à jour avec succès !')
      } else {
        setError(data.message || 'Erreur lors de la mise à jour')
      }
    } catch {
      setError('Erreur serveur')
    }
    setLoading(false)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (passwords.new.length < 6) {
      setError('Minimum 6 caractères')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await apiCall(`/users/${user.email}/password`, {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      })
      if (data.success) {
        setSuccess('Mot de passe modifié avec succès !')
        setPasswords({ current: '', new: '', confirm: '' })
      } else {
        setError(data.message || 'Mot de passe actuel incorrect')
      }
    } catch {
      setError('Erreur serveur')
    }
    setLoading(false)
  }

  const getBadge = (pts) => {
    if (pts >= 100) return { label: 'Ambassadeur Solidarité', color: 'text-yellow-400', bg: 'bg-yellow-500' }
    if (pts >= 50) return { label: 'Grand Donateur', color: 'text-purple-400', bg: 'bg-purple-500' }
    if (pts >= 10) return { label: 'Donateur Actif', color: 'text-blue-400', bg: 'bg-blue-500' }
    return { label: 'Nouveau Donateur', color: 'text-slate-400', bg: 'bg-slate-500' }
  }
  const badge = getBadge(user?.points || 0)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{user?.prenom} {user?.nom}</h1>
              <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${badge.bg}`}></span>
                <span className={`text-sm font-medium ${badge.color}`}>{badge.label}</span>
                {user?.role && (
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full ml-1 capitalize">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Points bar */}
          {user?.role === 'donateur' && (
            <div className="mt-6 bg-slate-700 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Niveau de générosité</span>
                <span className={`font-black ${badge.color}`}>{user?.points || 0} pts</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((user?.points || 0), 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0</span><span>10</span><span>50</span><span>100</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-slate-900 rounded-xl p-1 w-fit">
            {[
              { key: 'infos', label: 'Mes informations' },
              { key: 'password', label: 'Mot de passe' },
            ].map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSuccess(''); setError('') }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.key ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Messages */}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-500 bg-opacity-10 border border-emerald-500 border-opacity-30 text-emerald-400 px-4 py-3 rounded-xl mb-6">
            <CheckCircle size={16} />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Informations */}
        {activeTab === 'infos' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <User size={18} />
              Informations personnelles
            </h2>
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Prénom</label>
                  <input type="text" value={formData.prenom}
                    onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                    required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Nom</label>
                  <input type="text" value={formData.nom}
                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                    required className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1"><Phone size={13} /> Téléphone</span>
                </label>
                <input type="tel" value={formData.telephone}
                  onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="77 123 45 67" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1"><Mail size={13} /> Email</span>
                </label>
                <div className="w-full px-4 py-3 bg-slate-600 border border-slate-500 text-slate-400 rounded-xl text-sm cursor-not-allowed">
                  {user?.email}
                </div>
                <p className="text-xs text-slate-500 mt-1">L'email ne peut pas être modifié</p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-3 rounded-xl transition">
                <Save size={16} />
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>
        )}

        {/* Mot de passe */}
        {activeTab === 'password' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Lock size={18} />
              Changer le mot de passe
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Mot de passe actuel</label>
                <input type="password" value={passwords.current}
                  onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="••••••••" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nouveau mot de passe</label>
                <input type="password" value={passwords.new}
                  onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                  placeholder="Minimum 6 caractères" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Confirmer le nouveau mot de passe</label>
                <input type="password" value={passwords.confirm}
                  onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Répétez le mot de passe" required className={inputClass} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-3 rounded-xl transition">
                <Lock size={16} />
                {loading ? 'Modification...' : 'Modifier le mot de passe'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
