const API_URL = 'http://localhost:5000/api'

// ========== TOKEN JWT ==========
function getToken() {
  return localStorage.getItem('token')
}

export async function apiCall(endpoint, options = {}) {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        // 🔒 Envoyer le token JWT automatiquement
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    })
    const data = await response.json()
    return { response, data }
  } catch (error) {
    console.error(`❌ API Error on ${endpoint}:`, error.message)
    return {
      response: { ok: false },
      data: { success: false, message: 'Serveur inaccessible. Vérifiez que le backend est démarré.' }
    }
  }
}

// ========== USERS ==========

export async function register(userData) {
  const { data } = await apiCall('/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  })
  return data
}

export async function login(email, password) {
  const { data } = await apiCall('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  // 🔒 Sauvegarder le token JWT
  if (data.success && data.token) {
    localStorage.setItem('token', data.token)
  }
  return data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export async function getUser(email) {
  const { data } = await apiCall(`/users/${email}`)
  return data
}

export async function updatePoints(email, points) {
  const { data } = await apiCall(`/users/${email}/points`, {
    method: 'PUT',
    body: JSON.stringify({ points })
  })
  return data
}

// ========== DEMANDES ==========

export async function createDemande(demandeData) {
  const { data } = await apiCall('/demandes', {
    method: 'POST',
    body: JSON.stringify(demandeData)
  })
  return data
}

export async function getDemandes(page = 1, limit = 10) {
  const { data } = await apiCall(`/demandes?page=${page}&limit=${limit}`)
  return data
}

export async function getDemandesValides(page = 1, limit = 9) {
  const { data } = await apiCall(`/demandes/valides?page=${page}&limit=${limit}`)
  return data
}

export async function updateDemande(id, updates) {
  const { data } = await apiCall(`/demandes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  })
  return data
}

// ========== DONS ==========

export async function createDon(donData) {
  const { data } = await apiCall('/dons', {
    method: 'POST',
    body: JSON.stringify(donData)
  })
  return data
}

export async function getDons(email, page = 1, limit = 10) {
  const { data } = await apiCall(`/dons/${email}?page=${page}&limit=${limit}`)
  return data
}

// ========== VISITES ==========

export async function trackVisit(sessionId) {
  const { data } = await apiCall('/visites', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId })
  })
  return data
}

export async function getVisitorCount() {
  const { data } = await apiCall('/visites/count')
  return data?.count || 0
}

// ========== STATISTIQUES ==========

export async function getStats() {
  const { data } = await apiCall('/stats')
  return data
}

export async function getDonsRecus(email, page = 1, limit = 10) {
  const { data } = await apiCall(`/dons/recus/${email}?page=${page}&limit=${limit}`)
  return data
}

// ========== TEMOIGNAGES ==========

export async function ajouterTemoignage(demande_id, temoignage) {
  const { data } = await apiCall('/temoignages', {
    method: 'POST',
    body: JSON.stringify({ demande_id, temoignage })
  })
  return data
}

export async function getTemoignages() {
  const { data } = await apiCall('/temoignages')
  return data
}

// ========== ARCHIVAGE ==========

export async function archiverBeneficiaire(id) {
  const { data } = await apiCall(`/demandes/${id}/archiver`, {
    method: 'PUT'
  })
  return data
}

export async function getDemandesAides() {
  const { data } = await apiCall('/demandes/aides')
  return data
}