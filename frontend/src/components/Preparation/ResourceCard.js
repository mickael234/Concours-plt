"use client"

import { FileText, Download } from "lucide-react"
import "./ResourceCard.css"

const ResourceCard = ({ resource }) => {
  const { _id, title, type, subject, averageRating = 0, numRatings = 0, fileUrl, imageUrl, concours, year } = resource

  const handleDownload = (e) => {
    e.stopPropagation()
    window.open(fileUrl, "_blank")
  }

  // Formater le titre en fonction du type et du sujet
  const formattedTitle =
    type === "past_paper"
      ? `ANCIENS SUJET ${subject?.toUpperCase() || "CULTURE GENERALE"} ${concours?.name?.toUpperCase() || "CAFOP IA"} ${year ? `- ${year}` : ""}`
      : `SUJET ${subject?.toUpperCase() || "CULTURE GENERALE"} ${concours?.name?.toUpperCase() || "CAFOP IA"} ${year ? `- ${year}` : ""}`

  // Sous-titre avec le nom du concours
  const subtitle = concours?.name ? `CONCOURS ${concours.name.toUpperCase()}` : "CONCOURS CAFOP (IA)"

  // Générer les étoiles pour la notation
  const renderStars = () => {
    const stars = []
    const rating = Math.round(averageRating)

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? "filled" : ""}`}>
          ★
        </span>,
      )
    }

    return stars
  }

  return (
    <div className="resource-card-container">
      <div className="resource-card-header">
        <h3 className="resource-card-title">{formattedTitle}</h3>
        <p className="resource-card-subtitle">{subtitle}</p>
      </div>

      <div className="resource-card-body">
        <div className="resource-card-preview">
          {imageUrl ? (
            <img src={imageUrl || "/placeholder.svg"} alt={title} className="resource-card-image" />
          ) : (
            <div className="resource-card-pdf">
              <FileText size={48} color="#e53e3e" />
            </div>
          )}
        </div>

        <div className="resource-card-info">
          <div className="resource-card-price">Gratuit</div>

          <div className="resource-card-rating">
            <div className="resource-card-stars">{renderStars()}</div>
            <span className="resource-card-reviews">({numRatings || 0} avis)</span>
          </div>

          <div className="resource-card-metadata">
            <div className="resource-card-metadata-row">
              <span className="resource-card-metadata-label">Catégorie:</span>
              <span className="resource-card-metadata-value">Document</span>
            </div>
            <div className="resource-card-metadata-row">
              <span className="resource-card-metadata-label">Format:</span>
              <span className="resource-card-metadata-value">Document numérique</span>
            </div>
            <div className="resource-card-metadata-row">
              <span className="resource-card-metadata-label">Livraison:</span>
              <span className="resource-card-metadata-value">Immédiate</span>
            </div>
          </div>
        </div>

        <button className="resource-card-download" onClick={handleDownload} aria-label="Télécharger">
          <Download size={24} />
        </button>
      </div>
    </div>
  )
}

export default ResourceCard

