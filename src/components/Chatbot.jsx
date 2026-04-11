import { useState, useRef, useEffect, useCallback } from 'react'
import { useLang } from '../context/useLang'
import { MessageCircle, X, Mic, MicOff, Send, Volume2, VolumeX, Bot } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const RESPONSES = {
  fr: [
    {
      keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'salam'],
      response: "Bonjour ! Je suis l'assistant de Solidarité App. Comment puis-je vous aider aujourd'hui ?"
    },
    {
      keywords: ['don', 'donner', 'aider', 'donate', 'faire un don'],
      response: "Pour faire un don, cliquez sur 'Faire un don' dans le menu. Vous pouvez choisir un bénéficiaire spécifique ou le fonds général. Les paiements se font via Wave ou Orange Money — directement au bénéficiaire, sans intermédiaire !"
    },
    {
      keywords: ['wave', 'paiement', 'payer', 'envoyer argent', 'transfert'],
      response: "Wave est disponible pour envoyer de l'argent directement au bénéficiaire. Cliquez sur le bouton Wave dans la page don — l'app s'ouvrira automatiquement avec le numéro pré-rempli sur mobile !"
    },
    {
      keywords: ['orange money', 'orange', 'om'],
      response: "Orange Money est aussi disponible pour vos dons. Cliquez sur Orange Money dans la page don — le numéro du bénéficiaire sera composé automatiquement sur mobile."
    },
    {
      keywords: ['demande', 'aide', 'besoin', 'bénéficiaire', 'beneficiaire', 'inscription demande'],
      response: "Pour demander de l'aide, allez sur 'Demander de l'aide' dans le menu. Remplissez le formulaire avec vos informations et fournissez une preuve (photo, certificat). Notre équipe examinera votre demande sous 48h."
    },
    {
      keywords: ['compte', 'inscription', 'créer', 'créer compte', 's\'inscrire', 'register'],
      response: "Pour créer un compte, cliquez sur 'S'inscrire'. Choisissez votre rôle : Donateur (pour aider) ou Bénéficiaire (pour recevoir de l'aide). Vous pouvez aussi vous connecter directement avec Google !"
    },
    {
      keywords: ['google', 'connexion google', 'se connecter', 'login', 'connexion'],
      response: "Vous pouvez vous connecter avec votre compte Google en cliquant sur 'Continuer avec Google' sur la page de connexion. Rapide et sécurisé !"
    },
    {
      keywords: ['mot de passe', 'password', 'oublié', 'reinitialiser', 'réinitialiser'],
      response: "Si vous avez oublié votre mot de passe, cliquez sur 'Mot de passe oublié ?' sur la page de connexion. Vous recevrez un lien de réinitialisation par email dans quelques minutes."
    },
    {
      keywords: ['point', 'points', 'générosité', 'niveau', 'ambassadeur'],
      response: "Vous gagnez des points à chaque don : 1 point par 1000 FCFA donnés. Les niveaux sont : Nouveau (0 pts), Actif (10 pts), Grand Donateur (50 pts), Ambassadeur Solidarité (100 pts). Suivez vos points dans votre tableau de bord !"
    },
    {
      keywords: ['témoignage', 'temoignage', 'histoire', 'partager'],
      response: "Les bénéficiaires qui ont reçu de l'aide peuvent partager leur témoignage depuis leur tableau de bord. Ces témoignages sont visibles sur la page Témoignages pour encourager les donateurs !"
    },
    {
      keywords: ['vérifié', 'vérification', 'preuve', 'sécurité', 'confiance'],
      response: "Chaque bénéficiaire est vérifié par notre équipe avec des preuves réelles (certificats, photos, attestations). Vous pouvez faire confiance — votre aide va directement à la bonne personne !"
    },
    {
      keywords: ['sms', 'notification', 'message', 'notifier'],
      response: "Les bénéficiaires reçoivent un SMS automatique quand leur demande est validée ou rejetée. Les donateurs reçoivent un email de confirmation à chaque don."
    },
    {
      keywords: ['admin', 'administration', 'gestion'],
      response: "L'administrateur peut valider ou rejeter les demandes, voir les statistiques, gérer les bénéficiaires aidés et retirer quelqu'un de la liste publique quand il a reçu suffisamment d'aide."
    },
    {
      keywords: ['contact', 'whatsapp', 'joindre', 'appeler'],
      response: "Vous pouvez nous contacter via WhatsApp au +221 77 070 51 73 ou par email à oumydieng503@gmail.com. Retrouvez aussi notre page Instagram @oumykalsoum !"
    },
    {
      keywords: ['merci', 'super', 'bien', 'parfait', 'excellent'],
      response: "Avec plaisir ! Que votre générosité soit récompensée. N'hésitez pas si vous avez d'autres questions."
    },
    {
      keywords: ['sénégal', 'senegal', 'village', 'région', 'dakar'],
      response: "Solidarité App est disponible partout au Sénégal ! Que vous soyez à Dakar, Thiès, Saint-Louis ou dans un village reculé — si vous avez un téléphone, vous pouvez recevoir ou envoyer de l'aide."
    },
  ],
  wo: [
    {
      keywords: ['salaam', 'bonjour', 'hello', 'nanga def'],
      response: "Salaam ! Maa ngi Assistant bi Solidarité App. Ana nga bëgg ci jëflante bi?"
    },
    {
      keywords: ['ndimbal', 'don', 'yëgël', 'xaalis'],
      response: "Bëgg nga yëgël ndimbal? Dem ci 'Faire un don' ci menu bi. Mën nga tann benn yënëm walla fonds général bi. Xaalis bi dem dëgg ci Wave walla Orange Money !"
    },
    {
      keywords: ['wave', 'paiement', 'yonnenti'],
      response: "Wave mën nga ko jëfal ci yonnenti xaalis ci yënëm bi. Supp bouton Wave ci page don bi — app bi dina ubbi ak numéro bi ci télépone bi !"
    },
    {
      keywords: ['orange money', 'orange'],
      response: "Orange Money am na ci dons yi. Supp Orange Money ci page don bi — numéro bi dina compositeur automatiquement ci télépone bi."
    },
    {
      keywords: ['dëmëlukaay', 'ndimbal', 'bëgg', 'soxor'],
      response: "Bëgg nga dëmëlukaay ndimbal? Dem ci 'Demander l aide' ci menu bi. Boole formulaire bi ak sa preuves yi. Sunu équipe dina xoolal sous 48h."
    },
    {
      keywords: ['compte', 'inscription', 'defar'],
      response: "Defar sa compte ci 'S inscrire'. Tann sa rôle: Donateur (bëgg ko ndimbal) walla Bénéficiaire (bëgg jël ndimbal). Mën nga jëfal Google itam !"
    },
    {
      keywords: ['point', 'points', 'niveau'],
      response: "Am ngay points ci kaan don: 1 point ci 1000 FCFA. Niveaux yi: Nouveau (0 pts), Actif (10 pts), Grand Donateur (50 pts), Ambassadeur (100 pts)."
    },
    {
      keywords: ['merci', 'jaajëf', 'baax', 'dëgg'],
      response: "Jaajëf ! Sa ndimbal dëgg na. Laaj ko benn yëgël bii yëgël bëgg nga."
    },
  ]
}

