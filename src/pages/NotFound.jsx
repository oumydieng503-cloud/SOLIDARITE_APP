import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function NotFound() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500 opacity-5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative text-center max-w-lg">
        {/* 404 géant */}
        <div className="relative mb-8">
          <p className="text-[10rem] font-black text-slate-800 leading-none select-none">
            404
          </p>
          <p className="absolute inset-0 flex items-center justify-center text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-800 leading-none select-none opacity-30">
            404
          </p>
        </div>

        <h1 className="text-3xl font-black text-white mb-4">
          Page introuvable
        </h1>
        <p className="text-slate-400 text-lg mb-2">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <p className="text-slate-500 text-sm mb-10">
          Vérifiez l'adresse ou retournez à l'accueil.
        </p>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-3 rounded-xl font-semibold transition">
            Retour
          </button>
          <Link to="/"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg">
            Accueil
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard"
              className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-semibold transition">
              Mon tableau de bord
            </Link>
          )}
        </div>

        {/* Liens rapides */}
        <div className="mt-12 border-t border-slate-800 pt-8">
          <p className="text-slate-500 text-sm mb-4">Liens utiles</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { to: '/beneficiaries', label: 'Bénéficiaires' },
              { to: '/donate', label: 'Faire un don' },
              { to: '/temoignages', label: 'Témoignages' },
              { to: '/login', label: 'Connexion' },
            ].map(link => (
              <Link key={link.to} to={link.to}
                className="text-blue-400 hover:text-blue-300 text-sm transition underline underline-offset-4">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
