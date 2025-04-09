"use client"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./BusinessHeader.css"
import { logoutBusiness as apiLogoutBusiness } from "../../services/api"

const BusinessHeader = () => {
  const { businessUser, logout } = useAuth()
  const navigate = useNavigate()

  // Fallback to check localStorage directly
  const getBusinessUserFromLocalStorage = () => {
    try {
      const businessInfo = localStorage.getItem("businessInfo")
      if (businessInfo) {
        return JSON.parse(businessInfo)
      }
    } catch (error) {
      console.error("Error parsing business info from localStorage:", error)
    }
    return null
  }

  const localBusinessUser = getBusinessUserFromLocalStorage()
  const isAuthenticated = businessUser || localBusinessUser

  const handleLogout = () => {
    // Utiliser la fonction logout de useAuth
    // Puis appeler apiLogoutBusiness pour la déconnexion côté API
    logout() // Cette fonction doit gérer les deux types d'utilisateurs
    apiLogoutBusiness() // Appel à la fonction API
    localStorage.removeItem("businessInfo") // Supprimer les informations du local storage
    localStorage.removeItem("businessToken") // Supprimer le token du local storage
    navigate("/business/login")
  }

  const handleSiteChange = (e) => {
    const site = e.target.value
    if (site === "business") {
      navigate("/business")
    } else {
      navigate("/")
    }
  }

  return (
    <header className="business-header">
      <div className="header-content">
        <div className="logo">
          <Link to="/business">Concours CI Business</Link>
        </div>
        <div className="header-right">
          <div className="site-type">
            <span>Changer de site : </span>
            <select className="site-select" onChange={handleSiteChange} value="business">
              <option value="particuliers">Particuliers</option>
              <option value="business">Business</option>
            </select>
          </div>
          {isAuthenticated ? (
            <>
              <span className="user-name">
                Bonjour, {businessUser?.firstName || localBusinessUser?.firstName || "Utilisateur"}
              </span>
              <Link to="/business/dashboard" className="btn-dashboard">
                Tableau de bord
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                Se déconnecter
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/business/login" className="btn-connect">
                Se connecter
              </Link>
              <Link to="/business/register" className="btn-register">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default BusinessHeader

