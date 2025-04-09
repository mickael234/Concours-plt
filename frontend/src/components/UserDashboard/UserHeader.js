"use client"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./UserHeader.css"

const UserHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="user-dashboard-header">
      <div className="user-dashboard-header-content">
        <div className="user-dashboard-logo">
          <h1>Mon Espace</h1>
          <p>Bienvenue, {user?.firstName || user?.name || "Utilisateur"}</p>
        </div>
        <nav className="user-dashboard-nav">
          <NavLink to="/user/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            Tableau de bord
          </NavLink>
          <NavLink to="/user/alerts" className={({ isActive }) => (isActive ? "active" : "")}>
            Alertes
          </NavLink>
          <NavLink to="/user/documents" className={({ isActive }) => (isActive ? "active" : "")}>
            Mes Documents
          </NavLink>
          <NavLink to="/user/formations" className={({ isActive }) => (isActive ? "active" : "")}>
            Mes Formations
          </NavLink>
          <NavLink to="/user/applications" className={({ isActive }) => (isActive ? "active" : "")}>
            Mes Candidatures
          </NavLink>
          <NavLink to="/user/profile" className={({ isActive }) => (isActive ? "active" : "")}>
            Mon Profil
          </NavLink>
          <NavLink to="/user/settings" className={({ isActive }) => (isActive ? "active" : "")}>
            Paramètres
          </NavLink>
        </nav>
        <div className="user-dashboard-actions">
          <button onClick={() => navigate("/")} className="btn-home">
            Retour au site
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserHeader

