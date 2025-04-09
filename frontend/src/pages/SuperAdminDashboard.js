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
import "../styles/SuperAdminDashboard.css"
import { Users, Award, Building2, FileText, BookOpen, File, Briefcase, ClipboardList, BarChart3 } from "lucide-react"

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("statistics")
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if not a superadmin
    if (!user || user.role !== "superadmin") {
      console.log("Not authorized as superadmin, redirecting to login")
      navigate("/login")
      return
    }

    // Check if we have a valid token before fetching data
    const token = localStorage.getItem("token")
    if (!token) {
      console.log("No token found, redirecting to login")
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

        // If we get a 401 error, redirect to login
        if (err.response && err.response.status === 401) {
          console.log("Authentication error, redirecting to login")
          navigate("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, navigate])

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
        return <UserManager />
      case "formations":
        return <FormationManager />
      case "documents":
        return <DocumentManager />
      case "businesses":
        return <BusinessManager />
      case "inscriptions":
        return <InscriptionManager />
      default:
        return <div>Sélectionnez un onglet</div>
    }
  }

  if (!user || user.role !== "superadmin") {
    return null // Don't render anything while redirecting
  }

  return (
    <div className="superadmin-dashboard">
      <header className="dashboard-header">
        <h1>Tableau de Bord Super Administrateur</h1>
        <div className="user-info">
          <div className="admin-details">
            <span className="admin-name">{user.name}</span>
            <span className="admin-role">Super Administrateur</span>
          </div>
          {user.avatar && <img src={user.avatar || "/placeholder.svg"} alt="Admin" className="admin-avatar" />}
        </div>
      </header>
      <nav className="dashboard-nav">
        <button className={activeTab === "statistics" ? "active" : ""} onClick={() => setActiveTab("statistics")}>
          <BarChart3 size={18} />
          Statistiques
        </button>
        <button className={activeTab === "concours" ? "active" : ""} onClick={() => setActiveTab("concours")}>
          <Award size={18} />
          Concours
        </button>
        <button
          className={activeTab === "establishments" ? "active" : ""}
          onClick={() => setActiveTab("establishments")}
        >
          <Building2 size={18} />
          Établissements
        </button>
        <button className={activeTab === "resources" ? "active" : ""} onClick={() => setActiveTab("resources")}>
          <FileText size={18} />
          Ressources
        </button>
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
          <Users size={18} />
          Utilisateurs
        </button>
        <button className={activeTab === "formations" ? "active" : ""} onClick={() => setActiveTab("formations")}>
          <BookOpen size={18} />
          Formations
        </button>
        <button className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}>
          <File size={18} />
          Documents
        </button>
        <button className={activeTab === "businesses" ? "active" : ""} onClick={() => setActiveTab("businesses")}>
          <Briefcase size={18} />
          Entreprises
        </button>
        <button className={activeTab === "inscriptions" ? "active" : ""} onClick={() => setActiveTab("inscriptions")}>
          <ClipboardList size={18} />
          Inscriptions
        </button>
      </nav>
      <main className="dashboard-content">{renderContent()}</main>
    </div>
  )
}

export default SuperAdminDashboard

