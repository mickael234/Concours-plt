"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getConcoursById, rateConcours, incrementConcoursViews, getResourceById } from "../services/api"
import DocumentList from "../components/DocumentList"
import "./ConcoursDetail.css"

const ConcoursDetail = () => {
  const [concoursData, setConcoursData] = useState(null)
  const [userRating, setUserRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [associatedResources, setAssociatedResources] = useState([])
  const { id } = useParams()

  useEffect(() => {
    const fetchConcours = async () => {
      try {
        setLoading(true)
        console.log("Fetching concours with ID:", id)

        if (!id) {
          setError("ID du concours manquant")
          setLoading(false)
          return
        }

        const response = await getConcoursById(id)
        console.log("Concours data received:", response)

        // Handle different response formats
        let concoursData
        if (response && response.data) {
          concoursData = response.data
        } else if (response && typeof response === "object") {
          concoursData = response
        } else {
          throw new Error("Format de réponse invalide")
        }

        if (!concoursData || Object.keys(concoursData).length === 0) {
          throw new Error("Aucune donnée de concours reçue")
        }

        setConcoursData(concoursData)

        // Fetch associated resources if any
        if (concoursData.resources && concoursData.resources.length > 0) {
          fetchAssociatedResources(concoursData.resources)
        }

        // Increment views
        try {
          await incrementConcoursViews(id)
        } catch (viewError) {
          console.error("Erreur lors de l'incrémentation des vues:", viewError)
          // Continue even if view increment fails
        }
      } catch (error) {
        console.error("Erreur lors du chargement du concours:", error)
        setError(`Erreur lors du chargement du concours: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchConcours()
  }, [id])

  const fetchAssociatedResources = async (resourceIds) => {
    try {
      const resourcePromises = resourceIds.map((resourceId) => {
        // Handle both object IDs and string IDs
        const id = typeof resourceId === "object" ? resourceId._id : resourceId
        return getResourceById(id)
      })

      const resourceResponses = await Promise.all(resourcePromises)
      const resources = resourceResponses
        .map((response) => {
          if (response && response.data) {
            return response.data
          }
          return response
        })
        .filter((resource) => resource) // Filter out any null/undefined resources

      setAssociatedResources(resources)
    } catch (error) {
      console.error("Erreur lors du chargement des ressources associées:", error)
    }
  }

  const handleRatingSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await rateConcours(id, { rating: userRating, comment })
      setConcoursData((prevConcours) => ({
        ...prevConcours,
        averageRating: response.data?.averageRating || 0,
        numRatings: response.data?.ratingsCount || 0,
        ratings: response.data?.ratings || [],
      }))
      setUserRating(0)
      setComment("")
      alert("Votre avis a été soumis avec succès!")
    } catch (error) {
      console.error("Erreur lors de la soumission de l'avis:", error)
      alert("Une erreur s'est produite lors de la soumission de votre avis. Veuillez réessayer.")
    }
  }

  const renderStars = (rating = 0) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <span key={index} className={`star ${index < rating ? "filled" : ""}`}>
          ★
        </span>
      ))
  }

  if (loading) return <div className="loading-container">Chargement du concours...</div>
  if (error) return <div className="error-container">{error}</div>
  if (!concoursData)
    return (
      <div className="not-found-container">
        Aucun concours trouvé. <a href="/concours">Retour à la liste</a>
      </div>
    )

  const {
    title,
    organizerName,
    organizerLogo,
    dateStart,
    dateEnd,
    status,
    registrationLink,
    description,
    conditions,
    requiredDocuments,
    steps,
    documents,
    views,
    averageRating,
    numRatings,
    ratings,
  } = concoursData

  return (
    <div className="concours-detail-container">
      <div className="concours-header">
        <h1 className="concours-title">{title || "Titre non disponible"}</h1>
        <div className="organizer-info">
          {organizerLogo && (
            <img
              src={organizerLogo || "/placeholder.svg"}
              alt={organizerName || "Organisateur"}
              className="organizer-logo"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/placeholder.svg"
              }}
            />
          )}
          <span className="organizer-name">{organizerName || "Organisateur non spécifié"}</span>
        </div>
      </div>

      <div className="concours-section">
        <h2 className="section-title">SESSION: {dateStart ? new Date(dateStart).getFullYear() : "N/A"}</h2>
        <div className="concours-meta">
          <div className="meta-item1">
            <p className="meta-label">Statut</p>
            <p className="meta-value">{status || "Non spécifié"}</p>
          </div>
          <div className="meta-item1">
            <p className="meta-label">Début inscription</p>
            <p className="meta-value">{dateStart ? new Date(dateStart).toLocaleDateString("fr-FR") : "N/A"}</p>
          </div>
          <div className="meta-item1">
            <p className="meta-label">Fin inscription</p>
            <p className="meta-value">{dateEnd ? new Date(dateEnd).toLocaleDateString("fr-FR") : "N/A"}</p>
          </div>
        </div>
      </div>

      {registrationLink && (
        <div className="registration-link-container">
          <a href={registrationLink} className="registration-link" target="_blank" rel="noopener noreferrer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="link-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            Lien d'inscription
          </a>
        </div>
      )}

      <div className="concours-section">
        <h2 className="section-title">Présentation générale</h2>
        <p className="description">{description || "Aucune description disponible"}</p>
      </div>

      {conditions && conditions.length > 0 && (
        <div className="concours-section">
          <h2 className="section-title">Conditions de participation</h2>
          <ul className="conditions-list">
            {conditions.map((condition, index) => (
              <li key={index} className="condition-item">
                {condition}
              </li>
            ))}
          </ul>
        </div>
      )}

      {requiredDocuments && requiredDocuments.length > 0 && (
        <div className="concours-section">
          <h2 className="section-title">Documents Requis</h2>
          <ul className="documents-list">
            {requiredDocuments.map((doc, index) => (
              <li key={index} className="document-item">
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {steps && steps.length > 0 && (
        <div className="concours-section">
          <h2 className="section-title">Les étapes</h2>
          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={index} className="step-item">
                <h3 className="step-title">{step.title || "Étape " + (index + 1)}</h3>
                <p className="step-date">
                  {step.date ? new Date(step.date).toLocaleDateString("fr-FR") : "Date non spécifiée"}
                </p>
                <p className="step-description">{step.description || "Aucune description"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Associated Resources Section */}
      {associatedResources.length > 0 && (
        <div className="concours-section">
          <h2 className="section-title">Ressources associées</h2>
          <div className="resources-grid">
            {associatedResources.map((resource) => (
              <div key={resource._id} className="resource-card">
                <div className="resource-header">
                  <h3 className="resource-title">{resource.title}</h3>
                  <span className="resource-type">{resource.type}</span>
                </div>
                {resource.thumbnail && (
                  <div className="resource-thumbnail">
                    <img
                      src={resource.thumbnail || "/placeholder.svg"}
                      alt={resource.title}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                )}
                {resource.description && <p className="resource-description">{resource.description}</p>}
                <div className="resource-footer">
                  <div className="resource-rating">
                    {renderStars(resource.averageRating)}
                    <span className="rating-count">({resource.numRatings || 0})</span>
                  </div>
                  <a href={`/resources/${resource._id}`} className="resource-link">
                    Voir détails
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents && documents.length > 0 && (
        <div className="concours-section">
          <h2 className="section-title">Documents et formations pour préparer ce concours</h2>
          <DocumentList documents={documents} />
        </div>
      )}

      <div className="concours-section">
        <h2 className="section-title">Avis et Évaluations</h2>
        <p className="views-count">Nombre de vues : {views || 0}</p>
        <div className="ratings-summary">
          <p className="average-rating">Note moyenne : {(averageRating || 0).toFixed(1)} / 5</p>
          <div className="stars-display">{renderStars(Math.round(averageRating || 0))}</div>
          <p className="ratings-count">({numRatings || 0} avis)</p>
        </div>

        <form onSubmit={handleRatingSubmit} className="rating-form">
          <div className="form-group">
            <label htmlFor="rating" className="form-label">
              Votre note :
            </label>
            <div className="stars-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= userRating ? "filled" : ""}`}
                  onClick={() => setUserRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="comment" className="form-label">
              Votre commentaire :
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="comment-input"
              rows="3"
            ></textarea>
          </div>
          <button type="submit" className="submit-button">
            Soumettre l'avis
          </button>
        </form>

        <div className="user-ratings">
          <h3 className="user-ratings-title">Avis des utilisateurs</h3>
          {ratings && ratings.length > 0 ? (
            ratings.map((rating, index) => (
              <div key={index} className="rating-item">
                <div className="rating-header">
                  <div className="rating-stars">{renderStars(rating.rating || 0)}</div>
                  <span className="rating-date">
                    {rating.createdAt ? new Date(rating.createdAt).toLocaleDateString() : "Date inconnue"}
                  </span>
                </div>
                <p className="rating-user">{rating.user?.name || "Utilisateur anonyme"}</p>
                <p className="rating-comment">{rating.comment || "Pas de commentaire"}</p>
              </div>
            ))
          ) : (
            <p className="no-ratings">Aucun avis pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConcoursDetail

