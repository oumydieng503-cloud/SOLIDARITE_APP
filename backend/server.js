require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { createClient } = require('@supabase/supabase-js')
const twilio = require('twilio')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // App Password Gmail
  }
})

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// Fonction pour envoyer un SMS
async function envoyerSMS(telephone, message) {
  try {
    // Formater le numéro sénégalais en format international
    let numero = telephone.replace(/\s/g, '').replace(/-/g, '')
    if (!numero.startsWith('+')) {
      if (numero.startsWith('00221')) {
        numero = '+' + numero.slice(2)
      } else if (numero.startsWith('221')) {
        numero = '+' + numero
      } else {
        numero = '+221' + numero
      }
    }

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: numero
    })
    console.log('✅ SMS envoyé à', numero)
    return true
  } catch (error) {
    console.error('❌ Erreur SMS:', error.message)
    return false
  }
}

const app = express()
const PORT = 5000
const JWT_SECRET = process.env.JWT_SECRET || 'solidarite_app_secret_2024'
const ADMIN_EMAIL = 'oumydieng503@gmail.com'

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET // secret key pour bypasser RLS
)

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ========== MIDDLEWARE JWT ==========
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, message: 'Token manquant' })
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Token invalide' })
    req.user = user
    next()
  })
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès admin requis' })
  }
  next()
}

// ========== ROUTES ==========

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Supabase fonctionne !' })
})

// ========== USERS ==========

// Inscription
app.post('/api/register', async (req, res) => {
  const { email, password, nom, prenom, telephone, role } = req.body

  if (!email || !password || !nom || !prenom || !telephone || !role) {
    return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires' })
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mot de passe trop court (min 6 caractères)' })
  }

  // Vérifier si email existe déjà
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const finalRole = email === ADMIN_EMAIL ? 'admin' : role

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password: hashedPassword, nom, prenom, telephone, role: finalRole }])
    .select('id')
    .single()

  if (error) return res.status(400).json({ success: false, message: error.message })

  res.json({ success: true, id: data.id })
})

// Connexion
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis' })
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (!user) {
    return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' })
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' })
  }

  const role = email === ADMIN_EMAIL ? 'admin' : user.role
  const { password: _, ...userData } = { ...user, role }

  const token = jwt.sign(
    { id: userData.id, email: userData.email, role: userData.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ success: true, user: userData, token })
})

// Récupérer un utilisateur
app.get('/api/users/:email', authenticateToken, async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, nom, prenom, telephone, role, points')
    .eq('email', req.params.email)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Utilisateur non trouvé' })
  res.json(data)
})

// Mettre à jour les points
app.put('/api/users/:email/points', authenticateToken, async (req, res) => {
  const { points } = req.body

  const { data: user } = await supabase
    .from('users')
    .select('points')
    .eq('email', req.params.email)
    .single()

  const newPoints = (user?.points || 0) + points

  await supabase
    .from('users')
    .update({ points: newPoints })
    .eq('email', req.params.email)

  res.json({ success: true, points: newPoints })
})

// Mettre à jour le profil
app.put('/api/users/:email/profile', authenticateToken, async (req, res) => {
  const { prenom, nom, telephone } = req.body
  const { error } = await supabase
    .from('users')
    .update({ prenom, nom, telephone })
    .eq('email', req.params.email)
  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ success: true })
})

// Changer le mot de passe
app.put('/api/users/:email/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Champs requis' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Minimum 6 caractères' })
  }

  const { data: user } = await supabase
    .from('users')
    .select('password')
    .eq('email', req.params.email)
    .single()

  if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' })

  const match = await bcrypt.compare(currentPassword, user.password)
  if (!match) return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' })

  const hashed = await bcrypt.hash(newPassword, 10)
  await supabase.from('users').update({ password: hashed }).eq('email', req.params.email)
  res.json({ success: true })
})

// ========== GOOGLE AUTH ==========

