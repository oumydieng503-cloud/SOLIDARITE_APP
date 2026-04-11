import { useState } from 'react'
import { LanguageContext } from './LanguageContext'
import { translations } from '../utils/translations'

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'fr')

  const toggleLang = () => {
    const newLang = lang === 'fr' ? 'wo' : 'fr'
    setLang(newLang)
    localStorage.setItem('lang', newLang)
  }

  const t = (key) => translations[lang]?.[key] || translations['fr']?.[key] || key

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
