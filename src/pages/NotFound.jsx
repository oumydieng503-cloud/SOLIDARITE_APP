import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function NotFound() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative text-center max-w-lg">
        {/* 404 géant */}
        <div className="relative mb-8">
          <p className="text-[10rem] font-black leading-none select-none text-white text-opacity-10">
            404
          </p>
          <p className="absolute inset-0 flex items-center justify-center text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 leading-none select-none opacity-40">
            404
          </p>
        </div>

        <h1 className="text-3xl font-black text-white mb-4">Page introuvable</h1>
        <p className="text-blue-100 text-lg mb-2">La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <p className="text-blue-200 text-sm mb-10">Vérifiez l'adresse ou retournez à l'accueil.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate(-1)}
            className="border border-white border-opacity-30 hover:border-opacity-60 text-white hover:bg-white hover:bg-opacity-10 px-8 py-3 rounded-xl font-semibold transition">
            Retour
          </button>
          <Link to="/" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-xl font-bold transition shadow-lg">
            Accueil
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="bg-white bg-opacity-20 border border-white border-opacity-30 text-white hover:bg-opacity-30 px-8 py-3 rounded-xl font-semibold transition">
              Mon tableau de bord
            </Link>
          )}
        </div>

        <div className="mt-12 border-t border-white border-opacity-20 pt-8">
          <p className="text-blue-200 text-sm mb-4">Liens utiles</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { to: '/beneficiaries', label: 'Bénéficiaires' },
              { to: '/donate', label: 'Faire un don' },
              { to: '/temoignages', label: 'Témoignages' },
              { to: '/login', label: 'Connexion' },
            ].map(link => (
              <Link key={link.to} to={link.to}
                className="text-blue-200 hover:text-white text-sm transition underline underline-offset-4">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