export default function Chatbot() {
  const { lang } = useLang()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const welcomeSpoken = useRef(false)

  const welcomeText = lang === 'wo'
    ? `Salaam${user ? ' ' + user.prenom : ''} ! Maa ngi Assistant bi Solidarité App. Mën nga laaj ma ci: ndimbal, dëmëlukaay, compte, wave, points.`
    : `Bonjour${user ? ' ' + user.prenom : ''} ! Je suis l'assistant Solidarité App. Posez-moi vos questions sur les dons, les demandes d'aide, votre compte ou les paiements.`

  const [messages, setMessages] = useState(() => [{
    id: 'welcome',
    from: 'bot',
    text: welcomeText
  }])

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    utterance.rate = 0.9
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const findResponse = useCallback((text) => {
    const lower = text.toLowerCase()
    const responses = RESPONSES[lang] || RESPONSES.fr
    for (const item of responses) {
      if (item.keywords.some(kw => lower.includes(kw))) return item.response
    }
    return lang === 'wo'
      ? 'Bëgguma xam looy laaj. Laaj ci: ndimbal, dëmëlukaay, compte, wave, orange money, points, contact.'
      : "Je n'ai pas compris. Essayez : don, demande d'aide, compte, Wave, Orange Money, points, contact, témoignage."
  }, [lang])

  const sendMessage = useCallback((text) => {
    const msgText = text || input
    if (!msgText.trim()) return
    const userMsg = { id: crypto.randomUUID(), from: 'user', text: msgText }
    const botText = findResponse(msgText)
    const botMsg = { id: crypto.randomUUID(), from: 'bot', text: botText }
    setMessages(prev => [...prev, userMsg, botMsg])
    setInput('')
    speak(botText)
  }, [input, findResponse, speak])

  useEffect(() => {
    if (open && !welcomeSpoken.current) {
      welcomeSpoken.current = true
      setTimeout(() => speak(welcomeText), 500)
    }
    if (!open) welcomeSpoken.current = false
  }, [open, speak, welcomeText])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Utilisez Chrome pour la reconnaissance vocale.')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setTimeout(() => sendMessage(transcript), 300)
    }
    recognition.start()
    recognitionRef.current = recognition
  }, [sendMessage])

  const suggestions = lang === 'wo'
    ? ['Ndimbal', 'Dëmëlukaay', 'Compte', 'Wave', 'Points', 'Contact']
    : ['Faire un don', 'Demande aide', 'Mon compte', 'Wave', 'Points', 'Contact']

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open ? 'bg-slate-700 hover:bg-slate-600 rotate-90' : 'bg-blue-600 hover:bg-blue-500'
        }`}
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>

      {/* Fenêtre chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: '500px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white bg-opacity-15 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">Assistant Solidarité</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-blue-200 text-xs">
                  {speaking ? 'En train de parler...' : listening ? 'Écoute...' : 'En ligne'}
                </span>
              </div>
            </div>
            <span className="bg-white bg-opacity-15 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {lang === 'wo' ? 'WO' : 'FR'}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.from === 'bot' && (
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
                }`}>
                  {msg.text}
                  {msg.from === 'bot' && (
                    <button
                      onClick={() => speaking ? stopSpeaking() : speak(msg.text)}
                      className="mt-1.5 text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition"
                    >
                      {speaking
                        ? <><VolumeX size={11} /> Stop</>
                        : <><Volume2 size={11} /> Écouter</>
                      }
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-3 py-2 bg-slate-800 border-t border-slate-700 flex gap-2 overflow-x-auto">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                className="flex-shrink-0 text-xs bg-slate-700 text-slate-300 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-full transition border border-slate-600">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
            <button onClick={listening ? () => recognitionRef.current?.stop() : startListening}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                listening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 hover:bg-slate-600 text-slate-400'
              }`}>
              {listening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={lang === 'wo' ? 'Bind sa laaj...' : 'Posez votre question...'}
              className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={() => sendMessage()}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition flex-shrink-0">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
