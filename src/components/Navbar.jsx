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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo AidLink */}
          <Link to="/" className="flex items-center gap-1 text-xl font-black tracking-tight">
            <span className="text-blue-600">Aid</span>
            <span className="text-green-500">Link</span>
            <span className="text-blue-600">.</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm transition">
                  <Home size={14} /><span className="hidden md:inline">{t('accueil')}</span>
                </Link>
                {user?.role === 'donateur' && (
                  <Link to="/donate" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm transition">
                    <Heart size={14} /><span className="hidden md:inline">{t('faireDon')}</span>
                  </Link>
                )}
                <Link to="/beneficiaries" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm transition">
                  <Users size={14} /><span className="hidden md:inline">{t('beneficiaires')}</span>
                </Link>
                <Link to="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm transition">
                  <LayoutDashboard size={14} /><span className="hidden md:inline">{t('monTableau')}</span>
                </Link>
                {user?.role === 'beneficiaire' && (
                  <Link to="/request" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm transition">
                    <HelpCircle size={14} /><span className="hidden md:inline">{t('demanderAide')}</span>
                  </Link>
                )}
                <Link to="/temoignages" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm transition">
                  <MessageSquare size={14} /><span className="hidden md:inline">{t('temoignages')}</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 text-red-500 hover:text-red-600 font-semibold text-sm transition">
                    <Shield size={14} /><span className="hidden md:inline">{t('admin')}</span>
                  </Link>
                )}
                <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                  {user?.role === 'beneficiaire' && <NotificationBell />}
                  <Link to="/profile" className="text-sm text-gray-500 hidden md:block hover:text-blue-600 transition">
                    {user?.prenom} {user?.nom}
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-sm transition">
                    <LogOut size={14} /><span className="hidden md:inline">{t('deconnexion')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 text-sm transition font-medium">{t('connexion')}</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold transition shadow-sm">
                  {t('inscription')}
                </Link>
              </div>
            )}
            <button onClick={toggleLang}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-600 hover:text-gray-800 transition">
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
