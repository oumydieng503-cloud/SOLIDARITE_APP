import { useState, useEffect } from 'react'
import { Users, HandHeart, DollarSign, CheckCircle, Search } from 'lucide-react'
import emailjs from '@emailjs/browser'
import { getDemandes, updateDemande, getVisitorCount, getStats, apiCall } from '../api/api'
import Pagination from '../components/Pagination'

const EMAILJS_SERVICE_ID = 'service_tr58mrj'
const EMAILJS_TEMPLATE_VALIDATION = 'template_diphkgr'
const EMAILJS_PUBLIC_KEY = 'Re9Ab2iFhcxeifqg8'

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-blue-200 font-medium">{item.value}</span>
          <div className="w-full rounded-t-md transition-all duration-700 bg-white bg-opacity-50"
            style={{ height: `${(item.value / max) * 80}px`, minHeight: '4px' }} />
          <span className="text-xs text-blue-200 text-center leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ valide, rejete, enAttente }) {
  const total = valide + rejete + enAttente || 1
  const pValide = (valide / total) * 100
  const pRejete = (rejete / total) * 100
  const pAttente = (enAttente / total) * 100
  const r = 40; const circ = 2 * Math.PI * r; let offset = 0
  const segments = [
    { value: pValide, color: '#86efac', label: 'Validés' },
    { value: pRejete, color: '#fca5a5', label: 'Rejetés' },
    { value: pAttente, color: '#fcd34d', label: 'En attente' },
  ]
  return (
    <div className="flex items-center gap-6">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="16" />
        {segments.map((seg, i) => {
          const dash = (seg.value / 100) * circ
          const el = (<circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="16"
            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset + circ * 0.25}
            style={{ transition: 'stroke-dasharray 1s ease' }} />)
          offset += dash; return el
        })}
        <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">{total}</text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: seg.color }} />
            <span className="text-xs text-blue-100">{seg.label}</span>
            <span className="text-xs font-bold text-white ml-auto">{seg.value.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreuveModal({ preuve, type, onClose }) {
  if (!preuve) return null
  const isImage = preuve.startsWith('data:image') || type?.includes('photo') || type?.includes('certificat') || type?.includes('carte')
  const isPDF = preuve.startsWith('data:application/pdf')
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Fichier preuve — {type}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-4 overflow-auto max-h-[75vh] flex items-center justify-center bg-gray-50">
          {isImage ? <img src={preuve} alt="Preuve" className="max-w-full max-h-full rounded-xl shadow-md object-contain" />
            : isPDF ? <iframe src={preuve} className="w-full h-[65vh] rounded-xl" title="Preuve PDF" />
            : <div className="text-center py-12"><p className="text-4xl mb-4">📄</p><a href={preuve} download="preuve" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition">Télécharger</a></div>}
        </div>
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-2">
          <a href={preuve} download="preuve" className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition">Télécharger</a>
          <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">Fermer</button>
        </div>
      </div>
    </div>
  )
}

function Admin() {
  const [demandes, setDemandes] = useState([])
  const [toutesLesDemandes, setToutesLesDemandes] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [visitors, setVisitors] = useState(0)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDemande, setSelectedDemande] = useState(null)
  const [adminMessage, setAdminMessage] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [ongletActif, setOngletActif] = useState('dashboard')
  const [preuveModal, setPreuveModal] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [demandesAides, setDemandesAides] = useState([])
  const [dons, setDons] = useState([])

  useEffect(() => {
    async function charger() {
      const [demandesData, visitorsData, statsData, toutesData] = await Promise.all([getDemandes(page), getVisitorCount(), getStats(), getDemandes(1, 100)])
      setDemandes(demandesData.demandes || []); setPagination(demandesData.pagination || null)
      setToutesLesDemandes(toutesData.demandes || []); setVisitors(visitorsData || 0); setStats(statsData)
      const aidesRes = await apiCall('/demandes/aides'); setDemandesAides(aidesRes.data?.demandes || [])
      const donsRes = await apiCall('/dons/all'); setDons(donsRes.data?.dons || [])
      setLoading(false)
    }
    charger()
  }, [page])

  const chargerDemandes = async () => {
    const [data, toutesData] = await Promise.all([getDemandes(page), getDemandes(1, 100)])
    setDemandes(data.demandes || []); setPagination(data.pagination || null); setToutesLesDemandes(toutesData.demandes || [])
  }

  const envoyerEmailBeneficiaire = async (demande, messageAdmin) => {
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_VALIDATION, {
        to_email: demande.email, to_name: `${demande.prenom} ${demande.nom}`,
        nom: demande.nom, prenom: demande.prenom, email: demande.email,
        typeBesoin: demande.type_besoin, description: demande.description,
        numeroPaiement: demande.numero_paiement || 'Non renseigné',
        messageAdmin: messageAdmin || 'Votre demande a été acceptée'
      }, EMAILJS_PUBLIC_KEY)
      return true
    } catch (error) { console.error('Erreur email:', error); return false }
  }

  const handleValider = async (id) => {
    const demande = demandes.find(d => d.id === id); setEnvoiEnCours(true)
    await updateDemande(id, { statut: 'valide', admin_message: adminMessage })
    const emailEnvoye = await envoyerEmailBeneficiaire(demande, adminMessage)
    await chargerDemandes(); setSelectedDemande(null); setAdminMessage(''); setEnvoiEnCours(false)
    alert(emailEnvoye ? 'Demande validée ! Email envoyé.' : 'Demande validée ! (Email non envoyé)')
  }

  const handleArchiver = async (id) => {
    if (!window.confirm('Retirer ce bénéficiaire de la liste publique ?')) return
    await apiCall(`/demandes/${id}/archiver`, { method: 'PUT' })
    const aidesRes = await apiCall('/demandes/aides'); setDemandesAides(aidesRes.data?.demandes || [])
    await chargerDemandes(); alert('Bénéficiaire retiré de la liste publique.')
  }

  const handleRejeter = async (id) => {
    await updateDemande(id, { statut: 'rejete', admin_message: adminMessage })
    await chargerDemandes(); setSelectedDemande(null); setAdminMessage(''); alert('Demande rejetée.')
  }

  const totalDemandes = toutesLesDemandes.length
  const nbValides = toutesLesDemandes.filter(d => d.statut === 'valide').length
  const nbRejetes = toutesLesDemandes.filter(d => d.statut === 'rejete').length
  const nbEnAttente = toutesLesDemandes.filter(d => d.statut === 'en_attente').length
  const nbAides = toutesLesDemandes.filter(d => d.statut === 'aide').length
  const tauxValidation = totalDemandes > 0 ? ((nbValides / totalDemandes) * 100).toFixed(0) : 0

  const parTypeBesoin = toutesLesDemandes.reduce((acc, d) => { acc[d.type_besoin] = (acc[d.type_besoin] || 0) + 1; return acc }, {})
  const topBesoins = Object.entries(parTypeBesoin).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label: label.substring(0, 8), value, color: 'bg-white' }))

  const demandesFiltrees = demandes.filter(d => searchQuery === '' || `${d.nom} ${d.prenom} ${d.email} ${d.ville}`.toLowerCase().includes(searchQuery.toLowerCase()))
  const demandesEnAttente = demandesFiltrees.filter(d => d.statut === 'en_attente')
  const demandesValides = demandesFiltrees.filter(d => d.statut === 'valide')
  const demandesRejetees = demandesFiltrees.filter(d => d.statut === 'rejete')

  const statsParMois = (() => {
    const mois = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(); date.setMonth(date.getMonth() - i)
      const label = date.toLocaleDateString('fr-FR', { month: 'short' })
      const moisNum = date.getMonth(); const annee = date.getFullYear()
      const dm = toutesLesDemandes.filter(d => { const d2 = new Date(d.created_at); return d2.getMonth() === moisNum && d2.getFullYear() === annee }).length
      const dn = dons.filter(d => { const d2 = new Date(d.created_at); return d2.getMonth() === moisNum && d2.getFullYear() === annee }).length
      const mt = dons.filter(d => { const d2 = new Date(d.created_at); return d2.getMonth() === moisNum && d2.getFullYear() === annee }).reduce((sum, d) => sum + (parseInt(d.montant) || 0), 0)
      mois.push({ label, demandes: dm, dons: dn, montant: mt })
    }
    return mois
  })()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-green-600">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-blue-100 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600">
      {/* Header */}
      <div className="border-b border-white border-opacity-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Tableau de bord Admin</h1>
              <p className="text-blue-100 text-sm mt-1">Gérez les demandes, suivez les statistiques en temps réel</p>
            </div>
            <div className="bg-white bg-opacity-20 border border-white border-opacity-30 text-white px-4 py-2 rounded-xl text-sm font-medium">● Système actif</div>
          </div>
          <div className="flex gap-1 mt-6 bg-white bg-opacity-20 rounded-xl p-1 w-fit overflow-x-auto">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'en_attente', label: `En attente (${nbEnAttente})` },
              { key: 'valide', label: `Validés (${nbValides})` },
              { key: 'rejete', label: `Rejetés (${nbRejetes})` },
              { key: 'aide', label: `Aidés (${nbAides})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => { setOngletActif(tab.key); setPage(1) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${ongletActif === tab.key ? 'bg-white text-blue-700 shadow-sm' : 'text-white hover:bg-white hover:bg-opacity-10'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {ongletActif === 'dashboard' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'users', label: 'Visiteurs uniques', value: visitors, bar: 'bg-blue-300' },
                { icon: 'heart', label: 'Donateurs', value: stats?.donateurs || 0, bar: 'bg-green-300' },
                { icon: 'handshake', label: 'Personnes aidées', value: stats?.beneficiairesAides || 0, bar: 'bg-orange-300' },
                { icon: 'dollar', label: 'Dons collectés', value: `${(stats?.donsTotaux || 0).toLocaleString()} F`, bar: 'bg-purple-300' },
              ].map(({ icon, label, value, bar }) => (
                <div key={label} className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-5 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${bar}`} />
                  <div className="mb-2 text-blue-200">
                    {icon === 'users' && <Users size={20} />}
                    {icon === 'heart' && <HandHeart size={20} />}
                    {icon === 'handshake' && <CheckCircle size={20} />}
                    {icon === 'dollar' && <DollarSign size={20} />}
                  </div>
                  <p className="text-xs text-blue-200 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-2xl font-black mt-1 text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Graphiques */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-1">Répartition des demandes</h3>
                <p className="text-xs text-blue-200 mb-4">{totalDemandes} demande(s) au total</p>
                <DonutChart valide={nbValides} rejete={nbRejetes} enAttente={nbEnAttente} />
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-blue-100">Taux de validation</span>
                    <span className="text-sm font-bold text-green-300">{tauxValidation}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${tauxValidation}%` }} />
                  </div>
                </div>
              </div>
              <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-1">Top besoins exprimés</h3>
                <p className="text-xs text-blue-200 mb-4">Catégories les plus demandées</p>
                {topBesoins.length > 0 ? <BarChart data={topBesoins} /> : <div className="h-24 flex items-center justify-center text-blue-200 text-sm">Pas encore de données</div>}
              </div>
            </div>

            {/* Résumé */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-amber-400 bg-opacity-20 border border-amber-300 border-opacity-30 rounded-2xl p-5">
                <p className="text-amber-200 font-bold text-lg">{nbEnAttente}</p>
                <p className="text-amber-200 text-sm mt-1">demande(s) en attente</p>
                <button onClick={() => setOngletActif('en_attente')} className="mt-3 text-xs text-amber-200 font-semibold hover:text-white">Traiter maintenant →</button>
              </div>
              <div className="bg-green-400 bg-opacity-20 border border-green-300 border-opacity-30 rounded-2xl p-5">
                <p className="text-green-200 font-bold text-lg">{nbValides}</p>
                <p className="text-green-200 text-sm mt-1">bénéficiaire(s) validé(s)</p>
                <button onClick={() => setOngletActif('valide')} className="mt-3 text-xs text-green-200 font-semibold hover:text-white">Voir la liste →</button>
              </div>
              <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-5">
                <p className="text-white font-bold text-lg">{stats?.pointsDistribues || 0}</p>
                <p className="text-blue-100 text-sm mt-1">points de générosité distribués</p>
              </div>
            </div>

            {/* Stats par mois */}
            <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-1">Évolution sur 6 mois</h3>
              <p className="text-xs text-blue-200 mb-6">Demandes et dons par mois</p>
              <div className="grid grid-cols-6 gap-3">
                {statsParMois.map((m, i) => {
                  const maxD = Math.max(...statsParMois.map(x => x.demandes), 1)
                  const maxN = Math.max(...statsParMois.map(x => x.dons), 1)
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="flex items-end gap-1 h-24">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-blue-200">{m.demandes}</span>
                          <div className="w-5 bg-white bg-opacity-60 rounded-t transition-all" style={{ height: `${Math.max((m.demandes / maxD) * 70, m.demandes > 0 ? 8 : 0)}px` }} />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-blue-200">{m.dons}</span>
                          <div className="w-5 bg-green-300 bg-opacity-80 rounded-t transition-all" style={{ height: `${Math.max((m.dons / maxN) * 70, m.dons > 0 ? 8 : 0)}px` }} />
                        </div>
                      </div>
                      <span className="text-xs text-blue-200 font-medium">{m.label}</span>
                      {m.montant > 0 && <span className="text-xs text-amber-300">{(m.montant / 1000).toFixed(0)}k</span>}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white bg-opacity-60 rounded-sm"></div><span className="text-xs text-blue-200">Demandes</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-300 rounded-sm"></div><span className="text-xs text-blue-200">Dons</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-300 rounded-sm"></div><span className="text-xs text-blue-200">Montant (k FCFA)</span></div>
              </div>
            </div>
          </div>
        )}

        {ongletActif !== 'dashboard' && (
          <div className="space-y-4">
            <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-4 flex items-center gap-3">
              <Search size={16} className="text-blue-200 flex-shrink-0" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, email, ville..."
                className="flex-1 text-sm focus:outline-none text-white placeholder-blue-300 bg-transparent" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="text-blue-300 hover:text-white text-sm">✕</button>}
            </div>

            {ongletActif === 'en_attente' && (
              demandesEnAttente.length === 0 ? (
                <div className="text-center py-16 bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-white font-medium">Aucune demande en attente</p>
                  <p className="text-blue-100 text-sm mt-1">Toutes les demandes ont été traitées !</p>
                </div>
              ) : demandesEnAttente.map((demande) => (
                <div key={demande.id} className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{demande.prenom} {demande.nom}</h3>
                      <p className="text-blue-100 text-sm mt-1">{demande.telephone} · {demande.email}</p>
                      <p className="text-blue-200 text-sm">{demande.adresse}, {demande.ville}</p>
                      {demande.numero_paiement && <p className="text-green-300 text-sm mt-1 font-medium">Wave/OM : {demande.numero_paiement}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="bg-amber-400 bg-opacity-20 text-amber-200 text-xs px-3 py-1 rounded-full font-semibold border border-amber-300 border-opacity-30">En attente</span>
                      <button onClick={() => setSelectedDemande(demande)} className="bg-white text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-50 text-sm font-medium transition">Examiner</button>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-white bg-opacity-10 rounded-xl">
                    <p className="text-sm text-blue-100"><strong className="text-white">Besoin :</strong> {demande.type_besoin}</p>
                    <p className="text-sm mt-2 text-blue-100"><strong className="text-white">Description :</strong> {demande.description}</p>
                    <p className="text-sm mt-2 text-blue-100"><strong className="text-white">Preuve :</strong> {demande.preuve_type}</p>
                    {demande.preuve_fichier && (
                      <button onClick={() => setPreuveModal({ src: demande.preuve_fichier, type: demande.preuve_type })} className="text-blue-200 hover:text-white text-sm mt-2 font-medium">Voir la preuve</button>
                    )}
                  </div>
                </div>
              ))
            )}

            {ongletActif === 'valide' && (
              demandesValides.length === 0 ? (
                <div className="text-center py-16 bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl"><p className="text-blue-100">Aucune demande validée</p></div>
              ) : demandesValides.map((demande) => (
                <div key={demande.id} className="bg-white bg-opacity-15 border-l-4 border-green-400 rounded-2xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{demande.prenom} {demande.nom}</h3>
                      <p className="text-blue-100 text-sm">{demande.telephone} · {demande.email}</p>
                      {demande.numero_paiement && <p className="text-green-300 text-sm mt-1 font-medium">Wave/OM : {demande.numero_paiement}</p>}
                    </div>
                    <span className="bg-green-400 bg-opacity-20 text-green-200 text-xs px-3 py-1 rounded-full font-semibold border border-green-300 border-opacity-30">Validé</span>
                  </div>
                  <div className="mt-4 p-4 bg-white bg-opacity-10 rounded-xl">
                    <p className="text-sm text-blue-100"><strong className="text-white">Besoin :</strong> {demande.type_besoin}</p>
                    <p className="text-sm mt-2 text-blue-100"><strong className="text-white">Description :</strong> {demande.description}</p>
                  </div>
                  {demande.admin_message && <p className="mt-3 text-sm text-green-200 bg-green-400 bg-opacity-20 px-4 py-2 rounded-lg">Message envoyé : {demande.admin_message}</p>}
                </div>
              ))
            )}

            {ongletActif === 'rejete' && (
              demandesRejetees.length === 0 ? (
                <div className="text-center py-16 bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl"><p className="text-blue-100">Aucune demande rejetée</p></div>
              ) : demandesRejetees.map((demande) => (
                <div key={demande.id} className="bg-white bg-opacity-15 border-l-4 border-red-400 rounded-2xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{demande.prenom} {demande.nom}</h3>
                      <p className="text-blue-100 text-sm">{demande.telephone} · {demande.email}</p>
                    </div>
                    <span className="bg-red-400 bg-opacity-20 text-red-200 text-xs px-3 py-1 rounded-full font-semibold border border-red-300 border-opacity-30">Rejeté</span>
                  </div>
                  <div className="mt-4 p-4 bg-white bg-opacity-10 rounded-xl">
                    <p className="text-sm text-blue-100"><strong className="text-white">Besoin :</strong> {demande.type_besoin}</p>
                    <p className="text-sm mt-2 text-blue-100"><strong className="text-white">Description :</strong> {demande.description}</p>
                  </div>
                  {demande.admin_message && <p className="mt-3 text-sm text-red-200 bg-red-400 bg-opacity-20 px-4 py-2 rounded-lg">Motif : {demande.admin_message}</p>}
                </div>
              ))
            )}

            {ongletActif === 'aide' && (
              demandesAides.length === 0 ? (
                <div className="text-center py-16 bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl"><p className="text-blue-100">Aucun bénéficiaire aidé</p></div>
              ) : demandesAides.map((demande) => (
                <div key={demande.id} className="bg-white bg-opacity-15 border-l-4 border-blue-300 rounded-2xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{demande.prenom} {demande.nom}</h3>
                      <p className="text-blue-100 text-sm mt-1">{demande.telephone} · {demande.email}</p>
                      {demande.numero_paiement && <p className="text-green-300 text-sm mt-1 font-medium">Wave/OM : {demande.numero_paiement}</p>}
                      {demande.date_aide && <p className="text-blue-200 text-xs mt-1">Aidé le {new Date(demande.date_aide).toLocaleDateString('fr-FR')}{demande.aidant_email && ` par ${demande.aidant_email}`}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded-full font-semibold border border-white border-opacity-30">Aidé</span>
                      <button onClick={() => handleArchiver(demande.id)} className="bg-red-400 bg-opacity-20 border border-red-300 border-opacity-30 text-red-200 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-opacity-30 transition">Retirer de la liste</button>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-white bg-opacity-10 rounded-xl">
                    <p className="text-sm text-blue-100"><strong className="text-white">Besoin :</strong> {demande.type_besoin}</p>
                    <p className="text-sm mt-2 text-blue-100"><strong className="text-white">Description :</strong> {demande.description}</p>
                    {demande.temoignage && <p className="text-sm mt-2 text-green-300 italic">"{demande.temoignage}"</p>}
                  </div>
                </div>
              ))
            )}

            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </div>

      {preuveModal && <PreuveModal preuve={preuveModal.src} type={preuveModal.type} onClose={() => setPreuveModal(null)} />}

      {selectedDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-black text-gray-800">Examiner la demande</h2>
                <button onClick={() => setSelectedDemande(null)} className="text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {[{ label: 'Nom complet', value: `${selectedDemande.prenom} ${selectedDemande.nom}` }, { label: 'Téléphone', value: selectedDemande.telephone }, { label: 'Email', value: selectedDemande.email }, { label: 'Adresse', value: `${selectedDemande.adresse}, ${selectedDemande.ville}` }, { label: 'Wave/OM', value: selectedDemande.numero_paiement || 'Non renseigné' }, { label: 'Type de preuve', value: selectedDemande.preuve_type }].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                    <p className="text-gray-800 font-medium mt-1 text-sm">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <p className="text-sm font-bold text-blue-700 mb-1">Besoin : {selectedDemande.type_besoin}</p>
                <p className="text-sm text-blue-600 mt-2">{selectedDemande.description}</p>
                {selectedDemande.situation && <p className="text-sm text-blue-400 mt-2 italic">"{selectedDemande.situation}"</p>}
              </div>
              {selectedDemande.preuve_fichier && (
                <button onClick={() => setPreuveModal({ src: selectedDemande.preuve_fichier, type: selectedDemande.preuve_type })}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-xl text-sm font-medium mb-4 transition w-full hover:bg-blue-100">
                  Voir le fichier preuve
                </button>
              )}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2 text-sm">Message au demandeur</label>
                <textarea rows="3" value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)} placeholder="Expliquez votre décision..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleValider(selectedDemande.id)} disabled={envoiEnCours} className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:bg-gray-300 font-bold transition">{envoiEnCours ? 'Envoi...' : 'Valider & Notifier'}</button>
                <button onClick={() => handleRejeter(selectedDemande.id)} className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 font-bold transition">Rejeter</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
