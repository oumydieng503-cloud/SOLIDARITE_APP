import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLocation } from 'react-router-dom'
import { getDemandesValides, createDon } from '../api/api'

const inputClass = "w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
const labelClass = "block text-slate-300 text-sm font-medium mb-2"

function Donate() {
  const { user, refreshUser } = useAuth()
  const location = useLocation()

  const [montant, setMontant] = useState('')
  const [typeDon, setTypeDon] = useState('argent')
  const [message, setMessage] = useState('')
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState('general')
  const [modePaiement, setModePaiement] = useState('wave')
  const [description, setDescription] = useState('')
  const [beneficiaires, setBeneficiaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  // ✅ Charger depuis l'API Supabase
  useEffect(() => {
    async function charger() {
      const data = await getDemandesValides(1, 100)
      const list = [
        { id: 'general', nom: 'Fonds général', type_besoin: '', telephone: '', numero_paiement: '', adresse: '', ville: '' },
        ...(data.demandes || []).map(b => ({
          id: b.id,
          nom: `${b.prenom} ${b.nom}`,
          type_besoin: b.type_besoin,
          telephone: b.telephone,
          numero_paiement: b.numero_paiement || b.telephone,
          adresse: b.adresse,
          ville: b.ville,
          description: b.description
        }))
      ]
      setBeneficiaires(list)

      // ✅ Pré-sélectionner si venu de la page Beneficiaries
      if (location.state?.beneficiaire) {
        const benef = location.state.beneficiaire
        const found = list.find(b => b.id === benef.id)
        if (found) setSelectedBeneficiaire(found.id)
      }
      setLoading(false)
    }
    charger()
  }, [location.state])

  const beneficiaireSelectionne = useMemo(
    () => beneficiaires.find(b => b.id === selectedBeneficiaire),
    [beneficiaires, selectedBeneficiaire]
  )

  if (user?.role === 'beneficiaire') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800 border border-amber-500 border-opacity-30 rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Accès réservé</h2>
          <p className="text-slate-400 mb-6">
            Vous êtes inscrit en tant que <strong className="text-white">bénéficiaire</strong>.
            Seuls les donateurs peuvent faire des dons.
          </p>
          <a href="/request" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition font-medium">
            Faire une demande d'aide
          </a>
        </div>
      </div>
    )
  }

  // ✅ Ouvrir Wave ou Orange Money avec le numéro du bénéficiaire
  const ouvrirAppPaiement = (mode) => {
    setModePaiement(mode)
    const numero = beneficiaireSelectionne?.numero_paiement
    if (!numero || selectedBeneficiaire === 'general') return

    // Formater le numéro sénégalais
    let tel = numero.replace(/\s/g, '').replace(/-/g, '')
    if (!tel.startsWith('+')) {
      tel = tel.startsWith('221') ? '+' + tel : '+221' + tel
    }

    const montantVal = parseInt(montant) || 0

    if (mode === 'wave') {
      // Wave deep link — fonctionne sur mobile
      const waveLink = `wave://send?phone=${tel}&amount=${montantVal}`
      const waveFallback = `https://paywithwave.com/pay?phone=${tel}&amount=${montantVal}`
      // Essayer d'ouvrir l'app, sinon le site web
      const a = document.createElement('a')
      a.href = waveLink
      a.click()
      // Fallback après 1.5s si l'app ne s'ouvre pas
      setTimeout(() => {
        window.open(waveFallback, '_blank')
      }, 1500)
    } else if (mode === 'orange') {
      // Orange Money — ouvrir le dialer avec le numéro
      window.open(`tel:${tel}`, '_self')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!beneficiaireSelectionne) return

    const donData = {
      donateur_email: user?.email,
      type_don: typeDon,
      montant: typeDon === 'argent' ? parseInt(montant) : null,
      description: typeDon !== 'argent' ? description : null,
      beneficiaire_id: String(selectedBeneficiaire),
      beneficiaire_nom: beneficiaireSelectionne.nom,
      beneficiaire_contact: beneficiaireSelectionne.telephone,
      beneficiaire_paiement: beneficiaireSelectionne.numero_paiement,
      mode_paiement: modePaiement,
      points_gagnes: typeDon === 'argent' ? Math.floor((parseInt(montant) || 0) / 1000) : 10
    }

    const result = await createDon(donData)
    if (!result.success) {
      alert('Erreur : ' + result.message)
      return
    }

    setMessage(
      `Don confirmé ! Bénéficiaire : ${beneficiaireSelectionne.nom}. ` +
      `${montant ? parseInt(montant).toLocaleString() + ' FCFA' : description || typeDon} via ${modePaiement}. ` +
      `Merci pour votre générosité !`
    )
    setSubmitted(true)
    setMontant('')
    setDescription('')
    // ✅ Rafraîchir les points du donateur
    await refreshUser()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest">Solidarité</span>
          <h1 className="text-4xl font-black text-white mt-2 mb-2">Faire un don</h1>
          <p className="text-slate-400">Votre aide va directement au bénéficiaire — sans intermédiaire.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl">

        {/* Message succès */}
        {message && (
          <div className="bg-emerald-500 bg-opacity-10 border border-emerald-500 border-opacity-30 text-emerald-400 px-4 py-4 rounded-xl mb-6">
            {message}
            {submitted && (
              <button onClick={() => { setMessage(''); setSubmitted(false) }}
                className="block mt-3 text-sm text-emerald-300 underline">
                Faire un autre don
              </button>
            )}
          </div>
        )}

        {!submitted && (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Choisir le bénéficiaire */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-slate-700">
                À qui voulez-vous aider ?
              </h2>

              <div className="space-y-3">
                {beneficiaires.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBeneficiaire(b.id)}
                    className={`w-full text-left px-4 py-4 rounded-xl border transition-all ${
                      selectedBeneficiaire === b.id
                        ? 'bg-blue-600 bg-opacity-20 border-blue-500 border-opacity-50'
                        : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{b.nom}</p>
                        {b.type_besoin && (
                          <p className="text-slate-400 text-sm mt-0.5 capitalize">{b.type_besoin} — {b.ville}</p>
                        )}
                        {b.description && (
                          <p className="text-slate-500 text-xs mt-1 line-clamp-1">{b.description}</p>
                        )}
                      </div>
                      {selectedBeneficiaire === b.id && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    {selectedBeneficiaire === b.id && b.numero_paiement && b.id !== 'general' && (
                      <p className="text-emerald-400 text-xs mt-2 font-medium">
                        Wave/OM : {b.numero_paiement}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Type de don */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-slate-700">
                Type de don
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'argent', label: 'Argent' },
                  { value: 'nourriture', label: 'Nourriture' },
                  { value: 'vetements', label: 'Vêtements' },
                  { value: 'materiel', label: 'Matériel handicap' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTypeDon(option.value)}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                      typeDon === option.value
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                {typeDon === 'argent' ? (
                  <div>
                    <label className={labelClass}>Montant (FCFA)</label>
                    <input
                      type="number"
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                      placeholder="Ex: 5000"
                      className={inputClass}
                    />
                    <p className="text-slate-500 text-xs mt-2">Même 100 FCFA fait la différence !</p>
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez ce que vous donnez..."
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 3. Mode de paiement */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-2 pb-3 border-b border-slate-700">
                Mode de paiement
              </h2>

              {selectedBeneficiaire !== 'general' && beneficiaireSelectionne?.numero_paiement && (
                <div className="mb-4 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-xl p-3">
                  <p className="text-blue-300 text-sm font-medium">Numéro du bénéficiaire</p>
                  <p className="text-white font-black text-lg">{beneficiaireSelectionne.numero_paiement}</p>
                  <p className="text-slate-400 text-xs mt-1">Ce numéro sera utilisé pour le transfert</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Wave */}
                <button
                  type="button"
                  onClick={() => ouvrirAppPaiement('wave')}
                  className={`py-4 px-4 rounded-xl border transition flex flex-col items-center gap-1 ${
                    modePaiement === 'wave'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-500'
                  }`}
                >
                  <span className="font-bold text-sm">Wave</span>
                  {selectedBeneficiaire !== 'general' && (
                    <span className="text-xs opacity-70">Ouvrir Wave</span>
                  )}
                </button>

                {/* Orange Money */}
                <button
                  type="button"
                  onClick={() => ouvrirAppPaiement('orange')}
                  className={`py-4 px-4 rounded-xl border transition flex flex-col items-center gap-1 ${
                    modePaiement === 'orange'
                      ? 'bg-orange-600 border-orange-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-orange-500'
                  }`}
                >
                  <span className="font-bold text-sm">Orange Money</span>
                  {selectedBeneficiaire !== 'general' && (
                    <span className="text-xs opacity-70">Ouvrir OM</span>
                  )}
                </button>

                {/* Espèces */}
                <button
                  type="button"
                  onClick={() => setModePaiement('especes')}
                  className={`col-span-2 py-4 px-4 rounded-xl border transition font-semibold text-sm ${
                    modePaiement === 'especes'
                      ? 'bg-slate-600 border-slate-400 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-400'
                  }`}
                >
                  Espèces (déposer au bureau)
                </button>
              </div>

              {/* Instructions paiement */}
              {modePaiement !== 'especes' && selectedBeneficiaire !== 'general' && beneficiaireSelectionne?.numero_paiement && (
                <div className="mt-4 bg-slate-700 rounded-xl p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white mb-1">Instructions :</p>
                  <p>1. Cliquez sur <strong>{modePaiement === 'wave' ? 'Wave' : 'Orange Money'}</strong> ci-dessus</p>
                  <p>2. Envoyez <strong>{montant ? parseInt(montant).toLocaleString() + ' FCFA' : 'le montant'}</strong></p>
                  <p>3. Au numéro : <strong className="text-white">{beneficiaireSelectionne.numero_paiement}</strong></p>
                  <p>4. Revenez ici et cliquez "Confirmer mon don"</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition text-lg shadow-lg"
            >
              Confirmer mon don
            </button>
            <p className="text-xs text-slate-500 text-center">
              Après validation du paiement, votre don sera transmis au bénéficiaire
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default Donate
