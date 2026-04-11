import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../context/useLang'
import { useState, useEffect } from 'react'
import { getStats } from '../api/api'

function CountUp({ end, duration = 2000 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!end) return
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return count
}

export default function Home() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getStats().then(data => setStats(data)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500 opacity-10 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-4xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 text-blue-200 text-sm px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {lang === 'wo' ? 'Plateforme solidarité — Sénégal' : 'Plateforme de solidarité communautaire — Sénégal'}
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
              {lang === 'wo' ? 'Ci kanam,' : 'Ensemble,'}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                {lang === 'wo' ? 'dañu soppi nguur' : 'changeons des vies'}
              </span>
            </h1>

            <div className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
              <p className="text-blue-100 text-lg leading-relaxed font-light mb-3" dir="rtl">
                «مَثَلُ المُؤْمِنِينَ في تَوَادِّهِمْ وتَرَاحُمِهِمْ كَمَثَلِ الجَسَدِ، إِذَا اشْتَكَى مِنْهُ عُضْوٌ تَدَاعَى لَهُ سَائِرُ الجَسَدِ بِالسَّهَرِ وَالحُمَّى»
              </p>
              {lang === 'wo' ? (
                <p className="text-blue-200 text-sm italic">« Muminyi ci xol-fajar ak jëflante, dañu nekk benn yaram — su benn membre dof, yaram yépp dinañu xool. »</p>
              ) : (
                <p className="text-blue-200 text-sm italic">« Les croyants dans leur amour et leur compassion sont comme un seul corps — si un membre souffre, tout le corps en ressent la douleur. »</p>
              )}
              <p className="text-blue-400 text-xs mt-2">— {lang === 'wo' ? 'Nabi ﷺ · Al-Bukhari ak Muslim' : 'Le Prophète ﷺ · Rapporté par Al-Bukhari et Muslim'}</p>
            </div>

            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donate"
                className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5">
                {t('btnDon')}
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </Link>
              <Link to="/request"
                className="border border-white border-opacity-20 hover:border-opacity-40 hover:bg-white hover:bg-opacity-5 px-8 py-4 rounded-xl font-bold text-lg transition-all">
                {t('btnAide')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-16 bg-slate-800 border-y border-slate-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: stats?.donateurs || 0, label: t('donateursEngages'), color: 'text-blue-400' },
              { value: stats?.beneficiairesAides || 0, label: t('personnesAidees'), color: 'text-emerald-400' },
              { value: stats?.donsTotaux || 0, label: t('donsCollectes'), color: 'text-amber-400', format: true },
              { value: stats?.pointsDistribues || 0, label: t('pointsDistribues'), color: 'text-purple-400' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-slate-700 bg-opacity-50 border border-slate-600">
                <div className={`text-4xl md:text-5xl font-black ${stat.color} mb-2`}>
                  <CountUp end={stat.value} />
                  {stat.format && <span className="text-2xl font-semibold ml-1">F</span>}
                </div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMMENT CA MARCHE ===== */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest">
              {lang === 'wo' ? 'Yëgël' : 'Processus'}
            </span>
            <h2 className="text-4xl font-black text-white mt-2">{t('commentMarche')}</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              {lang === 'wo'
                ? 'Yomb la, xew-xew la — dañu bokk yënëm yi ak nit ñi soxor.'
                : 'Simple, transparent et sécurisé — connecter ceux qui donnent à ceux qui ont besoin.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: t('step1Title'), desc: t('step1Desc'), color: 'border-blue-500' },
              { title: t('step2Title'), desc: t('step2Desc'), color: 'border-emerald-500' },
              { title: t('step3Title'), desc: t('step3Desc'), color: 'border-amber-500' },
            ].map((item, i) => (
              <div key={i} className={`bg-slate-800 border border-slate-700 rounded-2xl p-8 hover:border-opacity-80 transition-all hover:-translate-y-1 border-t-2 ${item.color}`}>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POURQUOI NOUS FAIRE CONFIANCE ===== */}
      <section className="py-20 bg-slate-800 border-y border-slate-700">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest">Confiance</span>
              <h2 className="text-4xl font-black text-white mt-2">
                {lang === 'wo' ? 'Ndax mën nga nu génné ?' : 'Pourquoi nous faire confiance ?'}
              </h2>
              <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
                {lang === 'wo'
                  ? 'Xaalis bi dem dëgg ci yënëm bi — amul intermédiaire. Donateur ak bénéficiaire contact direct.'
                  : "L'aide va directement au bénéficiaire — sans intermédiaire. Le donateur et le bénéficiaire sont en contact direct."}
              </p>
            </div>

            {/* Schéma contact direct */}
            <div className="flex items-center justify-center gap-6 mb-12 flex-wrap">
              <div className="bg-blue-600 bg-opacity-20 border border-blue-500 border-opacity-40 rounded-2xl px-8 py-5 text-center">
                <p className="text-blue-300 font-bold text-xs uppercase tracking-widest mb-1">
                  {lang === 'wo' ? 'Yënëm' : 'Donateur'}
                </p>
                <p className="text-white font-black text-lg">
                  {lang === 'wo' ? 'Yëgël xaalis' : "Envoie l'aide"}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-0.5 bg-gradient-to-r from-blue-400 to-emerald-400"></div>
                <p className="text-slate-400 text-xs font-semibold px-3 py-1 bg-slate-700 rounded-full border border-slate-600">
                  {lang === 'wo' ? 'Dëgg — Sans intermédiaire' : 'Direct — Sans intermédiaire'}
                </p>
                <div className="w-20 h-0.5 bg-gradient-to-r from-blue-400 to-emerald-400"></div>
              </div>
              <div className="bg-emerald-600 bg-opacity-20 border border-emerald-500 border-opacity-40 rounded-2xl px-8 py-5 text-center">
                <p className="text-emerald-300 font-bold text-xs uppercase tracking-widest mb-1">
                  {lang === 'wo' ? 'Bénéficiaire' : 'Bénéficiaire'}
                </p>
                <p className="text-white font-black text-lg">
                  {lang === 'wo' ? 'Jël ndimbal' : "Reçoit l'aide"}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: lang === 'wo' ? 'Contact direct' : 'Contact direct',
                  desc: lang === 'wo' ? 'Donateur ak bénéficiaire bokk dëgg — amul intermédiaire.' : 'Donateur et bénéficiaire en contact direct — zéro intermédiaire.'
                },
                {
                  title: lang === 'wo' ? 'Sécurisé' : '100% Sécurisé',
                  desc: lang === 'wo' ? 'Identités vérifiées ak données yi protected.' : 'Identités vérifiées, données chiffrées et paiements sécurisés.'
                },
                {
                  title: lang === 'wo' ? 'Transparent' : 'Transparent',
                  desc: lang === 'wo' ? 'Xam nga fan xaalis bi dem ak kañ jël ko.' : 'Vous savez exactement à qui va votre argent et quand il est reçu.'
                },
                {
                  title: lang === 'wo' ? 'Vérifié' : 'Bénéficiaires vérifiés',
                  desc: lang === 'wo' ? 'Sunu équipe xoolal kaan dëmëlukaay ak preuves yi.' : 'Chaque bénéficiaire est vérifié par notre équipe avec des preuves réelles.'
                },
              ].map((v, i) => (
                <div key={i} className="bg-slate-700 bg-opacity-50 border border-slate-600 rounded-2xl p-6 hover:bg-slate-700 hover:border-blue-500 hover:border-opacity-50 transition-all">
                  <div className="w-8 h-1 bg-blue-500 rounded-full mb-4"></div>
                  <h3 className="font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TÉMOIGNAGES ===== */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest">Témoignages</span>
          <h2 className="text-4xl font-black text-white mt-2 mb-4">
            {lang === 'wo' ? 'Nit ñi ndimbaloon ci sa ndimbal' : 'Ils ont été aidés grâce à vous'}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {lang === 'wo'
              ? 'Kaan don soppi na nguur. Xool sunu témoignages yi.'
              : 'Chaque don, grand ou petit, a transformé une vie.'}
          </p>
          <Link to="/temoignages"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg">
            {lang === 'wo' ? 'Xool témoignages yi' : 'Voir tous les témoignages'} →
          </Link>
        </div>
      </section>

      {/* ===== CTA ===== */}
      {!user ? (
        <section className="py-20 bg-slate-800 border-t border-slate-700">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 text-center shadow-2xl shadow-blue-900/50">
              <h2 className="text-3xl md:text-4xl font-black mb-4">{t('rejoindre')}</h2>
              <p className="text-blue-100 mb-8 text-lg">
                {lang === 'wo'
                  ? 'Defar sa compte yomb te tambali def benn biir tëgg bi.'
                  : "Créez un compte gratuitement et commencez à faire la différence dès aujourd'hui."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register"
                  className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg">
                  {t('creerCompte')}
                </Link>
                <Link to="/login"
                  className="border border-white border-opacity-40 hover:border-opacity-80 px-8 py-4 rounded-xl font-bold transition">
                  {t('seConnecter')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-slate-800 border-t border-slate-700">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 text-center shadow-2xl shadow-blue-900/50">
              <h2 className="text-3xl font-black mb-3">
                {lang === 'wo' ? `Salaam, ${user?.prenom} !` : `Bienvenue, ${user?.prenom} !`}
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                {user?.role === 'donateur'
                  ? (lang === 'wo' ? 'Sa ndimbal soppi na nguur. Xool sa dons yi ci sa tableau.' : 'Votre générosité transforme des vies. Suivez vos dons depuis votre tableau de bord.')
                  : (lang === 'wo' ? 'Sa dëmëlukaay am na. Xool son évolution ci sa espace.' : 'Votre demande est en cours. Suivez son évolution depuis votre espace personnel.')}
              </p>
              <Link to="/dashboard"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg inline-block">
                {lang === 'wo' ? 'Sa tableau de bord →' : 'Mon tableau de bord →'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <div>
              <h3 className="text-white font-black text-xl">Solidarité App</h3>
              <p className="text-sm mt-1 text-slate-500">
                {lang === 'wo' ? 'Bokkal yënëm yi ak nit ñi soxor.' : 'Connecter la générosité aux besoins réels.'}
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/beneficiaries" className="hover:text-white transition">{lang === 'wo' ? 'Yënëm yi' : 'Bénéficiaires'}</Link>
              <Link to="/donate" className="hover:text-white transition">{lang === 'wo' ? 'Yëgël ndimbal' : 'Faire un don'}</Link>
              <Link to="/temoignages" className="hover:text-white transition">Témoignages</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-slate-800 pt-8">
            <p className="text-slate-500 text-sm text-center mb-4">
              {lang === 'wo' ? 'Contactez-nous' : 'Nous contacter'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">

              {/* WhatsApp */}
              <a href="https://wa.me/221770705173" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 bg-opacity-20 border border-green-600 border-opacity-30 text-green-400 hover:bg-opacity-30 px-4 py-2.5 rounded-xl text-sm font-medium transition">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.133 1.532 5.869L.073 23.927a.5.5 0 0 0 .612.612l6.058-1.459A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.523-5.188-1.434l-.372-.22-3.853.928.928-3.853-.22-.372A9.945 9.945 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                WhatsApp
              </a>

              {/* Email */}
              <a href="mailto:oumydieng503@gmail.com"
                className="flex items-center gap-2 bg-blue-600 bg-opacity-20 border border-blue-600 border-opacity-30 text-blue-400 hover:bg-opacity-30 px-4 py-2.5 rounded-xl text-sm font-medium transition">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                oumydieng503@gmail.com
              </a>

              {/* Instagram */}
              <a href="https://instagram.com/oumykalesoum" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-pink-600 bg-opacity-20 border border-pink-600 border-opacity-30 text-pink-400 hover:bg-opacity-30 px-4 py-2.5 rounded-xl text-sm font-medium transition">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @oumykalesoum
              </a>
            </div>
          </div>

          <p className="text-xs text-slate-600 text-center mt-6">© 2025 Solidarité App · {lang === 'wo' ? 'Mbir yépp gëm.' : 'Tous droits réservés'}</p>
        </div>
      </footer>

    </div>
  )
}
