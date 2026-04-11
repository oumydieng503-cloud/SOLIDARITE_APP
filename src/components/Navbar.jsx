import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../context/useLang'
import { Home, Heart, Users, LayoutDashboard, HelpCircle, MessageSquare, Shield, LogOut, Globe } from 'lucide-react'
import NotificationBell from './NotificationBell'

function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { lang, toggleLang, t } = useLang()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-black text-white tracking-tight">
            Solidarité<span className="text-blue-400">.</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center gap-1 text-slate-300 hover:text-white text-sm transition">
                  <Home size={14} /><span className="hidden md:inline">{t('accueil')}</span>
                </Link>
                {user?.role === 'donateur' && (
                  <Link to="/donate" className="flex items-center gap-1 text-slate-300 hover:text-white text-sm transition">
                    <Heart size={14} /><span className="hidden md:inline">{t('faireDon')}</span>
                  </Link>
                )}
                <Link to="/beneficiaries" className="flex items-center gap-1 text-slate-300 hover:text-white text-sm transition">
                  <Users size={14} /><span className="hidden md:inline">{t('beneficiaires')}</span>
                </Link>
                <Link to="/dashboard" className="flex items-center gap-1 text-slate-300 hover:text-white text-sm transition">
                  <LayoutDashboard size={14} /><span className="hidden md:inline">{t('monTableau')}</span>
                </Link>
                {user?.role === 'beneficiaire' && (
                  <Link to="/request" className="flex items-center gap-1 text-slate-300 hover:text-white text-sm transition">
                    <HelpCircle size={14} /><span className="hidden md:inline">{t('demanderAide')}</span>
                  </Link>
                )}
                <Link to="/temoignages" className="flex items-center gap-1 text-slate-300 hover:text-white text-sm transition">
                  <MessageSquare size={14} /><span className="hidden md:inline">{t('temoignages')}</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold text-sm transition">
                    <Shield size={14} /><span className="hidden md:inline">{t('admin')}</span>
                  </Link>
                )}
                <div className="flex items-center space-x-3 border-l border-slate-700 pl-4">
                  {user?.role === 'beneficiaire' && <NotificationBell />}
                  <span className="text-sm text-slate-400 hidden md:block">{user?.prenom} {user?.nom}</span>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-sm transition">
                    <LogOut size={14} /><span className="hidden md:inline">{t('deconnexion')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="text-slate-300 hover:text-white text-sm transition">{t('connexion')}</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 text-sm font-semibold transition">
                  {t('inscription')}
                </Link>
              </div>
            )}
            <button onClick={toggleLang}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-full text-sm font-semibold text-slate-300 hover:text-white transition">
              <Globe size={13} />
              {lang === 'fr' ? 'Wolof' : 'Français'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
