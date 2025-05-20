"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  Star,
  StarHalf,
  Share2,
  BookOpen,
  Award,
  ThumbsUp,
  MessageSquare,
} from "lucide-react"
import "./DocumentDetails.css"
import { getDocumentById, rateDocument, addUserDocument } from "../services/api"
import { processImageUrl } from "../utils/imageUtils"

const DocumentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("description")
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        // Ajouter des paramètres pour récupérer les relations
        const data = await getDocumentById(id)
        console.log("Document data:", data) // Pour déboguer
        setDocument(data)
      } catch (error) {
        console.error("Error fetching document:", error)
        setError("Impossible de charger les détails du document")
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [id])

  const handleDownload = async () => {
    try {
      setDownloadLoading(true)
      setError("")
      setDownloadSuccess(false)

      console.log("Téléchargement du document:", document._id)

      // Enregistrer le téléchargement dans la base de données
      const response = await addUserDocument({ documentId: document._id })
      console.log("Réponse du téléchargement:", response)

      // Ouvrir le document dans un nouvel onglet
      window.open(document.fileUrl, "_blank")

      // Mettre à jour le compteur de téléchargements localement
      setDocument({
        ...document,
        downloads: (document.downloads || 0) + 1,
      })

      // Afficher un message de succès
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      setError("Impossible de télécharger le document. Veuillez réessayer.")
    } finally {
      setDownloadLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "Taille inconnue"
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const handleRatingChange = (rating) => {
    setUserRating(rating)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()

    if (userRating === 0) {
      alert("Veuillez attribuer une note avant de soumettre votre avis.")
      return
    }

    setIsSubmitting(true)

    try {
      // Implement this function in your API service
      await rateDocument(id, {
        rating: userRating,
        comment: userReview,
      })

      setReviewSuccess(true)

      // Refresh document data to show updated ratings
      const updatedDocument = await getDocumentById(id)
      setDocument(updatedDocument)

      // Reset form
      setUserReview("")
      setTimeout(() => setReviewSuccess(false), 3000)
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="stars-container">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="star filled" fill="#FFD700" color="#FFD700" />
          } else if (i === fullStars && hasHalfStar) {
            return <StarHalf key={i} className="star half-filled" fill="#FFD700" color="#FFD700" />
          } else {
            return <Star key={i} className="star" color="#D1D5DB" />
          }
        })}
        <span className="rating-value">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const getDocumentTypeIcon = () => {
    const fileType = document?.fileType?.toLowerCase() || ""

    if (fileType.includes("pdf")) {
      return <FileText size={40} className="doc-type-icon pdf" />
    } else if (fileType.includes("doc") || fileType.includes("word")) {
      return <FileText size={40} className="doc-type-icon word" />
    } else if (fileType.includes("xls") || fileType.includes("sheet")) {
      return <FileText size={40} className="doc-type-icon excel" />
    } else if (fileType.includes("ppt") || fileType.includes("presentation")) {
      return <FileText size={40} className="doc-type-icon powerpoint" />
    } else if (fileType.includes("image") || fileType.includes("jpg") || fileType.includes("png")) {
      return <FileText size={40} className="doc-type-icon image" />
    } else {
      return <FileText size={40} className="doc-type-icon" />
    }
  }

  // Traiter les URL d'images
  const getBusinessLogoUrl = () => {
    if (!document || !document.business || !document.business.logo) {
      return "/placeholder.svg"
    }
    return processImageUrl(document.business.logo)
  }

  if (loading) {
    return (
      <div className="document-loading-container">
        <div className="document-loading-spinner"></div>
        <p>Chargement des détails du document...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="document-error-container">
        <div className="document-error-icon">!</div>
        <h2>Une erreur est survenue</h2>
        <p>{error}</p>
        <button className="document-back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="document-not-found-container">
        <div className="document-not-found-icon">?</div>
        <h2>Document non trouvé</h2>
        <p>Le document que vous recherchez n'existe pas ou a été supprimé.</p>
        <button className="document-back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
      </div>
    )
  }

  const businessLogoUrl = getBusinessLogoUrl()

  return (
    <div className="document-details-page">
      <div className="document-details-container">
        <div className="document-details-header">
          <button className="document-back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
          <div className="document-share-button">
            <Share2 size={20} />
            <span>Partager</span>
          </div>
        </div>

        <div className="document-details-content">
          <div className="document-details-main">
            <div className="document-header-section">
              <div className="document-icon-container">{getDocumentTypeIcon()}</div>

              <div className="document-title-section">
                <h1 className="document-title">{document.title}</h1>

                <div className="document-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>Ajouté le {new Date(document.createdAt).toLocaleDateString()}</span>
                  </div>

                  {document.business && (
                    <div className="meta-item">
                      <User size={16} />
                      <span>Par {document.business.structureName || document.business.name || "Entreprise"}</span>
                    </div>
                  )}

                  <div className="meta-item">
                    <FileText size={16} />
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>

                  {document.downloads !== undefined && (
                    <div className="meta-item">
                      <Download size={16} />
                      <span>{document.downloads} téléchargements</span>
                    </div>
                  )}
                </div>

                {document.rating && (
                  <div className="document-rating-preview">
                    {renderStars(document.rating)}
                    <span className="rating-count">({document.numRatings || 0} avis)</span>
                  </div>
                )}
              </div>

              <div className="document-price-download">
                <div className="document-price">
                  {document.price > 0 ? (
                    <span className="price">{document.price.toLocaleString()} FCFA</span>
                  ) : (
                    <span className="free">Gratuit</span>
                  )}
                </div>

                <button className="download-button" onClick={handleDownload} disabled={downloadLoading}>
                  <Download size={20} />
                  <span>{downloadLoading ? "Téléchargement..." : "Télécharger"}</span>
                </button>

                {downloadSuccess && (
                  <div className="download-success-message">
                    <ThumbsUp size={16} />
                    <span>Document ajouté à votre bibliothèque</span>
                  </div>
                )}
              </div>
            </div>

            <div className="document-tabs">
              <button
                className={`tab-button ${activeTab === "description" ? "active" : ""}`}
                onClick={() => setActiveTab("description")}
              >
                <FileText size={18} />
                Description
              </button>
              <button
                className={`tab-button ${activeTab === "concours" ? "active" : ""}`}
                onClick={() => setActiveTab("concours")}
              >
                <Award size={18} />
                Concours concernés
              </button>
              <button
                className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                <MessageSquare size={18} />
                Avis ({document.numRatings || 0})
              </button>
            </div>

            <div className="document-tab-content">
              {activeTab === "description" && (
                <div className="tab-pane">
                  <h2 className="section-title">Description</h2>
                  <div className="document-description">
                    {document.description ? (
                      <p>{document.description}</p>
                    ) : (
                      <p className="no-description">Aucune description disponible pour ce document.</p>
                    )}
                  </div>

                  {document.tags && document.tags.length > 0 && (
                    <div className="document-tags">
                      <h3>Tags</h3>
                      <div className="tags-list">
                        {document.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "concours" && (
                <div className="tab-pane">
                  <h2 className="section-title">Concours concernés</h2>
                  {document.concours && document.concours.length > 0 ? (
                    <div className="concours-list">
                      {document.concours.map((concours, index) => (
                        <div key={concours._id || index} className="concours-item">
                          <div className="concours-icon">
                            <BookOpen size={24} />
                          </div>
                          <div className="concours-info">
                            <h3>{concours.title || concours.name || "Concours"}</h3>
                            <Link to={`/concours/${concours._id}`} className="view-concours-link">
                              Voir les détails
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-concours">
                      <p>Aucun concours n'est associé à ce document.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="tab-pane">
                  <h2 className="section-title">Avis et évaluations</h2>

                  <div className="reviews-summary">
                    <div className="average-rating">
                      <h3>Note moyenne</h3>
                      <div className="big-rating">{document.rating ? document.rating.toFixed(1) : "0.0"}</div>
                      <div className="big-stars">{renderStars(document.rating || 0)}</div>
                      <p className="rating-count">Basé sur {document.numRatings || 0} avis</p>
                    </div>

                    <div className="rating-distribution">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = document.ratings
                          ? document.ratings.filter((r) => Math.round(r.rating) === star).length
                          : 0
                        const percentage = document.numRatings ? (count / document.numRatings) * 100 : 0

                        return (
                          <div key={star} className="rating-bar">
                            <div className="rating-label">
                              {star} <Star size={14} fill={star > 0 ? "#FFD700" : "#D1D5DB"} />
                            </div>
                            <div className="rating-progress">
                              <div className="rating-progress-fill" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="rating-count">{count}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="add-review-section">
                    <h3>Donnez votre avis</h3>
                    <form onSubmit={handleReviewSubmit} className="review-form">
                      <div className="rating-input">
                        <p>Votre note:</p>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={`star-button ${userRating >= star ? "active" : ""}`}
                              onClick={() => handleRatingChange(star)}
                            >
                              <Star
                                size={24}
                                fill={userRating >= star ? "#FFD700" : "none"}
                                color={userRating >= star ? "#FFD700" : "#D1D5DB"}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="review-input">
                        <label htmlFor="review">Votre commentaire (optionnel):</label>
                        <textarea
                          id="review"
                          value={userReview}
                          onChange={(e) => setUserReview(e.target.value)}
                          placeholder="Partagez votre expérience avec ce document..."
                          rows={4}
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="submit-review-button"
                        disabled={isSubmitting || userRating === 0}
                      >
                        {isSubmitting ? "Envoi en cours..." : "Soumettre mon avis"}
                      </button>

                      {reviewSuccess && (
                        <div className="review-success">
                          <ThumbsUp size={16} />
                          <span>Merci pour votre avis !</span>
                        </div>
                      )}
                    </form>
                  </div>

                  <div className="reviews-list">
                    <h3>Avis des utilisateurs</h3>
                    {document.ratings && document.ratings.length > 0 ? (
                      document.ratings.map((review, index) => (
                        <div key={index} className="review-item">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <div className="reviewer-avatar">
                                {review.user?.firstName
                                  ? review.user.firstName.charAt(0)
                                  : review.user?.name?.charAt(0) || "U"}
                              </div>
                              <div className="reviewer-details">
                                <h4>
                                  {review.user?.firstName && review.user?.lastName
                                    ? `${review.user.firstName} ${review.user.lastName}`
                                    : review.user?.name || "Utilisateur anonyme"}
                                </h4>
                                <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="review-rating">{renderStars(review.rating)}</div>
                          </div>
                          {review.comment && (
                            <div className="review-content">
                              <p>{review.comment}</p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="no-reviews">
                        <p>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="document-details-sidebar">
            <div className="business-card">
              <h3>Proposé par</h3>
              <div className="business-info">
                {document.business?.logo ? (
                  <img
                    src={businessLogoUrl || "/placeholder.svg"}
                    alt={document.business.structureName || document.business.name}
                    className="business-logo"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder.svg?height=50&width=50"
                    }}
                  />
                ) : (
                  <div className="business-logo-placeholder">
                    {(document.business?.structureName || document.business?.name || "E").charAt(0)}
                  </div>
                )}
                <div>
                  <h4>{document.business?.structureName || document.business?.name || "Entreprise"}</h4>
                </div>
              </div>
            </div>

            <div className="related-documents">
              <h3>Documents similaires</h3>
              <div className="related-documents-list">
                <p className="no-related">Aucun document similaire trouvé.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentDetails
