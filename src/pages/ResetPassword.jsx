import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { useAuth } from '../hooks/useAuth'
import { createDemande } from '../api/api'

const EMAILJS_SERVICE_ID = 'service_tr58mrj'
const EMAILJS_TEMPLATE_ID = 'template_8bsgoj7'
const EMAILJS_PUBLIC_KEY = 'Re9Ab2iFhcxeifqg8'

const inputClass = "w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
const labelClass = "block text-slate-300 text-sm font-medium mb-2"

function RequestHelp() {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    telephone: user?.telephone || '',
    email: user?.email || '',
    adresse: '', ville: '', numeroPaiement: '',
    typeBesoin: 'nourriture', description: '',
    situation: '', preuveType: '', preuveFichier: null
  })

  const [message, setMessage] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  if (user?.role === 'donateur') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800 border border-amber-500 border-opacity-30 rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Accès réservé</h2>
          <p className="text-slate-400 mb-6">
            Vous êtes inscrit en tant que <strong className="text-white">donateur</strong>.
            Seuls les bénéficiaires peuvent faire une demande d'aide.
          </p>
          <a href="/donate" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition font-medium">
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
    setFormData({
      nom: '', prenom: '', telephone: '', email: '',
      adresse: '', ville: '', numeroPaiement: '',
      typeBesoin: 'nourriture', description: '',
      situation: '', preuveType: '', preuveFichier: null
    })
    setEnvoiEnCours(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest">Formulaire</span>
          <h1 className="text-4xl font-black text-white mt-2 mb-3">Demander de l'aide</h1>
          <p className="text-slate-400">
            Remplissez ce formulaire. Votre demande sera étudiée par notre équipe sous 48h.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl">

        {message && (
          <div className="bg-emerald-500 bg-opacity-10 border border-emerald-500 border-opacity-30 text-emerald-400 px-4 py-4 rounded-xl mb-6">
            {message}
          </div>
        )}

        {!envoye ? (
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Informations personnelles */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-slate-700">
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
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required
                      placeholder={field.placeholder || ''}
                      className={inputClass}
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className={labelClass}>Numéro Wave / Orange Money *</label>
                  <input
                    type="tel"
                    name="numeroPaiement"
                    value={formData.numeroPaiement}
                    onChange={handleChange}
                    required
                    placeholder="77 123 45 67"
                    className={inputClass}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Les donateurs enverront l'argent directement sur ce numéro
                  </p>
                </div>
              </div>
            </div>

            {/* Votre besoin */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-slate-700">
                Votre besoin
              </h2>

              <div className="mb-4">
                <label className={labelClass}>Type de besoin *</label>
                <select
                  name="typeBesoin"
                  value={formData.typeBesoin}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="nourriture">Nourriture</option>
                  <option value="medical">Médical / Santé</option>
                  <option value="handicap">Matériel handicap</option>
                  <option value="education">Éducation / Scolarité</option>
                  <option value="logement">Logement</option>
                  <option value="argent">Aide financière</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="mb-4">
                <label className={labelClass}>Description détaillée *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Décrivez précisément votre situation et ce dont vous avez besoin..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Votre histoire (optionnel)</label>
                <textarea
                  name="situation"
                  value={formData.situation}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Partagez votre histoire pour nous aider à mieux comprendre..."
                  className={inputClass}
                />
              </div>
            </div>

            {/* Preuves */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-700">
                <h2 className="text-lg font-bold text-white">Preuve (obligatoire)</h2>
                <span className="bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30 text-xs px-3 py-1 rounded-full font-semibold">
                  Requis
                </span>
              </div>

              <div className="mb-4">
                <label className={labelClass}>Type de preuve *</label>
                <select
                  name="preuveType"
                  value={formData.preuveType}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Sélectionnez le type de preuve</option>
                  <option value="certificat_handicap">Certificat de handicap</option>
                  <option value="certificat_deces">Certificat de décès</option>
                  <option value="carte_didentite">Carte d'identité</option>
                  <option value="certificat_medical">Certificat médical</option>
                  <option value="attestation">Attestation</option>
                  <option value="photo">Photo de situation</option>
                  <option value="autre">Autre preuve</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Fichier preuve (photo, PDF, etc.) *</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-medium file:cursor-pointer hover:file:bg-blue-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Formats acceptés : JPG, PNG, PDF (max 5MB)</p>
                {formData.preuveFichier && (
                  <p className="text-xs text-emerald-400 mt-2">Fichier chargé avec succès</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={envoiEnCours}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-4 rounded-xl transition text-lg shadow-lg"
            >
              {envoiEnCours ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>
            <p className="text-xs text-slate-500 text-center">
              Toute demande sans preuve sera automatiquement rejetée.
            </p>
          </form>
        ) : (
          <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-2xl">
            <div className="text-5xl mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2">Demande envoyée !</h3>
            <p className="text-slate-400 mb-6">Notre équipe étudiera votre demande sous 48h.</p>
            <button
              onClick={() => setEnvoye(false)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              Faire une nouvelle demande
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestHelp
