import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTemoignages } from '../api/api'

function TestimonialCard({ aide, index }) {
  const initiales = `${aide.prenom?.[0] || '?'}${aide.nom?.[0] || '?'}`
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-purple-500 to-violet-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
  ]
  const color = colors[index % colors.length]

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-500 hover:-translate-y-1 transition-all duration-300">
      <div className={`h-1 bg-gradient-to-r ${color}`} />
      <div className="p-6">
        <div className={`text-5xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent leading-none mb-3`}>
          "
        </div>
        <p className="text-slate-300 leading-relaxed italic text-sm mb-5">
          {aide.temoignage || aide.description?.substring(0, 150)}{(!aide.temoignage && aide.description?.length > 150) ? '...' : ''}
        </p>
        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {initiales}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{aide.prenom} {aide.nom}</h3>
                <p className="text-xs text-slate-500">
                  {aide.ville && `${aide.ville} · `}
                  {aide.date_aide
                    ? new Date(aide.date_aide).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                    : aide.created_at
                    ? new Date(aide.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                    : 'Récemment'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-emerald-500 bg-opacity-20 text-emerald-400 text-xs font-semibold px-2 py-1 rounded-full border border-emerald-500 border-opacity-30">
                Aidé
              </span>
              {aide.type_besoin && (
                <p className="text-xs text-slate-500 mt-1 capitalize">{aide.type_besoin}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="max-w-lg mx-auto text-center py-20">
      <h3 className="text-2xl font-black text-white mb-3">Pas encore de témoignages</h3>
      <p className="text-slate-400 leading-relaxed mb-8">
        Les premiers témoignages apparaîtront ici dès que des bénéficiaires auront partagé leur histoire.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/donate" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition">
          Faire un don maintenant
        </Link>
        <Link to="/beneficiaries" className="bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-600 transition">
          Voir les bénéficiaires
        </Link>
      </div>
    </div>
  )
}

function Testimonials() {
  const [aides, setAides] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, villes: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBesoin, setFilterBesoin] = useState('tous')

  useEffect(() => {
    async function charger() {
      try {
        const list = await getTemoignages() || []
        setAides(list)
        const villes = new Set(list.map(a => a.ville).filter(Boolean)).size
        setStats({ total: list.length, villes })
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    charger()
  }, [])

  const typesBesoin = [...new Set(aides.map(a => a.type_besoin).filter(Boolean))]
  const aidesFiltrees = aides.filter(a => {
    const matchSearch = searchQuery === '' ||
      `${a.prenom} ${a.nom} ${a.ville} ${a.temoignage} ${a.description}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchBesoin = filterBesoin === 'tous' || a.type_besoin === filterBesoin
    return matchSearch && matchBesoin
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400 font-medium">Chargement des témoignages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Hero */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">Histoires vraies</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
            Des vies transformées
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
              grâce à votre générosité
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
            Chaque témoignage est une histoire vraie. Ces personnes ont reçu de l'aide grâce à des donateurs comme vous.
          </p>
          {aides.length > 0 && (
            <div className="flex justify-center gap-12 flex-wrap">
              {[
                { value: aides.length, label: 'Personnes aidées', color: 'text-emerald-400' },
                { value: stats.villes, label: 'Villes concernées', color: 'text-blue-400' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-slate-400 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-12">
        {aides.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Recherche + Filtre */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, ville, témoignage..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-300 text-sm">×</button>
                )}
              </div>
              <select
                value={filterBesoin}
                onChange={e => setFilterBesoin(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="tous">Tous les besoins</option>
                {typesBesoin.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Compteur */}
            {(searchQuery || filterBesoin !== 'tous') && (
              <p className="text-slate-500 text-sm mb-4">
                <span className="text-white font-bold">{aidesFiltrees.length}</span> témoignage(s) trouvé(s)
              </p>
            )}

            {/* Grille */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aidesFiltrees.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-slate-400">Aucun témoignage ne correspond à votre recherche.</p>
                  <button onClick={() => { setSearchQuery(''); setFilterBesoin('tous') }}
                    className="mt-3 text-blue-400 hover:text-blue-300 text-sm underline">
                    Réinitialiser la recherche
                  </button>
                </div>
              ) : (
                aidesFiltrees.map((aide, i) => (
                  <TestimonialCard key={aide.id} aide={aide} index={i} />
                ))
              )}
            </div>

            {/* CTA */}
            <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-10 text-center text-white shadow-2xl">
              <h2 className="text-2xl font-black mb-3">Vous aussi, changez une vie</h2>
              <p className="text-blue-100 mb-6">Rejoignez notre communauté de donateurs et faites partie de ces histoires.</p>
              <Link to="/donate"
                className="inline-block bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg">
                Faire un don maintenant
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Testimonials
