"use client"

import { useState, useEffect } from "react"
import { getUserRatings, replyToBusinessResponse } from "../../services/api"
import { Send, MessageSquare, X, User, Building, Star } from "lucide-react"
import "./UserAvis.css"

const UserAvis = () => {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyError, setReplyError] = useState(null)

  useEffect(() => {
    const fetchUserRatings = async () => {
      try {
        setLoading(true)
        console.log("Tentative de récupération des avis utilisateur...")
        const data = await getUserRatings()
        console.log("Avis de l'utilisateur récupérés:", data)
        setRatings(data)
        setError(null)
      } catch (error) {
        console.error("Erreur lors du chargement des avis:", error)
        setError(`Impossible de charger vos avis: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRatings()
  }, [])

  const handleSubmitReply = async (e, ratingId) => {
    e.preventDefault()

    if (!replyText.trim()) {
      setReplyError("Veuillez entrer une réponse")
      return
    }

    try {
      setIsSubmitting(true)
      setReplyError(null)

      console.log("Soumission de la réponse pour l'avis ID:", ratingId)

      // Appel API pour soumettre la réponse utilisateur
      await replyToBusinessResponse(ratingId, {
        text: replyText,
        formationId: ratings.find((r) => r._id === ratingId)?.formationId,
      })

      // Fermer le formulaire de réponse
      setReplyingTo(null)
      setReplyText("")

      // Rafraîchir les avis
      const updatedRatings = await getUserRatings()
      setRatings(updatedRatings)
    } catch (error) {
      console.error("Erreur lors de la soumission de la réponse:", error)
      setReplyError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Vérifier si l'utilisateur peut répondre à un avis
  const canReplyTo = (rating) => {
    return (
      rating.businessResponse && // Il y a une réponse d'entreprise
      !rating.businessResponse.userReply // Pas encore de réponse utilisateur
    )
  }

  if (loading) {
    return <div className="loading-state">Chargement de vos avis...</div>
  }

  if (error) {
    return <div className="error-state">{error}</div>
  }

  if (ratings.length === 0) {
    return <div className="empty-state">Vous n'avez pas encore laissé d'avis.</div>
  }

  return (
    <div className="user-avis-container">
      <h2>Mes avis et réponses</h2>

      <div className="user-avis-list">
        {ratings.map((rating) => (
          <div key={rating._id} className="user-avis-item">
            <div className="avis-header">
              <div className="avis-formation-info">
                <h3>{rating.formation?.title || "Formation"}</h3>
                <span className="avis-date">{new Date(rating.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="avis-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= rating.rating ? "star-filled" : "star-empty"}>
                    <Star size={16} />
                  </span>
                ))}
              </div>
            </div>

            <p className="avis-comment">{rating.comment}</p>

            {/* Réponse de l'entreprise */}
            {rating.businessResponse && (
              <div className="business-response">
                <div className="response-header">
                  <div className="response-author">
                    <Building size={16} className="icon-business" />
                    <span className="business-name">Réponse de l'entreprise</span>
                    <span className="response-date">
                      {new Date(rating.businessResponse.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="response-text">{rating.businessResponse.text}</p>

                {/* Réponse de l'utilisateur si elle existe */}
                {rating.businessResponse.userReply && (
                  <div className="user-reply">
                    <div className="reply-header">
                      <div className="reply-author">
                        <User size={16} className="icon-user" />
                        <span className="user-name">Votre réponse</span>
                        <span className="reply-date">
                          {new Date(rating.businessResponse.userReply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="reply-text">{rating.businessResponse.userReply.text}</p>
                  </div>
                )}

                {/* Bouton pour répondre si pas encore de réponse utilisateur */}
                {true && replyingTo !== rating._id && (

                  <div className="reply-button-container">
                    <button className="reply-button" onClick={() => setReplyingTo(rating._id)}>
                      <MessageSquare size={16} />
                      Répondre à l'entreprise
                    </button>
                  </div>
                )}

                {/* Formulaire de réponse */}
                {replyingTo === rating._id && (
                  <div className="reply-form">
                    <form onSubmit={(e) => handleSubmitReply(e, rating._id)}>
                      <div className="form-header">
                        <h4>Répondre à l'entreprise</h4>
                        <button
                          type="button"
                          className="close-button"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyText("")
                            setReplyError(null)
                          }}
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Votre réponse à l'entreprise..."
                        rows={3}
                        className="reply-textarea"
                      />

                      {replyError && <div className="reply-error">{replyError}</div>}

                      <div className="form-actions">
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                          {isSubmitting ? "Envoi..." : "Envoyer"}
                          <Send size={16} />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserAvis
