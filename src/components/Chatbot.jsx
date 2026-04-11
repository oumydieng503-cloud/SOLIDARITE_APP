import { useState, useRef, useEffect, useCallback } from 'react'
import { useLang } from '../context/useLang'
import { MessageCircle, X, Mic, MicOff, Send, Volume2, VolumeX, Bot } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const RESPONSES = {
  fr: [
    { keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'salam'], response: "Bonjour ! Je suis l'assistant de Solidarité App. Comment puis-je vous aider aujourd'hui ?" },
    { keywords: ['don', 'donner', 'aider', 'donate', 'faire un don'], response: "Pour faire un don, cliquez sur 'Faire un don' dans le menu. Les paiements se font via Wave ou Orange Money — directement au bénéficiaire !" },
    { keywords: ['wave', 'paiement', 'payer', 'transfert'], response: "Wave est disponible pour envoyer de l'argent directement au bénéficiaire. Cliquez sur Wave dans la page don — l'app s'ouvrira automatiquement sur mobile !" },
    { keywords: ['orange money', 'orange', 'om'], response: "Orange Money est aussi disponible. Cliquez sur Orange Money dans la page don — le numéro sera composé automatiquement sur mobile." },
    { keywords: ['demande', 'aide', 'besoin', 'bénéficiaire', 'beneficiaire'], response: "Pour demander de l'aide, allez sur 'Demander de l'aide'. Remplissez le formulaire et fournissez une preuve. Notre équipe répond sous 48h." },
    { keywords: ['compte', 'inscription', 'créer', 's\'inscrire', 'register'], response: "Pour créer un compte, cliquez sur 'S'inscrire'. Choisissez Donateur ou Bénéficiaire. Vous pouvez aussi vous connecter avec Google !" },
    { keywords: ['mot de passe', 'password', 'oublié', 'reinitialiser'], response: "Cliquez sur 'Mot de passe oublié ?' sur la page de connexion. Vous recevrez un lien par email." },
    { keywords: ['point', 'points', 'générosité', 'niveau', 'ambassadeur'], response: "1 point par 1000 FCFA donné. Niveaux : Nouveau (0), Actif (10), Grand Donateur (50), Ambassadeur (100 pts)." },
    { keywords: ['témoignage', 'temoignage', 'histoire'], response: "Les bénéficiaires aidés peuvent partager leur témoignage depuis leur tableau de bord. Visible sur la page Témoignages !" },
    { keywords: ['contact', 'whatsapp', 'joindre'], response: "WhatsApp : +221 77 070 51 73 · Email : oumydieng503@gmail.com · Instagram : @oumykalsoum !" },
    { keywords: ['merci', 'super', 'bien', 'parfait'], response: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions." },
    { keywords: ['sénégal', 'senegal', 'village', 'dakar'], response: "Solidarité App est disponible partout au Sénégal — Dakar, Thiès, Saint-Louis ou village !" },
  ],
  wo: [
    { keywords: ['salaam', 'bonjour', 'hello', 'nanga def'], response: "Salaam ! Maa ngi Assistant bi Solidarité App. Ana nga bëgg ci jëflante bi?" },
    { keywords: ['ndimbal', 'don', 'yëgël', 'xaalis'], response: "Bëgg nga yëgël ndimbal? Dem ci 'Faire un don'. Xaalis bi dem dëgg ci Wave walla Orange Money !" },
    { keywords: ['wave', 'paiement', 'yonnenti'], response: "Wave mën nga ko jëfal ci yonnenti xaalis. Supp bouton Wave ci page don bi — app bi dina ubbi ci télépone bi !" },
    { keywords: ['orange money', 'orange'], response: "Orange Money am na ci dons yi. Supp Orange Money ci page don bi." },
    { keywords: ['dëmëlukaay', 'bëgg', 'soxor'], response: "Bëgg nga dëmëlukaay? Dem ci 'Demander l aide'. Boole formulaire bi ak preuves yi. Sunu équipe dina xoolal sous 48h." },
    { keywords: ['compte', 'inscription', 'defar'], response: "Defar sa compte ci 'S inscrire'. Tann: Donateur walla Bénéficiaire. Mën nga jëfal Google itam !" },
    { keywords: ['point', 'points', 'niveau'], response: "1 point ci 1000 FCFA. Niveaux: Nouveau (0), Actif (10), Grand (50), Ambassadeur (100 pts)." },
    { keywords: ['contact', 'whatsapp'], response: "WhatsApp: +221 77 070 51 73 · Email: oumydieng503@gmail.com · Instagram: @oumykalsoum !" },
    { keywords: ['merci', 'jaajëf', 'baax'], response: "Jaajëf ! Laaj ko benn yëgël bii bëgg nga." },
  ]
}

