"use client"

import { useState, useEffect } from "react"
import { Send, Edit, Trash, MessageSquare, X, User, Building } from "lucide-react"
import { respondToRating, deleteRatingResponse, replyToBusinessResponse } from "../services/api"
import "./AvisResponse.css"

const AvisResponse = ({ avis, businessId, onResponseSubmitted, canRespond = false, isUserOwner = false }) => {
  const [isResponding, setIsResponding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [responseText, setResponseText] = useState(avis.businessResponse?.text || "")
  const [replyText, setReplyText] = useState(avis.businessResponse?.userReply?.text || "")
  const [error, setError] = useState(null)
  const [replyError, setReplyError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isBusinessUser, setIsBusinessUser] = useState(false)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserType, setCurrentUserType] = useState("user") // "user" ou "business"

  // Logs pour le débogage
  console.log("Avis:", avis)
  console.log("ID entreprise:", businessId)
  console.log("Peut répondre (entreprise):", canRespond)
  console.log("Est propriétaire de l'avis (utilisateur):", isUserOwner)
  console.log("Réponse de l'entreprise:", avis.businessResponse)
  console.log("Réponse de l'utilisateur:", avis.businessResponse?.userReply)

  useEffect(() => {
    // Déterminer le type d'utilisateur actuel (particulier ou business)
    try {
      // Vérifier d'abord si on est sur le site particulier ou business
      const currentSite = document.querySelector(".particuliers-site") ? "user" : "business"
      console.log("Site actuel détecté:", currentSite)
      setCurrentUserType(currentSite)

      // Récupérer les infos utilisateur
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}")
      if (userInfo && userInfo._id) {
        setCurrentUserId(userInfo._id)
        setIsUserLoggedIn(true)
        console.log("ID de l'utilisateur connecté:", userInfo._id)
      }

      // Vérifier si l'utilisateur est une entreprise
      const businessInfo = JSON.parse(localStorage.getItem("businessInfo") || "{}")
      const isBusiness = !!businessInfo && !!businessInfo._id
      setIsBusinessUser(isBusiness)
      console.log("Est une entreprise:", isBusiness)
    } catch (error) {
      console.error("Erreur lors de la récupération des informations utilisateur:", error)
    }
  }, [])

  const handleSubmitResponse = async (e) => {
    e.preventDefault()

    if (!responseText.trim()) {
      setError("Veuillez entrer une réponse")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      console.log("Soumission de la réponse pour l'avis:", avis)

      // Utiliser _id au lieu de id si nécessaire
      const ratingId = avis._id || avis.id

      if (!ratingId) {
        throw new Error("ID de l'avis manquant")
      }

      // Appel API pour soumettre la réponse
      await respondToRating(ratingId, {
        text: responseText,
        businessId: businessId,
        formationId: avis.formationId,
      })

      // Fermer le formulaire de réponse
      setIsResponding(false)
      setIsEditing(false)

      // Notifier le parent que la réponse a été soumise
      if (onResponseSubmitted) {
        onResponseSubmitted()
      }
    } catch (error) {
      console.error("Erreur lors de la soumission de la réponse:", error)
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteResponse = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réponse ?")) {
      return
    }

    try {
      // Utiliser _id au lieu de id si nécessaire
      const ratingId = avis._id || avis.id

      if (!ratingId) {
        throw new Error("ID de l'avis manquant")
      }

      await deleteRatingResponse(ratingId, {
        formationId: avis.formationId,
      })

      // Notifier le parent que la réponse a été supprimée
      if (onResponseSubmitted) {
        onResponseSubmitted()
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la réponse:", error)
      alert("Une erreur est survenue lors de la suppression de la réponse.")
    }
  }

  // Fonction pour soumettre une réponse utilisateur
  const handleSubmitUserReply = async (e) => {
    e.preventDefault()

    if (!replyText.trim()) {
      setReplyError("Veuillez entrer une réponse")
      return
    }

    try {
      setIsSubmittingReply(true)
      setReplyError(null)

      console.log("Soumission de la réponse utilisateur pour l'avis:", avis)

      // Utiliser _id au lieu de id si nécessaire
      const ratingId = avis._id || avis.id

      if (!ratingId) {
        throw new Error("ID de l'avis manquant")
      }

      // Appel API pour soumettre la réponse utilisateur
      await replyToBusinessResponse(ratingId, {
        text: replyText,
        formationId: avis.formationId,
      })

      // Fermer le formulaire de réponse
      setIsReplying(false)

      // Notifier le parent que la réponse a été soumise
      if (onResponseSubmitted) {
        onResponseSubmitted()
      }
    } catch (error) {
      console.error("Erreur lors de la soumission de la réponse utilisateur:", error)
      setReplyError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // Vérifier si l'utilisateur peut répondre à la réponse de l'entreprise
  const canUserReply = () => {
    // Vérifier si l'utilisateur est connecté et est le propriétaire de l'avis
    console.log("isUserOwner:", isUserOwner)
    console.log("currentUserId:", currentUserId)
    console.log("avis.user:", avis.user)
    console.log("avis.user?._id:", avis.user?._id)
    console.log("currentUserType:", currentUserType)

    // Si nous sommes sur le site business, ne pas permettre la réponse utilisateur
    if (currentUserType === "business") {
      console.log("Sur le site business, pas de réponse utilisateur possible")
      return false
    }

    // Vérifier si l'utilisateur est le propriétaire de l'avis
    const isOwner =
      isUserOwner ||
      (currentUserId &&
        (currentUserId === avis.user?._id ||
          currentUserId === avis.user ||
          (typeof avis.user === "string" && currentUserId === avis.user)))

    // Vérifier s'il y a une réponse d'entreprise et pas encore de réponse utilisateur
    const hasBusinessResponse = !!avis.businessResponse
    const hasNoUserReply = !avis.businessResponse?.userReply

    console.log("Est propriétaire de l'avis:", isOwner)
    console.log("A une réponse d'entreprise:", hasBusinessResponse)
    console.log("N'a pas de réponse utilisateur:", hasNoUserReply)
    console.log("Peut répondre (utilisateur):", isOwner && hasBusinessResponse && hasNoUserReply)

    return isOwner && hasBusinessResponse && hasNoUserReply
  }

  // Si l'avis a déjà une réponse et qu'on n'est pas en mode édition
  if (avis.businessResponse && !isEditing) {
    return (
      <div className="avis-response">
        <div className="response-header">
          <div className="response-author">
            <Building size={16} className="icon-business" />
            <span className="business-name">Réponse de l'entreprise</span>
            <span className="response-date">{new Date(avis.businessResponse.createdAt).toLocaleDateString()}</span>
          </div>
          {/* Boutons d'édition/suppression uniquement pour les entreprises */}
          {isBusinessUser && canRespond && currentUserType === "business" && (
            <div className="response-actions">
              <button
                className="action-button edit-button"
                onClick={() => setIsEditing(true)}
                title="Modifier la réponse"
              >
                <Edit size={16} />
              </button>
              <button
                className="action-button delete-button"
                onClick={handleDeleteResponse}
                title="Supprimer la réponse"
              >
                <Trash size={16} />
              </button>
            </div>
          )}
        </div>
        <p className="response-text">{avis.businessResponse.text}</p>

        {/* Affichage de la réponse utilisateur si elle existe */}
        {avis.businessResponse.userReply && (
          <div className="user-reply">
            <div className="reply-header">
              <div className="reply-author">
                <User size={16} className="icon-user" />
                <span className="user-name">Réponse de l'utilisateur</span>
                <span className="reply-date">
                  {new Date(avis.businessResponse.userReply.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="reply-text">{avis.businessResponse.userReply.text}</p>
          </div>
        )}

        {/* Bouton pour que l'utilisateur réponde à la réponse de l'entreprise */}
        {isUserLoggedIn && currentUserType === "user" && canUserReply() && !isReplying && (
          <div className="reply-button-container12">
            <button className="reply-button12" onClick={() => setIsReplying(true)}>
              <MessageSquare size={16} />
              Répondre à l'entreprise
            </button>
          </div>
        )}

        {/* Formulaire de réponse utilisateur */}
        {isReplying && (
          <div className="avis-response-form user-reply-form">
            <form onSubmit={handleSubmitUserReply}>
              <div className="form-header12">
                <h4>Répondre à l'entreprise</h4>
                <button
                  type="button"
                  className="close-button"
                  onClick={() => {
                    setIsReplying(false)
                    setReplyText(avis.businessResponse?.userReply?.text || "")
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
                className="response-textarea"
              />

              {replyError && <div className="response-error">{replyError}</div>}

              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={isSubmittingReply}>
                  {isSubmittingReply ? "Envoi..." : "Envoyer"}
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }

  // Si on est en mode réponse ou édition
  if (isResponding || isEditing) {
    return (
      <div className="avis-response-form">
        <form onSubmit={handleSubmitResponse}>
          <div className="form-header">
            <h4>{isEditing ? "Modifier votre réponse" : "Répondre à cet avis"}</h4>
            <button
              type="button"
              className="close-button"
              onClick={() => {
                setIsResponding(false)
                setIsEditing(false)
                setResponseText(avis.businessResponse?.text || "")
              }}
            >
              <X size={18} />
            </button>
          </div>

          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Votre réponse..."
            rows={4}
            className="response-textarea"
          />

          {error && <div className="response-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Envoi..." : "Envoyer"}
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Bouton pour commencer à répondre (visible uniquement si canRespond est true et sur le site business)
  return canRespond && isBusinessUser && currentUserType === "business" ? (
    <div className="respond-button-container">
      <button className="respond-button" onClick={() => setIsResponding(true)}>
        <MessageSquare size={16} />
        Répondre à cet avis
      </button>
    </div>
  ) : null
}

export default AvisResponse
