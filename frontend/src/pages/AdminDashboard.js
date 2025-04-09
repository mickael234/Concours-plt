"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import ConcoursManager from "../components/Admin/ConcoursManager"
import ResourcesManager from "../components/Admin/ResourcesManager"
import EstablishmentManager from "../components/Admin/EstablishmentManager"
import UserManager from "../components/Admin/UserManager"
import FormationManager from "../components/Admin/FormationManager"
import DocumentManager from "../components/Admin/DocumentManager"
import BusinessManager from "../components/Admin/BusinessManager"
import InscriptionManager from "../components/Admin/InscriptionManager"
import Statistics from "../components/Admin/Statistics"
import { fetchStats } from "../services/api"
import "./AdminDashboard.css"

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("statistics")
  const { user } = useAuth()
  const navigate = useNavigate()

  // Check if user has admin access
  const hasAdminAccess = user && (user.role === "admin" || user.role === "superadmin")

  // Some features might be restricted to superadmin only
  const isSuperAdmin = user && user.role === "superadmin"

  useEffect(() => {
    // Redirect if not an admin or superadmin
    if (!hasAdminAccess) {
      navigate("/login")
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await fetchStats()
        console.log("Fetched stats:", data)
        setStats(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError(err.message || "Une erreur s'est produite lors du chargement des statistiques")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [hasAdminAccess, navigate])

  const renderContent = () => {
    switch (activeTab) {
      case "statistics":
        return <Statistics stats={stats} loading={loading} error={error} />
      case "concours":
        return <ConcoursManager />
      case "establishments":
        return <EstablishmentManager />
      case "resources":
        return <ResourcesManager />
      case "users":
        // Only superadmin can manage users
        return isSuperAdmin ? <UserManager /> : <div>Accès réservé aux super administrateurs</div>
      case "formations":
        return <FormationManager />
      case "documents":
        return <DocumentManager />
      case "businesses":
        // Only superadmin can manage businesses
        return isSuperAdmin ? <BusinessManager /> : <div>Accès réservé aux super administrateurs</div>
      case "inscriptions":
        return <InscriptionManager />
      default:
        return <div>Sélectionnez un onglet</div>
    }
  }

  if (!hasAdminAccess) {
    return null // Don't render anything while redirecting
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Tableau de Bord {isSuperAdmin ? "Super Administrateur" : "Administrateur"}</h1>
      </header>
      <nav className="dashboard-nav">
        <button className={activeTab === "statistics" ? "active" : ""} onClick={() => setActiveTab("statistics")}>
          Statistiques
        </button>
        <button className={activeTab === "concours" ? "active" : ""} onClick={() => setActiveTab("concours")}>
          Concours
        </button>
        <button
          className={activeTab === "establishments" ? "active" : ""}
          onClick={() => setActiveTab("establishments")}
        >
          Établissements
        </button>
        <button className={activeTab === "resources" ? "active" : ""} onClick={() => setActiveTab("resources")}>
          Ressources
        </button>
        {/* Only show user management to superadmin */}
        {isSuperAdmin && (
          <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
            Utilisateurs
          </button>
        )}
        <button className={activeTab === "formations" ? "active" : ""} onClick={() => setActiveTab("formations")}>
          Formations
        </button>
        <button className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}>
          Documents
        </button>
        {/* Only show business management to superadmin */}
        {isSuperAdmin && (
          <button className={activeTab === "businesses" ? "active" : ""} onClick={() => setActiveTab("businesses")}>
            Entreprises
          </button>
        )}
        <button className={activeTab === "inscriptions" ? "active" : ""} onClick={() => setActiveTab("inscriptions")}>
          Inscriptions
        </button>
      </nav>
      <main className="dashboard-content">{renderContent()}</main>
    </div>
  )
}

export default AdminDashboard

