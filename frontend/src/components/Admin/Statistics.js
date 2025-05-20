"use client"
import { useEffect } from "react"
import { Users, Award, Building2, BookOpen, File, Eye, Download } from "lucide-react"
import "./Statistics.css"

const Statistics = ({ stats, loading, error }) => {
  console.log("Statistics component rendering with stats:", stats)

  useEffect(() => {
    // Add animation class after component mounts
    const cards = document.querySelectorAll(".stat-card1")
    setTimeout(() => {
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add("animate-in")
        }, index * 100)
      })
    }, 100)
  }, [stats])

  if (loading)
    return (
      <div className="statistics-loading">
        <div className="spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    )

  if (error)
    return (
      <div className="statistics-error">
        <p>Erreur : {error}</p>
      </div>
    )

  if (!stats)
    return (
      <div className="statistics-empty">
        <p>Aucune donnée statistique disponible.</p>
      </div>
    )

  return (
    <div className="statistics-container">
      <h2 className="statistics-title">Tableau de bord</h2>

      <div className="statistics-grid">
        <div className="stat-card1">
          <Users size={24} className="stat-icon" />
          <h3>Utilisateurs</h3>
          <p>{stats.totalUsers || 0}</p>
        </div>

        <div className="stat-card1">
          <Award size={24} className="stat-icon" />
          <h3>Concours</h3>
          <p>{stats.totalConcours || 0}</p>
        </div>

        <div className="stat-card1">
          <Building2 size={24} className="stat-icon" />
          <h3>Établissements</h3>
          <p>{stats.totalEstablishments || 0}</p>
        </div>

        <div className="stat-card1">
          <BookOpen size={24} className="stat-icon" />
          <h3>Formations</h3>
          <p>{stats.totalFormations || 0}</p>
        </div>

        <div className="stat-card1">
          <File size={24} className="stat-icon" />
          <h3>Documents</h3>
          <p>{stats.totalDocuments || 0}</p>
        </div>

        <div className="stat-card1">
          <Eye size={24} className="stat-icon" />
          <h3>Vues Concours</h3>
          <p>{stats.totalConcoursViews || 0}</p>
        </div>

        <div className="stat-card1">
          <Eye size={24} className="stat-icon" />
          <h3>Vues Formations</h3>
          <p>{stats.totalFormationViews || 0}</p>
        </div>

        <div className="stat-card1">
          <Download size={24} className="stat-icon" />
          <h3>Téléchargements</h3>
          <p>{stats.totalDocumentDownloads || 0}</p>
        </div>
      </div>

      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <div className="activity-section">
          <h3 className="section-title">Activité récente</h3>
          <div className="activity-list">
            {stats.recentActivity.map((activity, index) => (
              <div className="activity-item" key={index}>
                <div className="activity-icon">
                  {activity.type === "user" && <Users size={20} />}
                  {activity.type === "concours" && <Award size={20} />}
                  {activity.type === "formation" && <BookOpen size={20} />}
                  {activity.type === "document" && <File size={20} />}
                </div>
                <div className="activity-content">
                  <p className="activity-text">{activity.description}</p>
                  <p className="activity-time">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Statistics
