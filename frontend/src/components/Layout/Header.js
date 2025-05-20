"use client"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./Header.css"

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleSiteChange = (e) => {
    const site = e.target.value
    if (site === "business") {
      navigate("/business")
    } else {
      navigate("/")
    }
  }

  const isAdmin = user?.role === "admin"
  const isBusiness = user?.role === "business"
  const isSuperAdmin = user?.role === "superadmin"

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">Concours CI</Link>
        </div>
        <div className="header-right">
          <div className="site-type">
            <span>Changer de site : </span>
            <select
              className="site-select"
              onChange={handleSiteChange}
              value={window.location.pathname.startsWith("/business") ? "business" : "particuliers"}
            >
              <option value="particuliers">Particuliers</option>
              <option value="business">Business</option>
            </select>
          </div>
          {user ? (
            <>
              <span className="user-name">Bonjour, {user.name || user.firstName}</span>
              {isSuperAdmin && (
                <Link to="/admin" className="btn-superadmin">
                  Tableau de bord SuperAdmin
                </Link>
              )}
              {isAdmin && !isSuperAdmin && (
                <Link to="/admin" className="btn-admin">
                  Tableau de bord Admin
                </Link>
              )}
              {isBusiness && (
                <Link to="/business/dashboard" className="btn-business">
                  Tableau de bord Business
                </Link>
              )}
              {!isSuperAdmin && !isAdmin && !isBusiness && user && (
                <Link to="/user/dashboard" className="btn-user-dashboard">
                  Mon Espace
                </Link>
              )}
              <button onClick={handleLogout} className="btn-logout">
                Se déconnecter
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-connect">
                Se connecter
              </Link>
              <Link to="/register" className="btn-register">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