app.post('/api/auth/google-callback', async (req, res) => {
  const { email, prenom, nom, googleId } = req.body
  if (!email) return res.status(400).json({ success: false, message: 'Email requis' })

  // Vérifier si l'utilisateur existe
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (!user) {
    // Créer l'utilisateur automatiquement avec rôle donateur par défaut
    const finalRole = email === ADMIN_EMAIL ? 'admin' : 'donateur'
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        email,
        password: await bcrypt.hash(googleId, 10), // mot de passe inutilisable
        nom: nom || '',
        prenom: prenom || email.split('@')[0],
        telephone: '',
        role: finalRole
      }])
      .select('*')
      .single()

    if (error) return res.status(500).json({ success: false, message: error.message })
    user = newUser
  }

  const role = email === ADMIN_EMAIL ? 'admin' : user.role
  const { password: _, ...userData } = { ...user, role }

  const token = jwt.sign(
    { id: userData.id, email: userData.email, role: userData.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ success: true, user: userData, token })
})

// ========== RESET PASSWORD ==========

// Demande de réinitialisation
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ success: false, message: 'Email requis' })

  // Vérifier que l'utilisateur existe
  const { data: user } = await supabase
    .from('users')
    .select('id, email, prenom, nom')
    .eq('email', email)
    .single()

  // On répond toujours success pour ne pas révéler si l'email existe
  if (!user) return res.json({ success: true })

  // Générer un token sécurisé
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 3600000) // 1 heure

  // Sauvegarder le token dans Supabase
  await supabase.from('reset_tokens').upsert([{
    email,
    token,
    expires_at: expiresAt.toISOString()
  }])

  // Envoyer l'email
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`

  try {
    await transporter.sendMail({
      from: `"Solidarité App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe — Solidarité App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4;">
          <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Solidarité App</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          </div>
        </div>
      `
    })
  } catch (err) {
    console.error('Erreur email reset:', err.message)
  }

  res.json({ success: true })
})

// Réinitialisation du mot de passe
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token et mot de passe requis' })
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mot de passe trop court' })
  }

  // Vérifier le token
  const { data: resetData } = await supabase
    .from('reset_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (!resetData) {
    return res.status(400).json({ success: false, message: 'Lien invalide ou expiré' })
  }

  if (new Date() > new Date(resetData.expires_at)) {
    return res.status(400).json({ success: false, message: 'Lien expiré' })
  }

  // Mettre à jour le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10)
  await supabase.from('users').update({ password: hashedPassword }).eq('email', resetData.email)

  // Supprimer le token utilisé
  await supabase.from('reset_tokens').delete().eq('token', token)

  res.json({ success: true })
})

// ========== DEMANDES ==========

// Créer une demande
app.post('/api/demandes', authenticateToken, async (req, res) => {
  const {
    nom, prenom, telephone, email, adresse, ville, numero_paiement,
    type_besoin, description, situation, preuve_type, preuve_fichier
  } = req.body

  if (!nom || !prenom || !telephone || !email || !adresse || !ville || !type_besoin || !description || !preuve_type) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' })
  }

  const { data, error } = await supabase
    .from('demandes')
    .insert([{
      nom, prenom, telephone, email, adresse, ville, numero_paiement,
      type_besoin, description, situation, preuve_type, preuve_fichier
    }])
    .select('id')
    .single()

  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ success: true, id: data.id })
})

// Récupérer toutes les demandes avec pagination (admin)
app.get('/api/demandes', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('demandes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return res.status(500).json({ success: false, message: error.message })

  res.json({
    demandes: data,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
  })
})

// Récupérer sa propre demande (bénéficiaire)
app.get('/api/demandes/mienne', authenticateToken, async (req, res) => {
  res.set('Cache-Control', 'no-store')
  const { data } = await supabase
    .from('demandes')
    .select('*')
    .eq('email', req.user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  res.json({ demande: data || null })
})

// Récupérer les demandes validées avec pagination (public)
app.get('/api/demandes/valides', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 9
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('demandes')
    .select('id, nom, prenom, ville, adresse, type_besoin, description, numero_paiement, telephone', { count: 'exact' })
    .eq('statut', 'valide')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return res.status(500).json({ success: false, message: error.message })

  res.json({
    demandes: data,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
  })
})

// Mettre à jour le statut d'une demande (admin)
app.put('/api/demandes/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { statut, admin_message } = req.body
  if (!statut) return res.status(400).json({ success: false, message: 'Statut requis' })

  const { error } = await supabase
    .from('demandes')
    .update({ statut, admin_message })
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ success: true })
})

// ========== DONS ==========

// Créer un don
app.post('/api/dons', authenticateToken, async (req, res) => {
  const {
    donateur_email, type_don, montant, description, beneficiaire_id,
    beneficiaire_nom, beneficiaire_contact, beneficiaire_paiement,
    mode_paiement, points_gagnes
  } = req.body

  if (!donateur_email || !type_don || !beneficiaire_id || !beneficiaire_nom || !mode_paiement) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' })
  }

  const { data, error } = await supabase
    .from('dons')
    .insert([{
      donateur_email, type_don, montant, description, beneficiaire_id,
      beneficiaire_nom, beneficiaire_contact, beneficiaire_paiement,
      mode_paiement, points_gagnes: points_gagnes || 0,
      status: 'valide' // ✅ Don automatiquement valide — contact direct
    }])
    .select('id')
    .single()

  if (error) return res.status(500).json({ success: false, message: error.message })

  // ✅ Marquer la demande comme "aide" si bénéficiaire spécifique
  if (beneficiaire_id && beneficiaire_id !== 'general') {
    await supabase
      .from('demandes')
      .update({ statut: 'aide', date_aide: new Date().toISOString(), aidant_email: donateur_email })
      .eq('id', beneficiaire_id)
  }

  // ✅ Ajouter les points au donateur
  if (points_gagnes > 0) {
    const { data: user } = await supabase.from('users').select('points').eq('email', donateur_email).single()
    await supabase.from('users').update({ points: (user?.points || 0) + points_gagnes }).eq('email', donateur_email)
  }

  // ✅ Envoyer email de confirmation au donateur
  try {
    const montantFormate = montant ? parseInt(montant).toLocaleString('fr-FR') + ' FCFA' : type_don
    const beneficiaireInfo = beneficiaire_id === 'general' ? 'Fonds général (distribution équitable)' : beneficiaire_nom

    await transporter.sendMail({
      from: `"Solidarité App" <${process.env.EMAIL_USER}>`,
      to: donateur_email,
      subject: 'Votre don a été enregistré — Solidarité App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4;">
          <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Solidarité App</h1>
            <p style="margin: 8px 0 0; opacity: 0.8;">Merci pour votre générosité</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Bonjour,</p>
            <p>Votre don a bien été enregistré sur <strong>Solidarité App</strong>.</p>

            <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">Récapitulatif de votre don</h3>
              <p style="margin: 5px 0;"><strong>Bénéficiaire :</strong> ${beneficiaireInfo}</p>
              <p style="margin: 5px 0;"><strong>Montant :</strong> ${montantFormate}</p>
              <p style="margin: 5px 0;"><strong>Mode de paiement :</strong> ${mode_paiement}</p>
              <p style="margin: 5px 0;"><strong>Points gagnés :</strong> +${points_gagnes || 0} points</p>
            </div>

            ${beneficiaire_id !== 'general' && beneficiaire_paiement ? `
            <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #15803d; margin: 0 0 10px 0;">Numéro de paiement du bénéficiaire</h3>
              <p style="font-size: 1.4em; font-weight: bold; color: #15803d; margin: 0;">${beneficiaire_paiement}</p>
              <p style="margin: 8px 0 0; color: #166534; font-size: 0.9em;">Envoyez le montant sur ce numéro via ${mode_paiement}</p>
            </div>
            ` : ''}

            <p>Que Allah récompense votre générosité et bénisse vos efforts.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">L'équipe Solidarité App</p>
          </div>
        </div>
      `
    })
  } catch (emailErr) {
    console.error('Erreur email donateur:', emailErr.message)
  }

  res.json({ success: true, id: data.id })
})

