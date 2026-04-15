import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { useAuth } from '../hooks/useAuth'
import { createDemande } from '../api/api'

const EMAILJS_SERVICE_ID = 'service_tr58mrj'
const EMAILJS_TEMPLATE_ID = 'template_8bsgoj7'
const EMAILJS_PUBLIC_KEY = 'Re9Ab2iFhcxeifqg8'

const inputClass = "w-full px-4 py-3 bg-white bg-opacity-15 border border-white border-opacity-20 text-white placeholder-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-40 transition"
const labelClass = "block text-blue-100 text-sm font-medium mb-2"

function RequestHelp() {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    nom: user?.nom || '', prenom: user?.prenom || '',
    telephone: user?.telephone || '', email: user?.email || '',
    adresse: '', ville: '', numeroPaiement: '',
    typeBesoin: 'nourriture', description: '',
    situation: '', preuveType: '', preuveFichier: null
  })

  const [message, setMessage] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  if (user?.role === 'donateur') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 flex items-center justify-center px-4">
        <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Accès réservé</h2>
          <p className="text-blue-100 mb-6">
            Vous êtes inscrit en tant que <strong className="text-white">donateur</strong>.
            Seuls les bénéficiaires peuvent faire une demande d'aide.
          </p>
          <a href="/donate" className="inline-block bg-white text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-50 transition font-medium">
            Faire un don à la place
          </a>
        </div>
      </div>
    )
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('Maximum 5MB.'); return }
      const reader = new FileReader()
      reader.onloadend = () => setFormData({ ...formData, preuveFichier: reader.result })
      reader.readAsDataURL(file)
    }
  }

  const envoyerEmailAdmin = async () => {
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        nom: formData.nom, prenom: formData.prenom,
        telephone: formData.telephone, email: formData.email,
        adresse: formData.adresse, ville: formData.ville,
        numeroPaiement: formData.numeroPaiement,
        typeBesoin: formData.typeBesoin, description: formData.description,
        situation: formData.situation || 'Non renseigné',
        preuveType: formData.preuveType, date: new Date().toLocaleString()
      }, EMAILJS_PUBLIC_KEY)
      return true
    } catch (error) { console.error(error); return false }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.preuveFichier) { alert('Veuillez fournir une preuve.'); return }
    setEnvoiEnCours(true)
    const result = await createDemande({
      nom: formData.nom, prenom: formData.prenom,
      telephone: formData.telephone, email: formData.email,
      adresse: formData.adresse, ville: formData.ville,
      numero_paiement: formData.numeroPaiement,
      type_besoin: formData.typeBesoin, description: formData.description,
      situation: formData.situation, preuve_type: formData.preuveType,
      preuve_fichier: formData.preuveFichier
    })
    if (!result.success) { alert('Erreur : ' + result.message); setEnvoiEnCours(false); return }
    await envoyerEmailAdmin()
    setMessage("Votre demande a été envoyée ! Vous serez recontacté sous 48h.")
    setEnvoye(true)
    setFormData({ nom: '', prenom: '', telephone: '', email: '', adresse: '', ville: '', numeroPaiement: '', typeBesoin: 'nourriture', description: '', situation: '', preuveType: '', preuveFichier: null })
    setEnvoiEnCours(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600">

      {/* Header */}
      <div className="border-b border-white border-opacity-20">
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <span className="text-green-200 font-semibold text-sm uppercase tracking-widest">Formulaire</span>
          <h1 className="text-4xl font-black text-white mt-2 mb-3">Demander de l'aide</h1>
          <p className="text-blue-100">Remplissez ce formulaire. Votre demande sera étudiée par notre équipe sous 48h.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl">

        {message && (
          <div className="bg-green-400 bg-opacity-20 border border-green-300 border-opacity-30 text-green-200 px-4 py-4 rounded-xl mb-6">
            {message}
          </div>
        )}

        {!envoye ? (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Informations personnelles */}
            <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-white border-opacity-20">
                Vos informations personnelles
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Prénom', name: 'prenom', type: 'text' },
                  { label: 'Nom', name: 'nom', type: 'text' },
                  { label: 'Téléphone', name: 'telephone', type: 'tel', placeholder: '77 123 45 67' },
                  { label: 'Email', name: 'email', type: 'email', placeholder: 'votre@email.com' },
                  { label: 'Adresse', name: 'adresse', type: 'text', placeholder: 'Quartier, rue' },
                  { label: 'Ville', name: 'ville', type: 'text', placeholder: 'Dakar, Thiès...' },
                ].map(field => (
                  <div key={field.name}>
                    <label className={labelClass}>{field.label} *</label>
                    <input type={field.type} name={field.name} value={formData[field.name]}
                      onChange={handleChange} required placeholder={field.placeholder || ''}
                      className={inputClass} />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className={labelClass}>Numéro Wave / Orange Money *</label>
                  <input type="tel" name="numeroPaiement" value={formData.numeroPaiement}
                    onChange={handleChange} required placeholder="77 123 45 67" className={inputClass} />
                  <p className="text-xs text-blue-200 mt-2">Les donateurs enverront l'argent directement sur ce numéro</p>
                </div>
              </div>
            </div>

            {/* Votre besoin */}
            <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-white border-opacity-20">Votre besoin</h2>

              <div className="mb-4">
                <label className={labelClass}>Type de besoin *</label>
                <select name="typeBesoin" value={formData.typeBesoin} onChange={handleChange} className={inputClass}>
                  <option value="nourriture" className="bg-blue-700">Nourriture</option>
                  <option value="medical" className="bg-blue-700">Médical / Santé</option>
                  <option value="handicap" className="bg-blue-700">Matériel handicap</option>
                  <option value="education" className="bg-blue-700">Éducation / Scolarité</option>
                  <option value="logement" className="bg-blue-700">Logement</option>
                  <option value="argent" className="bg-blue-700">Aide financière</option>
                  <option value="autre" className="bg-blue-700">Autre</option>
                </select>
              </div>

              <div className="mb-4">
                <label className={labelClass}>Description détaillée *</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  required rows="4" placeholder="Décrivez précisément votre situation et ce dont vous avez besoin..."
                  className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Votre histoire (optionnel)</label>
                <textarea name="situation" value={formData.situation} onChange={handleChange}
                  rows="3" placeholder="Partagez votre histoire pour nous aider à mieux comprendre..."
                  className={inputClass} />
              </div>
            </div>

            {/* Preuves */}
            <div className="bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white border-opacity-20">
                <h2 className="text-lg font-bold text-white">Preuve (obligatoire)</h2>
                <span className="bg-red-400 bg-opacity-20 text-red-200 border border-red-300 border-opacity-30 text-xs px-3 py-1 rounded-full font-semibold">Requis</span>
              </div>

              <div className="mb-4">
                <label className={labelClass}>Type de preuve *</label>
                <select name="preuveType" value={formData.preuveType} onChange={handleChange} required className={inputClass}>
                  <option value="" className="bg-blue-700">Sélectionnez le type de preuve</option>
                  <option value="certificat_handicap" className="bg-blue-700">Certificat de handicap</option>
                  <option value="certificat_deces" className="bg-blue-700">Certificat de décès</option>
                  <option value="carte_didentite" className="bg-blue-700">Carte d'identité</option>
                  <option value="certificat_medical" className="bg-blue-700">Certificat médical</option>
                  <option value="attestation" className="bg-blue-700">Attestation</option>
                  <option value="photo" className="bg-blue-700">Photo de situation</option>
                  <option value="autre" className="bg-blue-700">Autre preuve</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Fichier preuve (photo, PDF, etc.) *</label>
                <input type="file" onChange={handleFileChange} accept="image/*,.pdf" required
                  className="w-full px-4 py-3 bg-white bg-opacity-15 border border-white border-opacity-20 text-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-40 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-blue-700 file:font-medium file:cursor-pointer hover:file:bg-blue-50" />
                <p className="text-xs text-blue-200 mt-2">Formats acceptés : JPG, PNG, PDF (max 5MB)</p>
                {formData.preuveFichier && <p className="text-xs text-green-300 mt-2">✓ Fichier chargé avec succès</p>}
              </div>
            </div>

            <button type="submit" disabled={envoiEnCours}
              className="w-full bg-white text-blue-700 hover:bg-blue-50 disabled:bg-white disabled:opacity-50 font-bold py-4 rounded-xl transition text-lg shadow-lg">
              {envoiEnCours ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>
            <p className="text-xs text-blue-200 text-center">Toute demande sans preuve sera automatiquement rejetée.</p>
          </form>
        ) : (
          <div className="text-center py-16 bg-white bg-opacity-15 border border-white border-opacity-20 rounded-2xl">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-white mb-2">Demande envoyée !</h3>
            <p className="text-blue-100 mb-6">Notre équipe étudiera votre demande sous 48h.</p>
            <button onClick={() => setEnvoye(false)}
              className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-medium transition">
              Faire une nouvelle demande
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestHelp
