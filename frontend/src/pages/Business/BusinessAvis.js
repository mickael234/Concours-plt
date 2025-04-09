"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { fetchBusinessFormations } from "../../services/api"
import "./BusinessAvis.css"

const BusinessAvis = () => {
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    global: 0,
    enseignement: 0,
    employabilite: 0,
    reseau: 0,
    distribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  })

  useEffect(() => {
    // Charger les avis depuis les formations
    const fetchAvis = async () => {
      try {
        setLoading(true)

        // Récupérer les formations de l'entreprise
        const formationsResponse = await fetchBusinessFormations()
        const formations = formationsResponse.data || formationsResponse || []

        console.log("Formations récupérées:", formations)

        // Extraire tous les avis des formations
        let allAvis = []
        let totalRating = 0
        let totalCount = 0
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

        formations.forEach((formation) => {
          if (formation.ratings && formation.ratings.length > 0) {
            // Ajouter les avis de cette formation
            const formationAvis = formation.ratings.map((rating) => ({
              id: rating._id || `rating-${Math.random()}`,
              userName: rating.user?.name || "Utilisateur",
              date: rating.createdAt || new Date(),
              rating: rating.rating || 0,
              comment: rating.comment || "",
              formation: formation.title,
            }))

            allAvis = [...allAvis, ...formationAvis]

            // Mettre à jour les statistiques
            totalRating += formation.rating * formation.numReviews
            totalCount += formation.numReviews

            // Mettre à jour la distribution
            formation.ratings.forEach((rating) => {
              const roundedRating = Math.round(rating.rating)
              if (distribution[roundedRating] !== undefined) {
                distribution[roundedRating]++
              }
            })
          }
        })

        // Calculer la note moyenne globale
        const globalRating = totalCount > 0 ? totalRating / totalCount : 0

        setAvis(allAvis)
        setStats({
          global: globalRating,
          enseignement: globalRating, // Simplification, idéalement ces valeurs seraient calculées séparément
          employabilite: globalRating,
          reseau: globalRating,
          distribution,
        })

        setLoading(false)
      } catch (error) {
        console.error("Erreur lors du chargement des avis:", error)
        setLoading(false)
      }
    }

    fetchAvis()
  }, [])

  const renderStars = (rating) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "star-filled" : "star-empty"}
            fill={star <= rating ? "#FFD700" : "none"}
            stroke={star <= rating ? "#FFD700" : "#ccc"}
          />
        ))}
      </div>
    )
  }

  const renderRatingBar = (value, total) => {
    const percentage = total > 0 ? (value / total) * 100 : 0
    return (
      <div className="rating-bar-container">
        <div className="rating-bar" style={{ width: `${percentage}%` }}></div>
        <span className="rating-percentage">{percentage.toFixed(0)}%</span>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Chargement des avis...</div>
  }

  return (
    <div className="business-avis-container">
      <h2>Avis global ({avis.length} avis)</h2>

      <div className="ratings-overview">
        <div className="rating-card">
          <h3>Note globale</h3>
          {renderStars(stats.global)}
          <span className="rating-value">({stats.global.toFixed(1)}/5)</span>
        </div>

        <div className="rating-card">
          <h3>Qualité de l'enseignement</h3>
          {renderStars(stats.enseignement)}
          <span className="rating-value">({stats.enseignement.toFixed(1)}/5)</span>
        </div>

        <div className="rating-card">
          <h3>Employabilité</h3>
          {renderStars(stats.employabilite)}
          <span className="rating-value">({stats.employabilite.toFixed(1)}/5)</span>
        </div>

        <div className="rating-card">
          <h3>Réseau</h3>
          {renderStars(stats.reseau)}
          <span className="rating-value">({stats.reseau.toFixed(1)}/5)</span>
        </div>
      </div>

      <div className="rating-distribution">
        <div className="rating-row">
          <span className="rating-label">5</span>
          {renderRatingBar(stats.distribution[5], avis.length)}
        </div>
        <div className="rating-row">
          <span className="rating-label">4</span>
          {renderRatingBar(stats.distribution[4], avis.length)}
        </div>
        <div className="rating-row">
          <span className="rating-label">3</span>
          {renderRatingBar(stats.distribution[3], avis.length)}
        </div>
        <div className="rating-row">
          <span className="rating-label">2</span>
          {renderRatingBar(stats.distribution[2], avis.length)}
        </div>
        <div className="rating-row">
          <span className="rating-label">1</span>
          {renderRatingBar(stats.distribution[1], avis.length)}
        </div>
      </div>

      {avis.length === 0 ? (
        <div className="no-avis">
          <p>Aucun avis pour le moment.</p>
          <p>Les avis apparaîtront ici lorsque vos clients évalueront vos formations.</p>
        </div>
      ) : (
        <div className="avis-list">
          {avis.map((avis) => (
            <div key={avis.id} className="avis-item">
              <div className="avis-header">
                <div className="avis-user">
                  <span className="user-name">{avis.userName}</span>
                  <span className="avis-date">{new Date(avis.date).toLocaleDateString()}</span>
                </div>
                <div className="avis-rating">{renderStars(avis.rating)}</div>
              </div>
              <div className="avis-content">
                <p className="avis-formation">Formation: {avis.formation}</p>
                <p>{avis.comment || "Aucun commentaire"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusinessAvis

