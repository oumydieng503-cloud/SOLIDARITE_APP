// Compteur de visiteurs
export function trackVisitor() {
  const visited = sessionStorage.getItem('visited')
  if (!visited) {
    let totalVisits = localStorage.getItem('totalVisits') || 0
    totalVisits = parseInt(totalVisits) + 1
    localStorage.setItem('totalVisits', totalVisits)
    sessionStorage.setItem('visited', 'true')
  }
}

export function getVisitorCount() {
  return localStorage.getItem('totalVisits') || 0
}