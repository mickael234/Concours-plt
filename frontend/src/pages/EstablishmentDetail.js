"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getEstablishmentById, rateEstablishment } from "../services/api"
import { Star } from "lucide-react"
import "./EstablishmentDetail.css"
import RatingDisplay from "../components/RatingDisplay"
import { getToken, isAuthenticated } from "../utils/auth"
import { fixImageUrl } from "../utils/fileUtils"

const EstablishmentDetail = () => {
  const [establishment, setEstablishment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ratings, setRatings] = useState({
    teaching: 0,
    employability: 0,
    network: 0,
  })

  const { id } = useParams()

  useEffect(() => {
    const fetchEstablishment = async () => {
      try {
        setLoading(true)
        const response = await getEstablishmentById(id)

        // Normaliser la réponse pour s'assurer que toutes les propriétés existent
        const establishmentData = response.data || response

        // Initialiser les valeurs par défaut si elles n'existent pas
        if (!establishmentData.averageRatings) {
          establishmentData.averageRatings = {
            teaching: 0,
            employability: 0,
            network: 0,
            overall: 0,
          }
        }

        // Calculer la note globale si elle n'existe pas
        if (establishmentData.averageRatings && !establishmentData.averageRatings.overall) {
          const { teaching, employability, network } = establishmentData.averageRatings
          const values = [teaching || 0, employability || 0, network || 0].filter((v) => v > 0)
          establishmentData.averageRatings.overall =
            values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
        }

        // S'assurer que ratings existe
        if (!establishmentData.ratings) {
          establishmentData.ratings = []
        }

        // S'assurer que numRatings existe
        if (establishmentData.numRatings === undefined) {
          establishmentData.numRatings = establishmentData.ratings.length || 0
        }

        setEstablishment(establishmentData)
        setError(null)
      } catch (err) {
        console.error("Erreur:", err)
        setError("Erreur lors du chargement des informations de l'établissement")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchEstablishment()
    }
  }, [id])

  const handleRating = (category, value) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value,
    }))
  }

  const handleSubmitRating = async () => {
    try {
      if (!isAuthenticated()) {
        setError("Veuillez vous connecter pour soumettre une évaluation")
        return
      }

      const token = getToken()
      const response = await rateEstablishment(id, ratings, token)

      // Extraire les données de la réponse
      const responseData = response.data || response

      // Mettre à jour l'établissement avec les nouvelles évaluations
      setEstablishment((prev) => {
        if (!prev) return null

        // Créer une copie profonde pour éviter les mutations
        const updatedEstablishment = JSON.parse(JSON.stringify(prev))

        // Mettre à jour les moyennes et le nombre d'évaluations
        updatedEstablishment.averageRatings = responseData.averageRatings || {
          teaching: 0,
          employability: 0,
          network: 0,
          overall: 0,
        }

        // Calculer la note globale
        if (updatedEstablishment.averageRatings) {
          const { teaching, employability, network } = updatedEstablishment.averageRatings
          const values = [teaching || 0, employability || 0, network || 0].filter((v) => v > 0)
          updatedEstablishment.averageRatings.overall =
            values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
        }

        updatedEstablishment.numRatings = responseData.numRatings || 0

        // Ajouter la nouvelle évaluation à la liste
        if (!updatedEstablishment.ratings) {
          updatedEstablishment.ratings = []
        }

        // Ajouter la nouvelle évaluation avec les informations de l'utilisateur
        updatedEstablishment.ratings.push({
          user: {
            _id: responseData.userId || "unknown",
            name: responseData.userName || "Utilisateur",
            firstName: responseData.userFirstName,
            lastName: responseData.userLastName,
          },
          teaching: ratings.teaching,
          employability: ratings.employability,
          network: ratings.network,
          createdAt: new Date().toISOString(),
        })

        return updatedEstablishment
      })

      // Réinitialiser le formulaire
      setRatings({ teaching: 0, employability: 0, network: 0 })
      alert("Votre évaluation a été soumise avec succès!")
    } catch (error) {
      console.error("Error submitting rating:", error)
      setError("Erreur lors de la soumission de l'évaluation")
    }
  }

  const renderStars = (rating, interactive = false, category = null) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "span"}
            onClick={interactive ? () => handleRating(category, star) : undefined}
            className={`star-button ${interactive ? "interactive" : ""} ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            disabled={!interactive}
          >
            <Star className={`h-5 w-5 ${star <= rating ? "fill-current" : ""}`} />
          </button>
        ))}
      </div>
    )
  }

  if (loading) return <div>Chargement des informations de l'établissement...</div>
  if (error) return <div className="error-message">{error}</div>
  if (!establishment) return <div>Aucun établissement trouvé</div>

  const logoUrl = establishment.logo ? fixImageUrl(establishment.logo) : "/placeholder.svg"

  return (
    <div className="establishment-detail">
      <div className="establishment-header">
        <img src={logoUrl || "/placeholder.svg"} alt={establishment.name} className="establishment-logo" />
        <div className="establishment-title">
          <h1>{establishment.name}</h1>
          <p>{establishment.country}</p>
        </div>
      </div>

      <div className="establishment-content">
        <div className="establishment-info">
          <section className="about-section">
            <h2>À propos de l'établissement</h2>
            <p>{establishment.description}</p>
          </section>

          <section className="contact-section">
            <h2>Contact</h2>
            <div className="contact-info">
              <p>
                <strong>Adresse:</strong> {establishment.contact?.address || "Non spécifiée"}
              </p>
              <p>
                <strong>Téléphone:</strong> {establishment.contact?.phone || "Non spécifié"}
              </p>
              <p>
                <strong>Email:</strong> {establishment.contact?.email || "Non spécifié"}
              </p>
              <p>
                <strong>Site web:</strong>{" "}
                {establishment.website ? (
                  <a href={establishment.website} target="_blank" rel="noopener noreferrer">
                    {establishment.website}
                  </a>
                ) : (
                  "Non spécifié"
                )}
              </p>
            </div>
            {establishment.socialMedia && establishment.socialMedia.length > 0 && (
              <div className="social-links">
                {establishment.socialMedia.map((social, index) => (
                  <a key={index} href={social.url} className="social-link" target="_blank" rel="noopener noreferrer">
                    {social.platform}
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="associated-concours-section">
            <h2>Concours associés</h2>
            <div className="concours-grid">
              {establishment.concours && establishment.concours.length > 0 ? (
                establishment.concours.map((concours) => (
                  <Link to={`/concours/${concours._id}`} key={concours._id} className="concours-card">
                    <h3>{concours.title}</h3>
                    <div className="concours-rating">
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(concours.averageRating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="review-count">({concours.numRatings || 0} avis)</span>
                    </div>
                    <div className="organizer-info">
                      <span>Organisé par:</span>
                      <div className="flex items-center gap-2">
                        {concours.organizerLogo ? (
                          <img
                            src={concours.organizerLogo || "/placeholder.svg"}
                            alt={concours.organizerName}
                            className="organizer-logo"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg"
                              e.target.onerror = null
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-sm">{concours.organizerName?.charAt(0) || "O"}</span>
                          </div>
                        )}
                        <span className="font-medium">{concours.organizerName}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 italic">Aucun concours associé pour le moment.</p>
              )}
            </div>
          </section>
        </div>

        <div className="rating-section">
          <h2>Noter l'établissement</h2>
          <div className="rating-categories">
            <div className="rating-category">
              <h3>Qualité de l'enseignement</h3>
              {renderStars(ratings.teaching, true, "teaching")}
            </div>
            <div className="rating-category">
              <h3>Employabilité</h3>
              {renderStars(ratings.employability, true, "employability")}
            </div>
            <div className="rating-category">
              <h3>Réseau</h3>
              {renderStars(ratings.network, true, "network")}
            </div>
          </div>
          <button className="submit-rating" onClick={handleSubmitRating}>
            Soumettre l'évaluation
          </button>
        </div>

        <div className="reviews-section">
          <h2>Avis global ({establishment.numRatings || 0} avis)</h2>
          {establishment.ratings && establishment.ratings.length > 0 ? (
            <RatingDisplay
              ratings={establishment.ratings || []}
              averageRatings={
                establishment.averageRatings || {
                  teaching: 0,
                  employability: 0,
                  network: 0,
                  overall: 0,
                }
              }
            />
          ) : (
            <p>Aucun avis disponible pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default EstablishmentDetail
