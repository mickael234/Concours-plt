"use client"

import { useState, useEffect } from "react"
import "./AdminDashboard.css"
import ConcoursManager from "./ConcoursManager"
import ResourceManager from "./ResourcesManager"
import EstablishmentManager from "./EstablishmentManager"
import UserManager from "./UserManager"
import Statistics from "./Statistics"
import { fetchStats } from "../../services/api"

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("statistics")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetchStats()
        console.log("Stats fetched:", response) // Log the response
        setStats(response)
        setError(null)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError(err.message || "Une erreur s'est produite lors du chargement des statistiques")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "statistics":
        return <Statistics stats={stats} loading={loading} error={error} />
      case "concours":
        return <ConcoursManager />
      case "establishments":
        return <EstablishmentManager />
      case "resources":
        return <ResourceManager />
      case "users":
        return <UserManager />
      default:
        return <div>Sélectionnez un onglet</div>
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Tableau de Bord Administrateur</h1>
      </header>

      <nav className="dashboard-nav">
        <button className={activeTab === "statistics" ? "active" : ""} onClick={() => setActiveTab("statistics")}>
          Statistiques
        </button>
        <button className={activeTab === "concours" ? "active" : ""} onClick={() => setActiveTab("concours")}>
          Gestion des Concours
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
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
          Utilisateurs
        </button>
      </nav>

      <main className="dashboard-content">{renderContent()}</main>
    </div>
  )
}

export default AdminDashboard