const buildWelcome = (u, l) => ({
  id: 'welcome',
  from: 'bot',
  text: l === 'wo'
    ? `Salaam${u?.prenom ? ' ' + u.prenom : ''} ! Maa ngi Assistant bi Solidarité App. Laaj ma ci: ndimbal, dëmëlukaay, compte, wave, points.`
    : `Bonjour${u?.prenom ? ' ' + u.prenom : ''} ! Je suis l'assistant Solidarité App. Posez-moi vos questions sur les dons, demandes d'aide, votre compte ou les paiements.`
})

export default function Chatbot() {
  const { lang } = useLang()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [extraMessages, setExtraMessages] = useState([])
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const welcomeSpoken = useRef(false)
  const langRef = useRef(lang)
  useEffect(() => { langRef.current = lang }, [lang])

  // ✅ Messages = bienvenue dynamique + messages échangés
  const welcomeMsg = buildWelcome(user, lang)
  const messages = [welcomeMsg, ...extraMessages]

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
    const responses = RESPONSES[langRef.current] || RESPONSES.fr
    for (const item of responses) {
      if (item.keywords.some(kw => lower.includes(kw))) return item.response
    }
    return langRef.current === 'wo'
      ? 'Bëgguma xam. Laaj ci: ndimbal, dëmëlukaay, compte, wave, points, contact.'
      : "Je n'ai pas compris. Essayez : don, demande d'aide, compte, Wave, Orange Money, points, contact."
  }, [])

  const sendMessage = useCallback((text) => {
    const msgText = text || input
    if (!msgText.trim()) return
    const userMsg = { id: crypto.randomUUID(), from: 'user', text: msgText }
    const botText = findResponse(msgText)
    const botMsg = { id: crypto.randomUUID(), from: 'bot', text: botText }
    setExtraMessages(prev => [...prev, userMsg, botMsg])
    setInput('')
    speak(botText)
  }, [input, findResponse, speak])

  useEffect(() => {
    if (open && !welcomeSpoken.current) {
      welcomeSpoken.current = true
      setTimeout(() => speak(welcomeMsg.text), 500)
    }
    if (!open) welcomeSpoken.current = false
  }, [open]) // eslint-disable-line

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
      <button onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open ? 'bg-slate-700 hover:bg-slate-600 rotate-90' : 'bg-blue-600 hover:bg-blue-500'
        }`}>
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: '500px' }}>
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
                    <button onClick={() => speaking ? stopSpeaking() : speak(msg.text)}
                      className="mt-1.5 text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition">
                      {speaking ? <><VolumeX size={11} /> Stop</> : <><Volume2 size={11} /> Écouter</>}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 bg-slate-800 border-t border-slate-700 flex gap-2 overflow-x-auto">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                className="flex-shrink-0 text-xs bg-slate-700 text-slate-300 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-full transition border border-slate-600">
                {s}
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
            <button onClick={listening ? () => recognitionRef.current?.stop() : startListening}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                listening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 hover:bg-slate-600 text-slate-400'
              }`}>
              {listening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={lang === 'wo' ? 'Bind sa laaj...' : 'Posez votre question...'}
              className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
