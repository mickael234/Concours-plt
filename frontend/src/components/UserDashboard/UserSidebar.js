"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { FileText, BookOpen, Star, Settings, LogOut, User, FileCheck } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import "./UserSidebar.css"

const UserSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="user-sidebar">
      <div className="user-profile">
        <div className="user-avatar">
          <User size={40} />
        </div>
        <div className="user-info">
          <h3>
            {user?.firstName} {user?.lastName || ""}
          </h3>
          <p>{user?.email || ""}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link to="/user/dashboard" className={`nav-item ${isActive("/user/dashboard") ? "active" : ""}`}>
          <User size={20} />
          <span>Tableau de bord</span>
        </Link>

        <Link to="/user/applications" className={`nav-item ${isActive("/user/applications") ? "active" : ""}`}>
          <FileCheck size={20} />
          <span>Mes candidatures</span>
        </Link>

        <Link to="/user/parcours" className={`nav-item ${isActive("/user/parcours") ? "active" : ""}`}>
          <User size={20} />
          <span>Mon parcours</span>
        </Link>

        <Link to="/user/documents" className={`nav-item ${isActive("/user/documents") ? "active" : ""}`}>
          <FileText size={20} />
          <span>Mes documents</span>
        </Link>

        <Link to="/user/formations" className={`nav-item ${isActive("/user/formations") ? "active" : ""}`}>
          <BookOpen size={20} />
          <span>Mes formations</span>
        </Link>

        <Link to="/user/avis" className={`nav-item ${isActive("/user/avis") ? "active" : ""}`}>
          <Star size={18} />
          <span>Mes avis</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <Link to="/user/settings" className={`nav-item ${isActive("/user/settings") ? "active" : ""}`}>
          <Settings size={20} />
          <span>Paramètres</span>
        </Link>

        <button onClick={handleLogout} className="nav-item logout-btn">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )
}

export default UserSidebar