// Récupérer tous les dons (admin) pour stats
app.get('/api/dons/all', authenticateToken, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('dons')
    .select('id, montant, created_at, type_don, status')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ dons: data || [] })
})

// Récupérer les dons d'un utilisateur avec pagination
app.get('/api/dons/:email', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('dons')
    .select('*', { count: 'exact' })
    .eq('donateur_email', req.params.email)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return res.status(500).json({ success: false, message: error.message })

  res.json({
    dons: data,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
  })
})

// Retirer un bénéficiaire de la liste publique (admin)
app.put('/api/demandes/:id/archiver', authenticateToken, requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from('demandes')
    .update({ statut: 'archive' })
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ success: true })
})

// Récupérer les bénéficiaires aidés (admin)
app.get('/api/demandes/aides', authenticateToken, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('demandes')
    .select('*')
    .eq('statut', 'aide')
    .order('date_aide', { ascending: false })

  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ demandes: data || [] })
})

// ========== TEMOIGNAGES ==========

// Ajouter un témoignage
app.post('/api/temoignages', authenticateToken, async (req, res) => {
  const { demande_id, temoignage } = req.body
  if (!demande_id || !temoignage) {
    return res.status(400).json({ success: false, message: 'Champs requis manquants' })
  }
  const { error } = await supabase
    .from('demandes')
    .update({ temoignage })
    .eq('id', demande_id)
  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ success: true })
})

// Récupérer les témoignages publics
app.get('/api/temoignages', async (req, res) => {
  const { data, error } = await supabase
    .from('demandes')
    .select('id, nom, prenom, ville, type_besoin, description, temoignage, date_aide, created_at')
    .eq('statut', 'aide')
    .not('temoignage', 'is', null)
    .order('date_aide', { ascending: false })
  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json(data || [])
})

// ========== VISITES ==========

app.post('/api/visites', async (req, res) => {
  const { session_id } = req.body
  if (!session_id) return res.status(400).json({ success: false, message: 'session_id requis' })

  const { error } = await supabase.from('visites').insert([{ session_id }])
  if (error) return res.json({ success: false, message: 'Déjà compté' })
  res.json({ success: true })
})

app.get('/api/visites/count', async (req, res) => {
  const { count } = await supabase
    .from('visites')
    .select('*', { count: 'exact', head: true })
  res.json({ count: count || 0 })
})

// ========== STATISTIQUES ==========

app.get('/api/stats', async (req, res) => {
  const [donateurs, aides, donsTotal, pointsTotal] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'donateur'),
    supabase.from('demandes').select('*', { count: 'exact', head: true }).eq('statut', 'aide'),
    supabase.from('dons').select('montant'),
    supabase.from('users').select('points')
  ])

  const totalDons = donsTotal.data?.reduce((sum, d) => sum + (d.montant || 0), 0) || 0
  const totalPoints = pointsTotal.data?.reduce((sum, u) => sum + (u.points || 0), 0) || 0

  res.json({
    donateurs: donateurs.count || 0,
    beneficiairesAides: aides.count || 0,
    donsTotaux: totalDons,
    pointsDistribues: totalPoints
  })
})

// Récupérer les dons reçus par un bénéficiaire
app.get('/api/dons/recus/:email', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Trouver la demande aidée du bénéficiaire via son email
  const { data: demande } = await supabase
    .from('demandes')
    .select('id')
    .eq('email', req.params.email)
    .eq('statut', 'aide')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!demande) {
    return res.json({ dons: [], pagination: { page, limit, total: 0, totalPages: 0 } })
  }

  // Chercher les dons par beneficiaire_id
  const { data, count, error } = await supabase
    .from('dons')
    .select('*', { count: 'exact' })
    .eq('beneficiaire_id', String(demande.id))
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return res.status(500).json({ success: false, message: error.message })

  res.json({
    dons: data,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Serveur Supabase démarré sur http://localhost:${PORT}`)
})
