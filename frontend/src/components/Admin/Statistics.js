import React from "react"
import { BookOpen, Building2, GraduationCap } from "lucide-react"

const StatCard = ({ title, value, description, icon: Icon }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <h3 className="stat-card-title">{title}</h3>
      <Icon className="stat-card-icon" />
    </div>
    <div className="stat-card-value">{value}</div>
    <p className="stat-card-description">{description}</p>
  </div>
)

export default function Statistics({ stats, loading, error }) {
  const defaultStats = [
    {
      title: "Total des Concours",
      value: "0",
      description: "Concours actifs et archivés",
      icon: GraduationCap,
    },
    {
      title: "Ressources",
      value: "0",
      description: "Documents et matériels de préparation",
      icon: BookOpen,
    },
    {
      title: "Établissements",
      value: "0",
      description: "Centres et écoles partenaires",
      icon: Building2,
    },
  ]

  if (loading) {
    return <div>Chargement des statistiques...</div>
  }

  if (error) {
    return <div>Erreur lors du chargement des statistiques: {error}</div>
  }

  const displayStats = stats
    ? [
        { ...defaultStats[0], value: stats.concours.toString() },
        { ...defaultStats[1], value: stats.resources.toString() },
        { ...defaultStats[2], value: stats.establishments.toString() },
      ]
    : defaultStats

  return (
    <div className="stats-grid">
      {displayStats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}

