import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTemoignages } from '../api/api'

function TestimonialCard({ aide, index }) {
  const initiales = `${aide.prenom?.[0] || '?'}${aide.nom?.[0] || '?'}`
  const colors = ['from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-orange-400 to-amber-500', 'from-purple-400 to-violet-500', 'from-rose-400 to-pink-500', 'from-cyan-400 to-blue-500']
  const color = colors[index % colors.length]
  return (
    <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl overflow-hidden hover:bg-opacity-25 hover:-translate-y-1 transition-all duration-300">
      <div className={`h-1 bg-gradient-to-r ${color}`} />
      <div className="p-6">
        <div className={`text-5xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent leading-none mb-3`}>"</div>
        <p className="text-blue-100 leading-relaxed italic text-sm mb-5">
          {aide.temoignage || aide.description?.substring(0, 150)}{(!aide.temoignage && aide.description?.length > 150) ? '...' : ''}
        </p>
        <div className="border-t border-white border-opacity-20 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{initiales}</div>
              <div>
                <h3 className="font-bold text-white text-sm">{aide.prenom} {aide.nom}</h3>
                <p className="text-xs text-blue-200">
                  {aide.ville && `${aide.ville} · `}
                  {aide.date_aide ? new Date(aide.date_aide).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                    : aide.created_at ? new Date(aide.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Récemment'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-green-400 bg-opacity-20 text-green-200 text-xs font-semibold px-2 py-1 rounded-full border border-green-300 border-opacity-30">Aidé</span>
              {aide.type_besoin && <p className="text-xs text-blue-300 mt-1 capitalize">{aide.type_besoin}</p>}
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
      <p className="text-blue-100 leading-relaxed mb-8">Les premiers témoignages apparaîtront ici dès que des bénéficiaires auront partagé leur histoire.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/donate" className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition">Faire un don maintenant</Link>
        <Link to="/beneficiaries" className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-30 transition border border-white border-opacity-30">Voir les bénéficiaires</Link>
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
        const res = await getTemoignages()
        // ✅ Le backend retourne directement un tableau []
        const safeList = Array.isArray(res) ? res : (res?.temoignages || res?.data || [])
        setAides(safeList)
        const villes = new Set(safeList.map(a => a.ville).filter(Boolean)).size
        setStats({ total: safeList.length, villes })
      } catch (e) {
        console.error(e)
        setAides([])
      }
      setLoading(false)
    }
    charger()
  }, [])

  const typesBesoin = [...new Set(aides.map(a => a.type_besoin).filter(Boolean))]
  const aidesFiltrees = aides.filter(a => {
    const matchSearch = searchQuery === '' || `${a.prenom} ${a.nom} ${a.ville} ${a.temoignage} ${a.description}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchBesoin = filterBesoin === 'tous' || a.type_besoin === filterBesoin
    return matchSearch && matchBesoin
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-blue-100 font-medium">Chargement des témoignages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600">

      {/* Hero */}
      <div className="border-b border-white border-opacity-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="text-green-200 font-semibold text-sm uppercase tracking-widest">Histoires vraies</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
            Des vies transformées
            <span className="block text-green-200">grâce à votre générosité</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto mb-10">
            Chaque témoignage est une histoire vraie. Ces personnes ont reçu de l'aide grâce à des donateurs comme vous.
          </p>
          {aides.length > 0 && (
            <div className="flex justify-center gap-12 flex-wrap">
              {[{ value: aides.length, label: 'Personnes aidées', color: 'text-green-200' }, { value: stats.villes, label: 'Villes concernées', color: 'text-blue-200' }].map((s, i) => (
                <div key={i} className="text-center">
                  <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-blue-100 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {aides.length === 0 ? <EmptyState /> : (
          <>
            {/* Recherche + Filtre */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 flex items-center gap-2 bg-white bg-opacity-15 border border-white border-opacity-20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-blue-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, ville, témoignage..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-blue-300 focus:outline-none" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="text-blue-300 hover:text-white text-sm">×</button>}
              </div>
              <select value={filterBesoin} onChange={e => setFilterBesoin(e.target.value)}
                className="bg-white bg-opacity-15 border border-white border-opacity-20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-40">
                <option value="tous" className="text-gray-800 bg-white">Tous les besoins</option>
                {typesBesoin.map(t => <option key={t} value={t} className="text-gray-800 bg-white">{t}</option>)}
              </select>
            </div>

            {(searchQuery || filterBesoin !== 'tous') && (
              <p className="text-blue-200 text-sm mb-4">
                <span className="text-white font-bold">{aidesFiltrees.length}</span> témoignage(s) trouvé(s)
              </p>
            )}

            {/* Grille */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aidesFiltrees.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-blue-100">Aucun témoignage ne correspond à votre recherche.</p>
                  <button onClick={() => { setSearchQuery(''); setFilterBesoin('tous') }}
                    className="mt-3 text-blue-200 hover:text-white text-sm underline">Réinitialiser</button>
                </div>
              ) : aidesFiltrees.map((aide, i) => <TestimonialCard key={aide.id} aide={aide} index={i} />)}
            </div>

            {/* CTA */}
            <div className="mt-16 bg-white bg-opacity-15 border border-white border-opacity-20 rounded-3xl p-10 text-center text-white">
              <h2 className="text-2xl font-black mb-3">Vous aussi, changez une vie</h2>
              <p className="text-blue-100 mb-6">Rejoignez notre communauté de donateurs et faites partie de ces histoires.</p>
              <Link to="/donate" className="inline-block bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg">
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
