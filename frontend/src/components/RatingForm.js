"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { rateFormation } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import "./RatingForm.css"

const RatingForm = ({ formationId, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const handleRatingClick = (value) => {
    setRating(value)
  }

  const handleRatingHover = (value) => {
    setHoverRating(value)
  }

  const handleRatingLeave = () => {
    setHoverRating(0)
  }

  const handleCommentChange = (e) => {
    setComment(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError("Vous devez être connecté pour laisser un avis")
      return
    }

    if (rating === 0) {
      setError("Veuillez sélectionner une note")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      await rateFormation(formationId, { rating, comment })

      setSuccess(true)
      setRating(0)
      setComment("")

      // Notifier le parent que la notation a été soumise
      if (onRatingSubmitted) {
        onRatingSubmitted()
      }
    } catch (error) {
      console.error("Erreur lors de la soumission de l'avis:", error)
      setError("Une erreur est survenue lors de la soumission de votre avis. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rating-form-container">
      <h3>Laisser un avis</h3>

      {!user ? (
        <div className="rating-login-message">
          Vous devez être <a href="/login">connecté</a> pour laisser un avis.
        </div>
      ) : success ? (
        <div className="rating-success-message">
          Votre avis a été soumis avec succès. Merci pour votre contribution !
          <button className="rating-new-button" onClick={() => setSuccess(false)}>
            Laisser un autre avis
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rating-form">
          <div className="rating-stars-container">
            <div className="rating-label">Votre note :</div>
            <div className="rating-stars-input" onMouseLeave={handleRatingLeave}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  size={32}
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => handleRatingHover(value)}
                  className={`rating-star ${(hoverRating || rating) >= value ? "filled" : ""}`}
                  fill={(hoverRating || rating) >= value ? "#FFD700" : "none"}
                  stroke={(hoverRating || rating) >= value ? "#FFD700" : "#ccc"}
                />
              ))}
            </div>
            <div className="rating-value">{rating > 0 ? `${rating}/5` : ""}</div>
          </div>

          <div className="rating-comment-container">
            <label htmlFor="comment" className="rating-label">
              Votre commentaire (optionnel) :
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              className="rating-comment"
              placeholder="Partagez votre expérience avec cette formation..."
              rows={4}
            />
          </div>

          {error && <div className="rating-error">{error}</div>}

          <button type="submit" className="rating-submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Envoi en cours..." : "Soumettre mon avis"}
          </button>
        </form>
      )}
    </div>
  )
}

export default RatingForm

