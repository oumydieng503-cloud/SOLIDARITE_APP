import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setInstallPrompt(null)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-24 md:w-80 z-40 bg-slate-800 border border-blue-500 border-opacity-40 rounded-2xl p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Installer l'application</p>
          <p className="text-slate-400 text-xs mt-1">
            Installez Solidarité App sur votre téléphone pour un accès rapide !
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={handleInstall}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
              Installer
            </button>
            <button onClick={() => setVisible(false)}
              className="text-slate-400 hover:text-slate-300 text-xs px-3 py-2 transition">
              Plus tard
            </button>
          </div>
        </div>
        <button onClick={() => setVisible(false)} className="text-slate-500 hover:text-slate-300 transition">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
