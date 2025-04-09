"use client"

import { useState, useEffect } from "react"
import { getStats, getUserProfile } from "../../services/api"
import UserSidebar from "../../components/UserDashboard/UserSidebar"
import "./Dashboard.css"

const Dashboard = () => {
  const [stats, setStats] = useState({
    concours: 0,
    formations: 0,
    documents: 0,
    applications: 0,
  })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // Récupérer les statistiques générales
        const statsData = await getStats()
        setStats({
          concours: statsData?.concours || 0,
          formations: statsData?.formations || 0,
          documents: statsData?.documents || 0,
          applications: statsData?.applications || 0,
        })

        // Récupérer le profil utilisateur
        const userData = await getUserProfile()
        setUser(userData)

        setError(null)
      } catch (error) {
        console.error("Erreur lors du chargement des données du tableau de bord:", error)
        setError("Impossible de charger les données du tableau de bord. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="user-dashboard-layout">
      <UserSidebar />
      <div className="dashboard-content">
        <div className="dashboard-container">
          {loading ? (
            <div className="loading-state">Chargement du tableau de bord...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : (
            <>
              <div className="dashboard-header">
                <h1>Tableau de bord</h1>
                <p>Bienvenue, {user?.firstName || "Utilisateur"} ! Voici un aperçu de votre activité.</p>
              </div>

              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-content">
                    <h3>Concours disponibles</h3>
                    <p className="stat-value">{stats.concours}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-content">
                    <h3>Formations suivies</h3>
                    <p className="stat-value">{stats.formations}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-content">
                    <h3>Documents</h3>
                    <p className="stat-value">{stats.documents}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-content">
                    <h3>Candidatures</h3>
                    <p className="stat-value">{stats.applications}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

