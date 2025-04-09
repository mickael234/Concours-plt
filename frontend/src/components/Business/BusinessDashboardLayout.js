"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Home, ShoppingBag, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import "./BusinessDashboardLayout.css"

const BusinessDashboardLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate("/business/login")
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Déterminer quelle section est active
  const isActive = (path) => {
    return location.pathname.includes(path)
  }

  return (
    <div className="business-dashboard-container">
      {/* Sidebar mobile toggle */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`business-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <Link to="/business/dashboard" className="sidebar-logo">
            Concours CI
          </Link>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li
              className={
                isActive("/dashboard") && !isActive("/dashboard/documents") && !isActive("/dashboard/business")
                  ? "active"
                  : ""
              }
            >
              <Link to="/business/dashboard">
                <Home size={20} />
                <span>Accueil</span>
              </Link>
            </li>
            <li className={isActive("/dashboard/documents") ? "active" : ""}>
              <Link to="/business/dashboard/documents">
                <ShoppingBag size={20} />
                <span>Documents</span>
              </Link>
            </li>
            <li className={isActive("/dashboard/formations") ? "active" : ""}>
            <Link to="/business/dashboard/formations">
                <ShoppingBag size={20} />
                <span> Formations</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={20} />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="business-dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="user-info">
            <div className="user-name">
              {user?.firstName} {user?.lastName}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-main-content">{children}</div>
      </main>
    </div>
  )
}

export default BusinessDashboardLayout

