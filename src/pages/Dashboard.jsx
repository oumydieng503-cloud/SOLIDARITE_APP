import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getDons, getDonsRecus, ajouterTemoignage, apiCall } from '../api/api'

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 overflow-hidden relative">
      <div className={`absolute top-0 left-0 w-1 h-full ${accent}`} />
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-2">{sub}</p>}
    </div>
  )
}

function Badge({ statut }) {
  const config = {
    valide: 'bg-emerald-500 bg-opacity-20 text-emerald-400 border-emerald-500',
    rejete: 'bg-red-500 bg-opacity-20 text-red-400 border-red-500',
    en_attente: 'bg-amber-500 bg-opacity-20 text-amber-400 border-amber-500',
    aide: 'bg-blue-500 bg-opacity-20 text-blue-400 border-blue-500',
  }
  const labels = { valide: 'Validé', rejete: 'Rejeté', en_attente: 'En attente', aide: 'Aidé' }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border border-opacity-30 ${config[statut] || config.en_attente}`}>
      {labels[statut] || statut}
    </span>
  )
}

function DonTimeline({ don }) {
  const steps = [
    { label: 'Don soumis', done: true },
    { label: 'En attente de paiement', done: don.status !== 'en_attente' },
    { label: 'Don confirmé', done: don.status === 'valide' || don.status === 'aide' },
    { label: 'Bénéficiaire aidé', done: don.status === 'aide' },
  ]
  return (
    <div className="mt-4 pt-4 border-t border-slate-700">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Suivi du don</p>
      <div className="flex items-start">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold ${
                step.done ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500 border border-slate-600'
              }`}>
                {step.done ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${step.done ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              )}
            </div>
            <p className={`text-xs mt-2 text-center px-1 ${step.done ? 'text-emerald-400' : 'text-slate-600'}`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonCard({ don }) {
  const [expanded, setExpanded] = useState(false)
  const borderColor = don.status === 'valide' || don.status === 'aide' ? 'border-emerald-500 border-opacity-40' :
    don.status === 'rejete' ? 'border-red-500 border-opacity-40' : 'border-amber-500 border-opacity-40'

  return (
    <div className={`bg-slate-800 border rounded-2xl overflow-hidden ${borderColor}`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-bold text-white">{don.beneficiaire_nom}</p>
            <p className="text-slate-500 text-xs mt-1">
              {new Date(don.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-black text-white text-lg">
              {don.montant ? `${parseInt(don.montant).toLocaleString()} F` : don.type_don}
            </p>
            <Badge statut={don.status} />
          </div>
        </div>

        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Progression</span>
          <span>{don.status === 'aide' ? '100%' : don.status === 'valide' ? '75%' : '25%'}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all duration-700 ${
            don.status === 'aide' ? 'bg-emerald-500 w-full' :
            don.status === 'valide' ? 'bg-blue-500 w-3/4' : 'bg-amber-400 w-1/4'
          }`} />
        </div>

        {don.status === 'en_attente' && (
          <div className="mt-3 bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-20 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-400 mb-1">Action requise</p>
            <p className="text-xs text-amber-500">
              Envoyez <strong>{don.montant ? parseInt(don.montant).toLocaleString() + ' FCFA' : 'votre don'}</strong> via <strong>{don.mode_paiement}</strong>
            </p>
            <p className="text-xs text-amber-600 mt-1">Réf : #{don.id}</p>
          </div>
        )}

        {(don.points_gagnes || 0) > 0 && (
          <p className="mt-3 text-xs text-amber-400">+{don.points_gagnes} points gagnés</p>
        )}

        <button onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium">
          {expanded ? '▲ Masquer' : '▼ Voir le suivi'}
        </button>

        {expanded && <DonTimeline don={don} />}
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const [dons, setDons] = useState([])
  const [demande, setDemande] = useState(null)
  const [donsRecus, setDonsRecus] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [pageDons, setPageDons] = useState(1)
  const DONS_PAR_PAGE = 5
  const [temoignage, setTemoignage] = useState('')
  const [temoignageEnvoye, setTemoignageEnvoye] = useState(false)
  const [envoiTemoignage, setEnvoiTemoignage] = useState(false)

  useEffect(() => {
    async function charger() {
      try {
        if (user?.role === 'donateur') {
          const data = await getDons(user.email)
          setDons(data.dons || [])
        }
        if (user?.role === 'beneficiaire') {
          const [demandeData, donsRecusData] = await Promise.all([
            apiCall('/demandes/mienne'),
            getDonsRecus(user.email)
          ])
          if (demandeData.data?.demande) setDemande(demandeData.data.demande)
          setDonsRecus(donsRecusData.dons || [])
        }
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    charger()
  }, [user])

  const totalDons = dons.reduce((sum, d) => sum + (parseInt(d.montant) || 0), 0)
  const donsValides = dons.filter(d => d.status === 'valide' || d.status === 'aide')
  const donsEnAttente = dons.filter(d => d.status === 'en_attente')
  const donsFiltres = filterStatut === 'tous' ? dons : dons.filter(d => d.status === filterStatut)

  const handleTemoignage = async (e) => {
    e.preventDefault()
    if (!temoignage.trim() || !demande) return
    setEnvoiTemoignage(true)
    const result = await ajouterTemoignage(demande.id, temoignage)
    if (result.success) {
      setTemoignageEnvoye(true)
      setTemoignage('')
    }
    setEnvoiTemoignage(false)
  }

  const getBadge = (pts) => {
    if (pts >= 100) return { label: 'Ambassadeur Solidarité', color: 'text-yellow-400' }
    if (pts >= 50) return { label: 'Grand Donateur', color: 'text-purple-400' }
    if (pts >= 10) return { label: 'Donateur Actif', color: 'text-blue-400' }
    return { label: 'Nouveau Donateur', color: 'text-slate-400' }
  }
  const badge = getBadge(user?.points || 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Bonjour, {user?.prenom}</h1>
              <p className="text-slate-400 mt-1 text-sm">
                {user?.role === 'donateur' ? 'Merci pour votre générosité.' : 'Bienvenue sur votre espace.'}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{user?.prenom} {user?.nom}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-1 mt-6 bg-slate-900 rounded-xl p-1 w-fit overflow-x-auto">
            {[
              { key: 'overview', label: "Vue d'ensemble" },
              user?.role === 'donateur' && { key: 'dons', label: `Mes dons (${dons.length})` },
              user?.role === 'beneficiaire' && { key: 'demande', label: 'Ma demande' },
              user?.role === 'beneficiaire' && { key: 'recus', label: `Dons reçus (${donsRecus.length})` },
              user?.role === 'beneficiaire' && demande?.statut === 'aide' && { key: 'temoignage', label: 'Mon témoignage' },
            ].filter(Boolean).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {user?.role === 'donateur' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Total donné" value={`${totalDons.toLocaleString()} F`} sub="Montant cumulé" accent="bg-blue-500" />
                  <StatCard label="Confirmés" value={donsValides.length} sub="Paiements reçus" accent="bg-emerald-500" />
                  <StatCard label="En attente" value={donsEnAttente.length} sub="À effectuer" accent="bg-amber-500" />
                  <StatCard label="Points" value={user?.points || 0} sub={badge.label} accent="bg-purple-500" />
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white">Niveau de générosité</h3>
                      <p className={`text-sm mt-1 ${badge.color}`}>{badge.label}</p>
                    </div>
                    <span className={`text-3xl font-black ${badge.color}`}>{user?.points || 0} pts</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((user?.points || 0), 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-2">
                    <span>0</span><span>10 — Actif</span><span>50 — Grand</span><span>100 — Ambassadeur</span>
                  </div>
                </div>

                {dons.length > 0 && (
                  <div>
                    <h3 className="font-bold text-white mb-4">Dons récents</h3>
                    <div className="space-y-4">
                      {dons.slice(0, 3).map(don => <DonCard key={don.id} don={don} />)}
                      {dons.length > 3 && (
                        <button onClick={() => setActiveTab('dons')} className="w-full py-3 text-sm text-blue-400 font-medium hover:text-blue-300">
                          Voir tous les dons ({dons.length}) →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {user?.role === 'beneficiaire' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard label="Statut demande"
                    value={demande?.statut === 'valide' ? 'Validée' : demande?.statut === 'rejete' ? 'Rejetée' : demande ? 'En attente' : 'Aucune'}
                    sub={demande ? demande.type_besoin : 'Pas encore de demande'} accent="bg-amber-500" />
                  <StatCard label="Dons reçus" value={donsRecus.length} sub="Personnes qui vous ont aidé" accent="bg-blue-500" />
                  <StatCard label="Montant reçu"
                    value={`${donsRecus.reduce((s, d) => s + (parseInt(d.montant) || 0), 0).toLocaleString()} F`}
                    sub="Total en argent" accent="bg-purple-500" />
                </div>

                {demande?.admin_message && (
                  <div className={`rounded-2xl p-6 border ${demande.statut === 'valide' ? 'bg-emerald-500 bg-opacity-10 border-emerald-500 border-opacity-30' : 'bg-red-500 bg-opacity-10 border-red-500 border-opacity-30'}`}>
                    <p className="font-semibold text-white mb-1">Message de l'administrateur</p>
                    <p className={demande.statut === 'valide' ? 'text-emerald-400' : 'text-red-400'}>{demande.admin_message}</p>
                  </div>
                )}

                {!demande && (
                  <div className="bg-slate-800 border border-dashed border-slate-600 rounded-2xl p-8 text-center">
                    <h3 className="font-bold text-white text-lg mb-2">Aucune demande en cours</h3>
                    <a href="/request" className="inline-block mt-2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-500 transition font-medium text-sm">
                      Faire une demande
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* MES DONS */}
        {activeTab === 'dons' && user?.role === 'donateur' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'tous', label: `Tous (${dons.length})` },
                { key: 'en_attente', label: `En attente (${donsEnAttente.length})` },
                { key: 'valide', label: `Confirmés (${donsValides.length})` },
              ].map(f => (
                <button key={f.key} onClick={() => { setFilterStatut(f.key); setPageDons(1) }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filterStatut === f.key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
            {donsFiltres.length === 0 ? (
              <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
                <p className="text-slate-400">Aucun don dans cette catégorie.</p>
                <a href="/donate" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-500 transition text-sm font-medium">
                  Faire un don
                </a>
              </div>
            ) : (() => {
              const totalPages = Math.ceil(donsFiltres.length / DONS_PAR_PAGE)
              const donsPage = donsFiltres.slice((pageDons - 1) * DONS_PAR_PAGE, pageDons * DONS_PAR_PAGE)
              return (
                <>
                  <div className="space-y-4">
                    {donsPage.map(don => <DonCard key={don.id} don={don} />)}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
                      <p className="text-slate-500 text-sm">
                        Page <span className="text-white font-semibold">{pageDons}</span> sur <span className="text-white font-semibold">{totalPages}</span>
                        <span className="ml-2 text-slate-600">({donsFiltres.length} dons)</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPageDons(p => Math.max(1, p - 1))}
                          disabled={pageDons === 1}
                          className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
                          Précédent
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <button key={p} onClick={() => setPageDons(p)}
                            className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                              pageDons === p ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}>
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => setPageDons(p => Math.min(totalPages, p + 1))}
                          disabled={pageDons === totalPages}
                          className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* MA DEMANDE */}
        {activeTab === 'demande' && user?.role === 'beneficiaire' && (
          <div>
            {demande ? (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-white text-lg">Détail de ma demande</h2>
                  <Badge statut={demande.statut} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { label: 'Type de besoin', value: demande.type_besoin },
                    { label: 'Description', value: demande.description },
                    { label: 'Adresse', value: `${demande.adresse}, ${demande.ville}` },
                    { label: 'Téléphone', value: demande.telephone },
                    { label: 'Email', value: demande.email },
                    { label: 'Wave/OM', value: demande.numero_paiement || 'Non renseigné' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                      <p className="text-white mt-1 text-sm">{value}</p>
                    </div>
                  ))}
                </div>
                {demande.admin_message && (
                  <div className={`mt-6 p-4 rounded-xl border ${demande.statut === 'valide' ? 'bg-emerald-500 bg-opacity-10 border-emerald-500 border-opacity-30' : 'bg-red-500 bg-opacity-10 border-red-500 border-opacity-30'}`}>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Message admin</p>
                    <p className={demande.statut === 'valide' ? 'text-emerald-400' : 'text-red-400'}>{demande.admin_message}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 border border-dashed border-slate-600 rounded-2xl p-8 text-center">
                <h3 className="font-bold text-white text-lg mb-2">Aucune demande</h3>
                <a href="/request" className="inline-block mt-2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-500 transition text-sm">
                  Faire une demande
                </a>
              </div>
            )}
          </div>
        )}

        {/* DONS REÇUS */}
        {activeTab === 'recus' && user?.role === 'beneficiaire' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="font-bold text-white text-lg">Dons reçus en votre faveur</h2>
              <p className="text-sm text-slate-400">{donsRecus.length} don(s)</p>
            </div>
            {donsRecus.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-400">Pas encore de don reçu.</p>
                <p className="text-slate-500 text-sm mt-2">Une fois votre demande validée, les donateurs pourront vous aider.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-700 text-left">
                      {['Date', 'Type', 'Montant', 'Paiement', 'Statut'].map(h => (
                        <th key={h} className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {donsRecus.map(don => (
                      <tr key={don.id} className="hover:bg-slate-700 transition">
                        <td className="px-6 py-4 text-sm text-slate-400">{new Date(don.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-sm text-slate-300 capitalize">{don.type_don}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">
                          {don.montant ? `${parseInt(don.montant).toLocaleString()} F` : don.description || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 capitalize">{don.mode_paiement}</td>
                        <td className="px-6 py-4"><Badge statut={don.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TEMOIGNAGE */}
        {activeTab === 'temoignage' && user?.role === 'beneficiaire' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="font-bold text-white text-lg mb-2">Partagez votre témoignage</h2>
            <p className="text-slate-400 text-sm mb-6">
              Vous avez reçu de l'aide — partagez votre histoire pour encourager d'autres donateurs !
            </p>

            {temoignageEnvoye || demande?.temoignage ? (
              <div className="bg-emerald-500 bg-opacity-10 border border-emerald-500 border-opacity-30 rounded-xl p-6 text-center">
                <p className="text-emerald-400 font-bold text-lg mb-2">Merci pour votre témoignage !</p>
                <p className="text-slate-400 text-sm">Il sera visible sur la page Témoignages.</p>
                {demande?.temoignage && (
                  <div className="mt-4 bg-slate-700 rounded-xl p-4 text-left">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Votre témoignage</p>
                    <p className="text-white italic">"{demande.temoignage}"</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleTemoignage} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Votre témoignage *
                  </label>
                  <textarea
                    value={temoignage}
                    onChange={e => setTemoignage(e.target.value)}
                    required
                    rows="5"
                    placeholder="Racontez comment vous avez été aidé, ce que ça a changé pour vous..."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <button type="submit" disabled={envoiTemoignage}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white font-bold py-3 rounded-xl transition">
                  {envoiTemoignage ? 'Envoi...' : 'Partager mon témoignage'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard
