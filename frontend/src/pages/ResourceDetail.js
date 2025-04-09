"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { getResourceById, getConcoursById, rateResource } from "../services/api"
import { isAuthenticated } from "../utils/auth"
import { FileText, Download, ArrowLeft, Star, ThumbsUp, AlertCircle } from "lucide-react"
import "./resources.css"

const ResourceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [concours, setConcours] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [previewError, setPreviewError] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  useEffect(() => {
    const fetchResourceAndConcours = async () => {
      try {
        setLoading(true)
        const resourceData = await getResourceById(id)
        console.log("Resource data:", resourceData)
        setResource(resourceData)

        // Si la ressource a un concoursId, récupérer les détails du concours
        if (resourceData.concoursId) {
          try {
            const concoursId =
              typeof resourceData.concoursId === "object" ? resourceData.concoursId._id : resourceData.concoursId

            console.log("Fetching concours with ID:", concoursId)
            const concoursData = await getConcoursById(concoursId)
            console.log("Concours data:", concoursData)
            setConcours(concoursData)
          } catch (concoursErr) {
            console.error("Error fetching concours:", concoursErr)
            // Ne pas bloquer l'affichage de la ressource si le concours n'est pas trouvé
          }
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching resource:", err)
        setError("Erreur lors du chargement de la ressource")
      } finally {
        setLoading(false)
      }
    }

    fetchResourceAndConcours()
  }, [id])

  const handleDownload = (e) => {
    e.preventDefault()

    if (!isAuthenticated()) {
      alert("Veuillez vous connecter pour télécharger ce document")
      navigate("/login")
      return
    }

    if (!resource || !resource.fileUrl) {
      alert("Aucun fichier disponible pour cette ressource")
      return
    }

    console.log("Downloading file from URL:", resource.fileUrl)
    window.open(resource.fileUrl, "_blank")
  }

  const handleRating = async (rating) => {
    if (!isAuthenticated()) {
      alert("Veuillez vous connecter pour noter cette ressource")
      navigate("/login")
      return
    }

    try {
      setRatingSubmitted(true) // Disable the rating stars during submission
      await rateResource(id, { rating })
      setUserRating(rating)

      // Update the resource with the new rating
      const updatedResource = await getResourceById(id)
      setResource(updatedResource)

      // Show success message
      // The component already shows a success message with the ThumbsUp icon
    } catch (err) {
      console.error("Error rating resource:", err)
      setRatingSubmitted(false) // Re-enable the rating stars

      // Show a user-friendly error message
      alert(typeof err === "string" ? err : "Erreur lors de la notation de la ressource. Veuillez réessayer plus tard.")
    }
  }

  const renderRatingStars = () => {
    return (
      <div className="rating-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`star-icon ${
              (hoverRating || userRating) >= star ? "filled" : ""
            } ${ratingSubmitted ? "disabled" : ""}`}
            size={24}
            fill={(hoverRating || userRating) >= star ? "currentColor" : "none"}
            onClick={() => !ratingSubmitted && handleRating(star)}
            onMouseEnter={() => !ratingSubmitted && setHoverRating(star)}
            onMouseLeave={() => !ratingSubmitted && setHoverRating(0)}
          />
        ))}
        {ratingSubmitted && (
          <span className="rating-success">
            <ThumbsUp size={16} /> Merci pour votre avis !
          </span>
        )}
      </div>
    )
  }

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`star-icon ${i < Math.floor(rating) ? "filled" : ""}`}
          size={20}
          fill={i < Math.floor(rating) ? "currentColor" : "none"}
        />
      ))
  }

  // Fonction pour déterminer si l'URL est externe
  const isExternalUrl = (url) => {
    if (!url) return false
    return url.startsWith("http://") || url.startsWith("https://")
  }

  // Fonction pour obtenir l'URL complète de l'image
  const getImageUrl = (url) => {
    if (!url) return null
    if (isExternalUrl(url)) return url

    // Si c'est un chemin relatif, ajouter le préfixe de l'API
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api"
    const baseUrl = apiUrl.replace("/api", "")
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
  }

  // Fonction pour vérifier si l'URL est un PDF
  const isPdfUrl = (url) => {
    if (!url) return false
    return url.toLowerCase().endsWith(".pdf")
  }

  const handleConcoursClick = (concoursId) => {
    if (concoursId) {
      navigate(`/concours/${concoursId}`)
    }
  }

  if (loading) {
    return <div className="loading">Chargement de la ressource...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!resource) {
    return <div className="not-found">Ressource non trouvée</div>
  }

  // Helper function to get concours name from different possible sources
  const getConcoursName = () => {
    // First, check if we have the concours data from the API call
    if (concours) {
      // Check different possible properties where the name might be stored
      if (concours.title) return concours.title
      if (concours.name) return concours.name

      // If we have concours data but no name/title, log it for debugging
      console.log("Concours data doesn't have title or name:", concours)
    }

    // If we don't have concours data, try to get it from the resource.concoursId object
    if (resource.concoursId && typeof resource.concoursId === "object") {
      if (resource.concoursId.title) return resource.concoursId.title
      if (resource.concoursId.name) return resource.concoursId.name

      // Log the concoursId object for debugging
      console.log("concoursId object doesn't have title or name:", resource.concoursId)
    }

    // If we have a concoursId but couldn't get a name, show a partial ID
    if (resource.concoursId) {
      const id = typeof resource.concoursId === "object" ? resource.concoursId._id : resource.concoursId
      return `Concours #${id.substring(0, 6)}...`
    }

    // If all else fails
    return "Non spécifié"
  }

  // Get the concours name using our helper function
  const concoursName = getConcoursName()

  // Formater le titre en fonction du type et du sujet
  const formattedTitle =
    resource.type === "past_paper"
      ? `ANCIENS SUJET ${resource.subject?.toUpperCase() || "CULTURE GENERALE"} ${concoursName.toUpperCase()} ${resource.year ? `- ${resource.year}` : ""}`
      : `SUJET ${resource.subject?.toUpperCase() || "CULTURE GENERALE"} ${concoursName.toUpperCase()} ${resource.year ? `- ${resource.year}` : ""}`

  // Sous-titre avec le nom du concours
  const subtitle = `CONCOURS ${concoursName.toUpperCase()}`

  const imageUrl = getImageUrl(resource.imageUrl)
  const fileUrl = resource.fileUrl
  const canPreviewPdf = isPdfUrl(fileUrl) && isExternalUrl(fileUrl)

  return (
    <div className="resource-detail-container">
      <div className="resource-detail-header">
        <h1 className="resource-detail-title">{formattedTitle}</h1>
        <span className="resource-detail-type">{resource.type === "past_paper" ? "Ancien sujet" : "Cours"}</span>
      </div>

      <div className="resource-detail-content">
        <div className="resource-detail-preview-container">
          {/* Prévisualisation du document */}
          {canPreviewPdf ? (
            <div className="resource-detail-pdf-preview">
              <iframe
                src={`${fileUrl}#toolbar=0&navpanes=0`}
                title="Prévisualisation du document"
                className="pdf-iframe"
                onError={() => setPreviewError(true)}
              />
              {previewError && (
                <div className="preview-error">
                  <AlertCircle size={48} />
                  <p>Impossible de prévisualiser ce document</p>
                </div>
              )}
            </div>
          ) : imageUrl ? (
            <div className="resource-detail-image-preview">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={resource.title}
                className="preview-image"
                onError={(e) => {
                  console.error("Error loading image:", e)
                  e.target.style.display = "none"
                  e.target.parentNode.innerHTML = `
                    <div class="preview-fallback">
                      <FileText size="64" />
                      <p>Prévisualisation non disponible</p>
                    </div>
                  `
                }}
              />
            </div>
          ) : (
            <div className="resource-detail-fallback">
              <FileText size={64} />
              <p>Prévisualisation non disponible</p>
            </div>
          )}
        </div>

        <div className="resource-detail-info">
          <h2 className="resource-detail-subtitle">{subtitle}</h2>

          <div className="resource-detail-rating">
            <div className="stars">{renderStars(resource.averageRating || 0)}</div>
            <span className="rating-count">({resource.numRatings || 0} avis)</span>
          </div>

          <div className="resource-detail-price">Gratuit</div>

          <div className="resource-detail-metadata">
            <div className="metadata-row">
              <span className="metadata-label">Catégorie:</span>
              <span className="metadata-value">Document</span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">Format:</span>
              <span className="metadata-value">Document numérique</span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">Livraison:</span>
              <span className="metadata-value">Immédiate</span>
            </div>
            {resource.year && (
              <div className="metadata-row">
                <span className="metadata-label">Année:</span>
                <span className="metadata-value">{resource.year}</span>
              </div>
            )}
            {resource.subject && (
              <div className="metadata-row">
                <span className="metadata-label">Matière:</span>
                <span className="metadata-value">{resource.subject}</span>
              </div>
            )}
            <div className="metadata-row">
              <span className="metadata-label">Concours:</span>
              <span className="metadata-value">{concoursName}</span>
            </div>
          </div>

          <button onClick={handleDownload} className="download-button">
            <Download size={20} />
            <span>Télécharger le document</span>
          </button>

          <div className="user-rating-section">
            <h3>Notez cette ressource</h3>
            {renderRatingStars()}
          </div>
        </div>
      </div>

      {resource.description && (
        <div className="resource-detail-description-section">
          <h2>Description</h2>
          <p className="resource-detail-description">{resource.description}</p>
        </div>
      )}

      <div className="resource-detail-footer">
        <div className="resource-detail-related">
          <h3>Utile pour la préparation du/des concours suivant(s)</h3>
          <div className="related-concours">
            {resource.concoursId ? (
              <div
                className="concours-tag clickable"
                onClick={() =>
                  handleConcoursClick(
                    typeof resource.concoursId === "object" ? resource.concoursId._id : resource.concoursId,
                  )
                }
              >
                {concoursName}
              </div>
            ) : (
              <div className="concours-tag">Non spécifié</div>
            )}
          </div>
        </div>

        <div className="resource-detail-source">
          <h3>À propos</h3>
          <p>Source: {resource.source || "ORG CI"}</p>
        </div>
      </div>

      <div className="resource-detail-actions">
        <Link to="/preparation" className="back-button">
          <ArrowLeft size={16} />
          <span>Retour aux ressources</span>
        </Link>
      </div>
    </div>
  )
}

export default ResourceDetail

