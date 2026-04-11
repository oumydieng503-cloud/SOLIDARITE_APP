import { useContext } from 'react'
import { LanguageContext } from './LanguageContext'

export function useLang() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLang must be used within LanguageProvider')
  return context
}
