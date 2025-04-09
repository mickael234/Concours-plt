"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Calendar, MapPin, Users, Award, ExternalLink, ArrowLeft } from "lucide-react"
import { getFormationById } from "../services/api"
import "../pages/FormationDetail.css"

const FormationDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formation, setFormation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        setLoading(true)
        const data = await getFormationById(id)
        console.log("Formation data:", data)
        setFormation(data)
        setError("")
      } catch (error) {
        console.error("Error fetching formation:", error)
        setError("Impossible de charger les détails de la formation")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchFormation()
    }
  }, [id])

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Date non spécifiée"
    try {
      const options = { year: "numeric", month: "long", day: "numeric" }
      return new Date(dateString).toLocaleDateString("fr-FR", options)
    } catch (error) {
      return "Date invalide"
    }
  }

  if (loading) {
    return <div className="loading-container">Chargement des détails de la formation...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Retour</button>
      </div>
    )
  }

  if (!formation) {
    return (
      <div className="not-found-container">
        <p>Formation non trouvée</p>
        <button onClick={() => navigate(-1)}>Retour</button>
      </div>
    )
  }

  return (
    <div className="formation-details-container">
      <div className="formation-details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
      </div>

      <div className="formation-details-content">
        <div className="formation-details-main">
          <div className="formation-image-container">
            {formation.image ? (
              <img
                src={formation.image || "/placeholder.svg?height=300&width=600"}
                alt={formation.title}
                className="formation-image"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=300&width=600"
                }}
              />
            ) : (
              <div className="formation-image-placeholder">
                <span>{formation.title.charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="formation-info">
            <h1 className="formation-title">{formation.title}</h1>
            <div className="formation-meta">
              <span className="formation-type">
                {formation.type === "online"
                  ? "Formation en ligne"
                  : formation.type === "inperson"
                    ? "Formation en présentiel"
                    : "Formation hybride"}
              </span>
              {formation.level && (
                <span className="formation-level">
                  <Award size={16} />
                  {formation.level === "debutant"
                    ? "Débutant"
                    : formation.level === "intermediaire"
                      ? "Intermédiaire"
                      : formation.level === "avance"
                        ? "Avancé"
                        : formation.level}
                </span>
              )}
            </div>

            <div className="formation-details-grid">
              <div className="detail-item">
                <Calendar size={18} />
                <div>
                  <span className="detail-label">Dates</span>
                  <span className="detail-value">
                    Du {formatDate(formation.startDate)} au {formatDate(formation.endDate)}
                  </span>
                </div>
              </div>

              {formation.places > 0 && (
                <div className="detail-item">
                  <Users size={18} />
                  <div>
                    <span className="detail-label">Places</span>
                    <span className="detail-value">{formation.places} disponibles</span>
                  </div>
                </div>
              )}

              {(formation.type === "inperson" || formation.type === "hybrid") && formation.location && (
                <div className="detail-item">
                  <MapPin size={18} />
                  <div>
                    <span className="detail-label">Lieu</span>
                    <span className="detail-value">{formation.location}</span>
                  </div>
                </div>
              )}

              {(formation.type === "online" || formation.type === "hybrid") && formation.onlinePlatform && (
                <div className="detail-item">
                  <ExternalLink size={18} />
                  <div>
                    <span className="detail-label">Plateforme</span>
                    <span className="detail-value">{formation.onlinePlatform}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="formation-price">
              <span className="price-label">Prix</span>
              <span className="price-value">
                {formation.price > 0 ? `${formation.price.toLocaleString()} FCFA` : "Gratuit"}
              </span>
            </div>

            <div className="formation-actions">
              <Link to={`/formations/${formation._id}/register`} className="register-button">
                S'inscrire à cette formation
              </Link>
            </div>
          </div>
        </div>

        <div className="formation-description">
          <h2>À propos de cette formation</h2>
          <div className="description-content">
            {formation.description ? (
              <p>{formation.description}</p>
            ) : (
              <p>Aucune description disponible pour cette formation.</p>
            )}
          </div>

          {formation.additionalComment && (
            <div className="additional-comment">
              <h3>Informations supplémentaires</h3>
              <p>{formation.additionalComment}</p>
            </div>
          )}
        </div>

        {formation.business && (
          <div className="formation-provider">
            <h2>Proposé par</h2>
            <div className="provider-info">
              <div className="provider-logo">
                {formation.business.logo ? (
                  <img
                    src={formation.business.logo || "/placeholder.svg?height=50&width=50"}
                    alt={formation.business.structureName || formation.business.name}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=50&width=50"
                    }}
                  />
                ) : (
                  <div className="provider-logo-placeholder">
                    <span>{(formation.business.structureName || formation.business.name || "").charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="provider-details">
                <h3>{formation.business.structureName || formation.business.name}</h3>
                {(formation.business.presentation || formation.business.description) && (
                  <p>{formation.business.presentation || formation.business.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FormationDetails

