import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLocation } from 'react-router-dom'
import { getDemandesValides, createDon } from '../api/api'

const NUMERO_GENERAL = '770705173' // ← Votre numéro pour le fond général

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
const labelClass = "block text-gray-700 text-sm font-medium mb-2"

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

  useEffect(() => {
    async function charger() {
      const data = await getDemandesValides(1, 100)
      const list = [
        {
          id: 'general',
          nom: 'Fonds général',
          type_besoin: '',
          telephone: NUMERO_GENERAL,
          numero_paiement: NUMERO_GENERAL,
          adresse: '',
          ville: '',
          description: 'Distribution équitable entre tous les bénéficiaires'
        },
        ...(data.demandes || []).map(b => ({
          id: b.id, nom: `${b.prenom} ${b.nom}`, type_besoin: b.type_besoin,
          telephone: b.telephone, numero_paiement: b.numero_paiement || b.telephone,
          adresse: b.adresse, ville: b.ville, description: b.description
        }))
      ]
      setBeneficiaires(list)
      if (location.state?.beneficiaire) {
        const found = list.find(b => b.id === location.state.beneficiaire.id)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-amber-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Accès réservé</h2>
          <p className="text-gray-500 mb-6">Vous êtes inscrit en tant que <strong className="text-gray-800">bénéficiaire</strong>. Seuls les donateurs peuvent faire des dons.</p>
          <a href="/request" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium shadow-sm">
            Faire une demande d'aide
          </a>
        </div>
      </div>
    )
  }

  // ✅ Fonction Wave corrigée — ouvre directement l'écran de saisie
  const ouvrirWave = (numero, montantVal) => {
    let tel = numero.replace(/\s/g, '').replace(/-/g, '')
    if (!tel.startsWith('+')) tel = tel.startsWith('221') ? '+' + tel : '+221' + tel
    const amount = parseInt(montantVal) || 1 // ✅ amount=1 minimum pour ouvrir l'écran de saisie
    const a = document.createElement('a')
    a.href = `wave://send?phone=${tel}&amount=${amount}`
    a.click()
    // Fallback web si l'app Wave n'est pas installée
    setTimeout(() => window.open(`https://paywithwave.com/pay?phone=${tel}&amount=${amount}`, '_blank'), 1500)
  }

  const ouvrirOrangeMoney = (numero) => {
    let tel = numero.replace(/\s/g, '').replace(/-/g, '')
    if (!tel.startsWith('+')) tel = tel.startsWith('221') ? '+' + tel : '+221' + tel
    window.open(`tel:${tel}`, '_self')
  }

  const ouvrirAppPaiement = (mode) => {
    setModePaiement(mode)
    const numero = selectedBeneficiaire === 'general'
      ? NUMERO_GENERAL
      : beneficiaireSelectionne?.numero_paiement
    if (!numero) return

    if (mode === 'wave') {
      ouvrirWave(numero, montant)
    } else if (mode === 'orange') {
      ouvrirOrangeMoney(numero)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!beneficiaireSelectionne) return

    const numeroFinal = selectedBeneficiaire === 'general'
      ? NUMERO_GENERAL
      : beneficiaireSelectionne.numero_paiement

    const donData = {
      donateur_email: user?.email,
      type_don: typeDon,
      montant: typeDon === 'argent' ? parseInt(montant) : null,
      description: typeDon !== 'argent' ? description : null,
      beneficiaire_id: String(selectedBeneficiaire),
      beneficiaire_nom: beneficiaireSelectionne.nom,
      beneficiaire_contact: beneficiaireSelectionne.telephone,
      beneficiaire_paiement: numeroFinal,
      mode_paiement: modePaiement,
      points_gagnes: typeDon === 'argent' ? Math.floor((parseInt(montant) || 0) / 1000) : 10
    }

    const result = await createDon(donData)
    if (!result.success) { alert('Erreur : ' + result.message); return }

    setMessage(`Don confirmé ! Bénéficiaire : ${beneficiaireSelectionne.nom}. ${montant ? parseInt(montant).toLocaleString() + ' FCFA' : description || typeDon} via ${modePaiement}. Merci pour votre générosité !`)
    setSubmitted(true)
    setMontant('')
    setDescription('')
    await refreshUser()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const numeroActuel = selectedBeneficiaire === 'general'
    ? NUMERO_GENERAL
    : beneficiaireSelectionne?.numero_paiement

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">AidLink</span>
          <h1 className="text-4xl font-black text-gray-800 mt-2 mb-2">Faire un don</h1>
          <p className="text-gray-500">Votre aide va directement au bénéficiaire — sans intermédiaire.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl mb-6">
            {message}
            {submitted && (
              <button onClick={() => { setMessage(''); setSubmitted(false) }}
                className="block mt-3 text-sm text-green-600 underline">Faire un autre don</button>
            )}
          </div>
        )}

        {!submitted && (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Bénéficiaire */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">À qui voulez-vous aider ?</h2>
              <div className="space-y-3">
                {beneficiaires.map(b => (
                  <button key={b.id} type="button" onClick={() => setSelectedBeneficiaire(b.id)}
                    className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-all ${
                      selectedBeneficiaire === b.id
                        ? 'bg-blue-50 border-blue-400'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{b.nom}</p>
                        {b.type_besoin && <p className="text-gray-500 text-sm mt-0.5 capitalize">{b.type_besoin} — {b.ville}</p>}
                        {b.description && <p className="text-gray-400 text-xs mt-1 line-clamp-1">{b.description}</p>}
                      </div>
                      {selectedBeneficiaire === b.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    {selectedBeneficiaire === b.id && (
                      <p className="text-green-600 text-xs mt-2 font-medium">
                        Wave/OM : {b.id === 'general' ? NUMERO_GENERAL : b.numero_paiement}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Type de don */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">Type de don</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'argent', label: 'Argent' },
                  { value: 'nourriture', label: 'Nourriture' },
                  { value: 'vetements', label: 'Vêtements' },
                  { value: 'materiel', label: 'Matériel handicap' },
                ].map(option => (
                  <button key={option.value} type="button" onClick={() => setTypeDon(option.value)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition ${
                      typeDon === option.value ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}>
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                {typeDon === 'argent' ? (
                  <div>
                    <label className={labelClass}>Montant (FCFA)</label>
                    <input type="number" value={montant} onChange={(e) => setMontant(e.target.value)}
                      placeholder="Ex: 5000" className={inputClass} />
                    <p className="text-gray-400 text-xs mt-2">Même 100 FCFA fait la différence !</p>
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez ce que vous donnez..." className={inputClass} />
                  </div>
                )}
              </div>
            </div>

            {/* Mode paiement */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">Mode de paiement</h2>

              {/* ✅ Numéro toujours affiché */}
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-blue-600 text-sm font-medium">
                  {selectedBeneficiaire === 'general' ? 'Numéro AidLink (Fonds général)' : 'Numéro du bénéficiaire'}
                </p>
                <p className="text-blue-800 font-black text-lg">{numeroActuel}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* ✅ Wave — ouvre directement l'écran de saisie avec le numéro et montant */}
                <button type="button" onClick={() => ouvrirAppPaiement('wave')}
                  className={`py-4 px-4 rounded-xl border-2 transition flex flex-col items-center gap-1 ${
                    modePaiement === 'wave' ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}>
                  <span className="font-bold text-sm">Wave</span>
                  <span className="text-xs opacity-70">Ouvrir Wave</span>
                </button>
                <button type="button" onClick={() => ouvrirAppPaiement('orange')}
                  className={`py-4 px-4 rounded-xl border-2 transition flex flex-col items-center gap-1 ${
                    modePaiement === 'orange' ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}>
                  <span className="font-bold text-sm">Orange Money</span>
                  <span className="text-xs opacity-70">Ouvrir OM</span>
                </button>
                <button type="button" onClick={() => setModePaiement('especes')}
                  className={`col-span-2 py-4 px-4 rounded-xl border-2 transition font-semibold text-sm ${
                    modePaiement === 'especes' ? 'bg-gray-600 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}>
                  Espèces (déposer au bureau)
                </button>
              </div>

              {modePaiement !== 'especes' && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800 mb-1">Instructions :</p>
                  <p>1. Cliquez sur <strong>{modePaiement === 'wave' ? 'Wave' : 'Orange Money'}</strong> — l'app s'ouvre avec le numéro pré-rempli</p>
                  <p>2. Saisissez le montant : <strong>{montant ? parseInt(montant).toLocaleString() + ' FCFA' : 'le montant souhaité'}</strong></p>
                  <p>3. Numéro : <strong className="text-gray-800">{numeroActuel}</strong></p>
                  <p>4. Revenez ici et cliquez "Confirmer mon don"</p>
                </div>
              )}
            </div>

            <button type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition text-lg shadow-md">
              Confirmer mon don
            </button>
            <p className="text-xs text-gray-400 text-center">Après validation du paiement, votre don sera transmis au bénéficiaire</p>
          </form>
        )}
      </div>
    </div>
  )
}

export default Donate
