import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiCall } from '../api/api'
import { User, Phone, Mail, Lock, Save, CheckCircle } from 'lucide-react'

const inputClass = "w-full px-4 py-3 bg-white bg-opacity-15 border border-white border-opacity-20 text-white placeholder-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-40 transition"
const labelClass = "block text-blue-100 text-sm font-medium mb-2"

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

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

  const handleInfoSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      const { data } = await apiCall(`/users/${user.email}/profile`, {
        method: 'PUT', body: JSON.stringify(formData)
      })
      if (data.success) { await refreshUser(); setSuccess('Informations mises à jour avec succès !') }
      else setError(data.message || 'Erreur lors de la mise à jour')
    } catch { setError('Erreur serveur') }
    setLoading(false)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (passwords.new.length < 6) { setError('Minimum 6 caractères'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const { data } = await apiCall(`/users/${user.email}/password`, {
        method: 'PUT', body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      })
      if (data.success) { setSuccess('Mot de passe modifié avec succès !'); setPasswords({ current: '', new: '', confirm: '' }) }
      else setError(data.message || 'Mot de passe actuel incorrect')
    } catch { setError('Erreur serveur') }
    setLoading(false)
  }

  const getBadge = (pts) => {
    if (pts >= 100) return { label: 'Ambassadeur Solidarité', color: 'text-amber-300', bar: 'bg-amber-400' }
    if (pts >= 50) return { label: 'Grand Donateur', color: 'text-purple-300', bar: 'bg-purple-400' }
    if (pts >= 10) return { label: 'Donateur Actif', color: 'text-blue-200', bar: 'bg-blue-300' }
    return { label: 'Nouveau Donateur', color: 'text-blue-300', bar: 'bg-blue-400' }
  }
  const badge = getBadge(user?.points || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600">

      {/* Header */}
      <div className="border-b border-white border-opacity-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{user?.prenom} {user?.nom}</h1>
              <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${badge.bar}`}></span>
                <span className={`text-sm font-medium ${badge.color}`}>{badge.label}</span>
                {user?.role && (
                  <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-0.5 rounded-full ml-1 capitalize border border-white border-opacity-20">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Points bar */}
          {user?.role === 'donateur' && (
            <div className="mt-6 bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100 text-sm">Niveau de générosité</span>
                <span className={`font-black ${badge.color}`}>{user?.points || 0} pts</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${Math.min((user?.points || 0), 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-blue-200 mt-1">
                <span>0</span><span>10</span><span>50</span><span>100</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-white bg-opacity-20 rounded-xl p-1 w-fit">
            {[{ key: 'infos', label: 'Mes informations' }, { key: 'password', label: 'Mot de passe' }].map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSuccess(''); setError('') }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.key ? 'bg-white text-blue-700 shadow-sm' : 'text-white hover:bg-white hover:bg-opacity-10'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {success && (
          <div className="flex items-center gap-2 bg-green-400 bg-opacity-20 border border-green-300 border-opacity-30 text-green-200 px-4 py-3 rounded-xl mb-6">
            <CheckCircle size={16} />{success}
          </div>
        )}
        {error && (
          <div className="bg-red-400 bg-opacity-20 border border-red-300 border-opacity-30 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
        )}

        {activeTab === 'infos' && (
          <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-6">
            <h2 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <User size={18} />Informations personnelles
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
                <label className={labelClass}><span className="flex items-center gap-1"><Phone size={13} /> Téléphone</span></label>
                <input type="tel" value={formData.telephone}
                  onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="77 123 45 67" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}><span className="flex items-center gap-1"><Mail size={13} /> Email</span></label>
                <div className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-10 text-blue-200 rounded-xl text-sm cursor-not-allowed">
                  {user?.email}
                </div>
                <p className="text-xs text-blue-200 mt-1">L'email ne peut pas être modifié</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50 font-bold py-3 rounded-xl transition">
                <Save size={16} />{loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-6">
            <h2 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Lock size={18} />Changer le mot de passe
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
                className="w-full flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50 font-bold py-3 rounded-xl transition">
                <Lock size={16} />{loading ? 'Modification...' : 'Modifier le mot de passe'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
