import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDemandesValides } from '../api/api'
import Pagination from '../components/Pagination'

const BESOIN_CONFIG = {
  nourriture: { color: 'from-orange-400 to-amber-500', border: 'border-orange-500' },
  medical: { color: 'from-red-400 to-rose-500', border: 'border-red-500' },
  handicap: { color: 'from-blue-400 to-indigo-500', border: 'border-blue-500' },
  education: { color: 'from-green-400 to-emerald-500', border: 'border-emerald-500' },
  logement: { color: 'from-purple-400 to-violet-500', border: 'border-purple-500' },
  argent: { color: 'from-yellow-400 to-amber-500', border: 'border-yellow-500' },
  autre: { color: 'from-slate-400 to-slate-500', border: 'border-slate-500' },
}

function BenefCard({ benef, onAider }) {
  const config = BESOIN_CONFIG[benef.type_besoin] || BESOIN_CONFIG.autre
  const initiales = `${benef.prenom?.[0] || '?'}${benef.nom?.[0] || '?'}`

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-500 hover:-translate-y-1 transition-all duration-300">
      <div className={`h-1 w-full bg-gradient-to-r ${config.color}`} />
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
            {initiales}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-lg leading-tight">{benef.prenom} {benef.nom}</h3>
            <p className="text-slate-400 text-sm mt-0.5 truncate">
              {benef.ville || benef.adresse}
            </p>
          </div>
          <span className="bg-emerald-500 bg-opacity-20 text-emerald-400 text-xs font-semibold px-2 py-1 rounded-full border border-emerald-500 border-opacity-30 flex-shrink-0">
            Vérifié
          </span>
        </div>

        <div className={`inline-flex items-center gap-1.5 bg-slate-700 text-slate-300 border border-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 capitalize`}>
          {benef.type_besoin}
        </div>

        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4">
          {benef.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          {benef.numero_paiement && (
            <div className="text-xs text-slate-500">
              <span className="font-medium text-slate-400">Wave/OM :</span> {benef.numero_paiement}
            </div>
          )}
          <button onClick={() => onAider(benef)}
            className={`ml-auto bg-gradient-to-r ${config.color} text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition`}>
            Aider
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="col-span-full text-center py-20">
      <div className="relative w-32 h-32 mx-auto mb-8">
        <div className="absolute inset-0 bg-blue-500 opacity-10 rounded-full animate-pulse" />
        <div className="absolute inset-4 bg-blue-500 opacity-10 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center text-5xl"></div>
      </div>
      <h3 className="text-2xl font-black text-white mb-3">Aucun bénéficiaire pour le moment</h3>
      <p className="text-slate-400 mb-2">Les demandes sont en cours de vérification.</p>
      <p className="text-slate-500 text-sm mb-8">Revenez bientôt — de nouvelles personnes ont besoin de vous.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/donate" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition">
          Faire un don général
        </a>
        <a href="/" className="bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-600 transition">
          Retour à l'accueil
        </a>
      </div>
      <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm mx-auto">
        {['Demandes vérifiées', 'Données sécurisées', 'Dons instantanés'].map((label, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400 font-medium">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Beneficiaries() {
  const [beneficiairesValides, setBeneficiairesValides] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBesoin, setFilterBesoin] = useState('tous')
  const navigate = useNavigate()

  useEffect(() => {
    async function charger() {
      setLoading(true)
      const data = await getDemandesValides(page)
      setBeneficiairesValides(data.demandes || [])
      setPagination(data.pagination || null)
      setLoading(false)
    }
    charger()
  }, [page])

  const handleAider = (benef) => navigate('/donate', { state: { beneficiaire: benef } })

  const typesBesoin = [...new Set(beneficiairesValides.map(b => b.type_besoin))].filter(Boolean)

  const benefFiltres = beneficiairesValides.filter(b => {
    const matchSearch = searchQuery === '' ||
      `${b.nom} ${b.prenom} ${b.ville} ${b.description}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchBesoin = filterBesoin === 'tous' || b.type_besoin === filterBesoin
    return matchSearch && matchBesoin
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400 font-medium">Chargement des bénéficiaires...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest">Bénéficiaires vérifiés</span>
            <h1 className="text-4xl font-black text-white mt-2 mb-3">Ces personnes ont besoin de vous</h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Chaque profil a été vérifié. Votre aide va directement à la personne que vous choisissez.
            </p>
          </div>

          {beneficiairesValides.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5">
                <span className="text-slate-400 text-sm">Rechercher...</span>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Nom, ville, description..."
                  className="flex-1 bg-transparent text-sm focus:outline-none text-white placeholder-slate-500" />
              </div>
              <select value={filterBesoin} onChange={e => setFilterBesoin(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="tous">Tous les besoins</option>
                {typesBesoin.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {benefFiltres.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400 text-sm">
              <span className="font-bold text-white">{benefFiltres.length}</span> bénéficiaire(s)
            </p>
            {pagination && <p className="text-slate-500 text-xs">Page {pagination.page} / {pagination.totalPages}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefFiltres.length === 0 ? <EmptyState /> : benefFiltres.map(benef => (
            <BenefCard key={benef.id} benef={benef} onAider={handleAider} />
          ))}
        </div>

        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  )
}

export default Beneficiaries
