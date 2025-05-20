"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { getFormationById } from "../services/api"
import { Calendar, Clock, User, MapPin, Award, FileText, Star, BookOpen } from 'lucide-react'
import { processImageUrl, revokeObjectUrl } from "../utils/imageUtils"
import "./FormationDetail.css"
import RatingForm from "../components/RatingForm"
import AvisResponse from "../components/AvisResponse"

const FormationDetails = () => {
  const { id } = useParams()
  const [formation, setFormation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("description")
  const imageUrlsRef = useRef([])
  const [isBusinessOwner, setIsBusinessOwner] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        setLoading(true)
        const data = await getFormationById(id)
        console.log("Formation data:", data)
        setFormation(data)
        setError(null)
      } catch (error) {
        console.error("Erreur lors du chargement de la formation:", error)
        setError("Impossible de charger les détails de la formation. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchFormation()
    }

    // Capturer la référence actuelle pour le nettoyage
    const currentImageUrls = imageUrlsRef.current

    // Nettoyer les URL d'objets lors du démontage du composant
    return () => {
      currentImageUrls.forEach((url) => revokeObjectUrl(url))
    }
  }, [id])

  // Vérifier si l'utilisateur connecté est le propriétaire de l'entreprise
  useEffect(() => {
    const checkBusinessOwner = () => {
      try {
        const businessInfo = JSON.parse(localStorage.getItem("businessInfo") || "{}")
        const isOwner = businessInfo && businessInfo._id === formation?.business?._id
        setIsBusinessOwner(isOwner)
        console.log("Est propriétaire de l'entreprise:", isOwner)
      } catch (error) {
        console.error("Erreur lors de la vérification du propriétaire:", error)
        setIsBusinessOwner(false)
      }
    }

    // Récupérer l'ID de l'utilisateur connecté
    const getUserId = () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}")
        if (userInfo && userInfo._id) {
          setCurrentUserId(userInfo._id)
          console.log("ID de l'utilisateur connecté:", userInfo._id)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'ID utilisateur:", error)
        setCurrentUserId(null)
      }
    }

    if (formation) {
      checkBusinessOwner()
      getUserId()
    }
  }, [formation])

  // Fonction pour rafraîchir les données de la formation après une notation ou une réponse
  const handleRatingSubmitted = async () => {
    try {
      const updatedFormation = await getFormationById(id)
      setFormation(updatedFormation)
      console.log("Formation mise à jour après notation ou réponse")
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données:", error)
    }
  }

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Date non spécifiée"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Calculer la durée correctement
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "Non spécifiée"

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Calculer la différence en jours
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Si c'est le même jour ou moins d'un jour
    if (diffDays === 0) {
      // Calculer la différence en heures
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
      return `${diffHours} heure${diffHours > 1 ? "s" : ""}`
    }

    // Si c'est plus d'un jour
    return `${diffDays} jour${diffDays > 1 ? "s" : ""}`
  }

  // Fonction pour afficher les étoiles de notation
  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "star-filled" : "star-empty"}
            fill={star <= rating ? "#FFD700" : "none"}
            stroke={star <= rating ? "#FFD700" : "#ccc"}
          />
        ))}
        <span className="rating-value">({rating.toFixed(1)})</span>
      </div>
    )
  }

  // Traiter les URL d'images
  const getProcessedImageUrl = (url) => {
    const processedUrl = processImageUrl(url)

    // Si c'est une URL d'objet blob, la stocker pour nettoyage ultérieur
    if (processedUrl && processedUrl.startsWith("blob:")) {
      imageUrlsRef.current.push(processedUrl)
    }

    return processedUrl
  }

  if (loading) {
    return (
      <div className="formation-detail-container">
        <div className="loading-state">Chargement des détails de la formation...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="formation-detail-container">
        <div className="error-state">{error}</div>
      </div>
    )
  }

  if (!formation) {
    return (
      <div className="formation-detail-container">
        <div className="error-state">Formation non trouvée</div>
      </div>
    )
  }

  // Traiter les URL d'images
  const formationImageUrl = getProcessedImageUrl(formation.imageUrl || formation.image)
  const businessLogoUrl = formation.business ? getProcessedImageUrl(formation.business.logo) : "/placeholder.svg"

  return (
    <div className="formation-detail-container">
      <div className="formation-detail-header">
        <h1>{formation.title}</h1>
        <div className="formation-detail-meta">
          <span className="formation-detail-category">{formation.type}</span>
          <span className="formation-detail-status">{formation.isActive ? "Active" : "Inactive"}</span>
          {formation.rating > 0 && (
            <div className="formation-rating">
              {renderStars(formation.rating)}
              <span className="reviews-count">({formation.numReviews} avis)</span>
            </div>
          )}
        </div>
      </div>

      <div className="formation-detail-content">
        <div className="formation-detail-main">
          <div className="formation-detail-image">
            <img
              src={formationImageUrl || "/placeholder.svg"}
              alt={formation.title}
              onError={(e) => {
                console.log("Erreur de chargement d'image, utilisation du placeholder")
                e.target.src = "/placeholder.svg?height=300&width=600"
              }}
            />
          </div>

          <div className="formation-detail-info-cards">
            <div className="info-card">
              <Calendar size={20} />
              <div>
                <h3>Date de début</h3>
                <p>{formatDate(formation.startDate)}</p>
              </div>
            </div>

            <div className="info-card">
              <Clock size={20} />
              <div>
                <h3>Durée</h3>
                <p>{calculateDuration(formation.startDate, formation.endDate)}</p>
              </div>
            </div>

            <div className="info-card">
              <User size={20} />
              <div>
                <h3>Places disponibles</h3>
                <p>{formation.places !== undefined ? formation.places : "Non limité"} places</p>
              </div>
            </div>

            <div className="info-card">
              <MapPin size={20} />
              <div>
                <h3>Lieu</h3>
                <p>{formation.location || "En ligne"}</p>
              </div>
            </div>
          </div>

          {/* Onglets pour la navigation */}
          <div className="formation-tabs">
            <button
              className={`tab-button ${activeTab === "description" ? "active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tab-button ${activeTab === "program" ? "active" : ""}`}
              onClick={() => setActiveTab("program")}
            >
              Programme
            </button>
            <button
              className={`tab-button ${activeTab === "concours" ? "active" : ""}`}
              onClick={() => setActiveTab("concours")}
            >
              Concours concernés
            </button>
            <button
              className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Avis ({formation.numReviews || 0})
            </button>
          </div>

          {/* Contenu des onglets */}
          <div className="tab-content">
            {activeTab === "description" && (
              <div className="tab-pane">
                <div className="formation-detail-description">
                  <h2>Description</h2>
                  <p>{formation.description}</p>
                </div>

                <div className="formation-detail-sections">
                  {formation.objectives && formation.objectives.length > 0 && (
                    <div className="formation-detail-section">
                      <h2>Objectifs</h2>
                      <ul>
                        {formation.objectives.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {formation.prerequisites && formation.prerequisites.length > 0 && (
                    <div className="formation-detail-section">
                      <h2>Prérequis</h2>
                      <ul>
                        {formation.prerequisites.map((prerequisite, index) => (
                          <li key={index}>{prerequisite}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {formation.instructor && (
                  <div className="formation-detail-instructor">
                    <h2>Formateur</h2>
                    <div className="instructor-card">
                      <div className="instructor-avatar">
                        <img
                          src={
                            formation.instructor.avatar
                              ? getProcessedImageUrl(formation.instructor.avatar)
                              : "/placeholder.svg?height=100&width=100"
                          }
                          alt={formation.instructor.name}
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=100&width=100"
                          }}
                        />
                      </div>
                      <div className="instructor-info">
                        <h3>{formation.instructor.name}</h3>
                        <p>{formation.instructor.title}</p>
                        <p>{formation.instructor.bio}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "program" && (
              <div className="tab-pane">
                <h2>Programme de la formation</h2>
                {formation.program && formation.program.length > 0 ? (
                  <div className="program-modules">
                    {formation.program.map((module, index) => (
                      <div key={index} className="program-module">
                        <h3>
                          Module {index + 1}: {module.title}
                        </h3>
                        <p>{module.description}</p>
                        {module.topics && module.topics.length > 0 && (
                          <ul>
                            {module.topics.map((topic, topicIndex) => (
                              <li key={topicIndex}>{topic}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Aucun programme détaillé n'est disponible pour cette formation.</p>
                )}
              </div>
            )}

            {/* Nouvel onglet pour les concours concernés */}
            {activeTab === "concours" && (
              <div className="tab-pane">
                <h2>Concours concernés par cette formation</h2>
                {formation.concours && formation.concours.length > 0 ? (
                  <div className="concours-list">
                    {formation.concours.map((concours) => (
                      <div key={concours._id} className="concours-item">
                        <div className="concours-icon">
                          <BookOpen size={24} />
                        </div>
                        <div className="concours-info">
                          <h3>{concours.title}</h3>
                          <Link to={`/concours/${concours._id}`} className="view-concours-link">
                            Voir les détails
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Aucun concours n'est associé à cette formation.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="tab-pane">
                <h2>Avis des participants</h2>

                {/* Formulaire de notation */}
                <RatingForm formationId={formation._id} onRatingSubmitted={handleRatingSubmitted} />

                {formation.ratings && formation.ratings.length > 0 ? (
                  <div className="reviews-container">
                    <div className="reviews-summary">
                      <div className="average-rating">
                        <h3>Note moyenne</h3>
                        <div className="big-rating">{formation.rating.toFixed(1)}</div>
                        {renderStars(formation.rating)}
                        <p>{formation.numReviews} avis</p>
                      </div>
                      <div className="rating-distribution">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = formation.ratings.filter((r) => Math.round(r.rating) === star).length
                          const percentage = formation.ratings.length > 0 ? (count / formation.ratings.length) * 100 : 0

                          return (
                            <div key={star} className="rating-bar">
                              <div className="rating-label">{star} étoiles</div>
                              <div className="rating-progress">
                                <div className="rating-progress-fill" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <div className="rating-count">{count}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="reviews-list">
                      {formation.ratings.map((review, index) => {
                        // Logs de débogage pour vérifier les valeurs
                        console.log("Review user:", review.user);
                        console.log("Current user ID:", currentUserId);
                        console.log("Is user owner:", currentUserId && (currentUserId === (review.user?._id || review.user)));
                        
                        return (
                          <div key={index} className="review-item">
                            <div className="review-header">
                              <div className="reviewer-info">
                                <h4>
                                  {review.user?.firstName && review.user?.lastName
                                    ? `${review.user.firstName} ${review.user.lastName}`
                                    : review.user?.name || "Utilisateur anonyme"}
                                </h4>
                                <p className="review-date">{formatDate(review.createdAt)}</p>
                              </div>
                              <div className="review-rating">{renderStars(review.rating)}</div>
                            </div>
                            <div className="review-content">
                              <p>{review.comment || "Aucun commentaire"}</p>
                            </div>
                            
                            {/* Ajout du composant AvisResponse pour les réponses aux avis */}
                            <AvisResponse 
                              avis={{
                                ...review,
                                formationId: formation._id,
                                user: review.user  // Assurez-vous que l'utilisateur est correctement passé
                              }}
                              businessId={formation.business?._id}
                              onResponseSubmitted={handleRatingSubmitted}
                              canRespond={isBusinessOwner}
                              isUserOwner={currentUserId && (currentUserId === (review.user?._id || review.user))}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="no-reviews-message">
                    Aucun avis n'a encore été laissé pour cette formation. Soyez le premier à donner votre avis !
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="formation-detail-sidebar">
          <div className="formation-detail-price-card">
            <h2>Prix</h2>
            <div className="formation-price">
              {formation.price === 0 ? (
                <span className="free-price">Gratuit</span>
              ) : (
                <span>{formation.price?.toLocaleString()} FCFA</span>
              )}
            </div>
            <Link to={`/formations/${formation._id}/register`} className="register-button">
              S'inscrire à cette formation
            </Link>
          </div>

          {formation.certifications && formation.certifications.length > 0 && (
            <div className="formation-detail-certifications">
              <h2>Certifications</h2>
              <ul>
                {formation.certifications.map((certification, index) => (
                  <li key={index}>
                    <Award size={16} />
                    <span>{certification}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {formation.documents && formation.documents.length > 0 && (
            <div className="formation-detail-documents">
              <h2>Documents</h2>
              <ul>
                {formation.documents.map((document, index) => (
                  <li key={index}>
                    <FileText size={16} />
                    <a href={document.url} target="_blank" rel="noopener noreferrer">
                      {document.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {formation.business && (
            <div className="formation-detail-business">
              <h2>Proposé par</h2>
              <div className="business-card">
                <img
                  src={businessLogoUrl || "/placeholder.svg"}
                  alt={formation.business.structureName || formation.business.name}
                  className="business-logo"
                  onError={(e) => {
                    console.log("Erreur de chargement du logo, utilisation du placeholder")
                    e.target.src = "/placeholder.svg?height=50&width=50"
                  }}
                />
                <div className="business-info">
                  <h3>{formation.business.structureName || formation.business.name}</h3>
                  <p>{formation.business.description || "Aucune description disponible"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FormationDetails