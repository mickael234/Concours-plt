"use client"

import { useState, useEffect } from "react"
import { getUserProfile, getUserFormations } from "../../services/api"
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

        // Récupérer le profil utilisateur et les formations en parallèle
        const [userData, userFormations] = await Promise.all([
          getUserProfile(),
          getUserFormations().catch((err) => {
            console.error("Erreur lors de la récupération des formations:", err)
            return []
          }),
        ])

        console.log("Données utilisateur récupérées:", userData)
        console.log("Formations utilisateur récupérées:", userFormations)

        setUser(userData)

        // Calculer les statistiques personnelles de l'utilisateur
        const userStats = {
          concours: userData?.alerts?.length || 0, // Nombre de concours suivis (alertes)
          formations: userFormations?.length || 0, // Nombre de formations à partir de l'API dédiée
          documents: userData?.downloadedDocuments?.length || 0, // Nombre de documents téléchargés
          applications: userData?.applications?.length || 0, // Nombre de candidatures
        }
        console.log("Statistiques calculées:", userStats)

        setStats(userStats)
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
                <p>Bienvenue, {user?.firstName || "Utilisateur"} !</p>
              </div>

              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-content">
                    <h3>Concours suivis</h3>
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
                    <h3>Documents téléchargés</h3>
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
