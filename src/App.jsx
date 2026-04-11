import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { LanguageProvider } from './context/LanguageProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
import Home from './pages/Home'
import Donate from './pages/Donate'
import Beneficiaries from './pages/Beneficiaries'
import Dashboard from './pages/Dashboard'
import RequestHelp from './pages/RequestHelp'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import { trackVisit } from './api/api'
import Testimonials from './pages/Testimonials'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import InstallPWA from './components/InstallPWA'






function App() {
  useEffect(() => {
    const sessionId = sessionStorage.getItem('sessionId') || Date.now().toString()
    sessionStorage.setItem('sessionId', sessionId)
    trackVisit(sessionId)
  }, [])

  return (
    
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Navbar />
          <InstallPWA />

          <Routes>
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
             <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
            <Route path="/beneficiaries" element={<ProtectedRoute><Beneficiaries /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/request" element={<ProtectedRoute><RequestHelp /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
            <Route path="/temoignages" element={<Testimonials />} />
          </Routes>
          {/* 🤖 Chatbot visible sur toutes les pages */}
          <Chatbot />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
