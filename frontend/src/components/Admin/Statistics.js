"use client"

import { useEffect } from "react"
import "./Statistics.css"
import { BarChart3, Users, Building2, Eye, Award } from "lucide-react"

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
          <Award size={24} className="stat-icon" />
          <h3>Total des concours</h3>
          <p>{stats.totalConcours || 0}</p>
        </div>
        <div className="stat-card1">
          <Users size={24} className="stat-icon" />
          <h3>Total des utilisateurs</h3>
          <p>{stats.totalUsers || 0}</p>
        </div>
        <div className="stat-card1">
          <Building2 size={24} className="stat-icon" />
          <h3>Total des établissements</h3>
          <p>{stats.totalEstablishments || 0}</p>
        </div>
        <div className="stat-card1">
          <Eye size={24} className="stat-icon" />
          <h3>Visites du site</h3>
          <p>{stats.totalSiteVisits || 0}</p>
        </div>
        <div className="stat-card1">
          <BarChart3 size={24} className="stat-icon" />
          <h3>Vues totales des concours</h3>
          <p>{stats.totalConcoursViews || 0}</p>
        </div>
      </div>
    </div>
  )
}

export default Statistics

