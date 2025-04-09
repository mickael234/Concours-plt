"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { getUserFormations } from "../../services/api"
import { processImageUrl, revokeObjectUrl } from "../../utils/imageUtils"
import "./UserFormations.css"

const UserFormations = () => {
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const imageUrlsRef = useRef([])

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true)
        const data = await getUserFormations()
        setFormations(data)
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des formations:", err)
        setError("Impossible de charger vos formations. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchFormations()

    // Capturer la référence actuelle pour le nettoyage
    const currentImageUrls = imageUrlsRef.current

    // Nettoyer les URL d'objets lors du démontage du composant
    return () => {
      currentImageUrls.forEach((url) => revokeObjectUrl(url))
    }
  }, [])

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

  // Obtenir le statut en français
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "approved":
        return "Approuvée"
      case "rejected":
        return "Refusée"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  // Obtenir la classe CSS pour le statut
  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending"
      case "approved":
        return "status-approved"
      case "rejected":
        return "status-rejected"
      case "cancelled":
        return "status-cancelled"
      default:
        return ""
    }
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
    return <div className="loading-state">Chargement de vos formations...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (formations.length === 0) {
    return (
      <div className="empty-formations">
        <h2>Vous n'êtes inscrit à aucune formation</h2>
        <p>Explorez notre catalogue de formations et inscrivez-vous pour commencer votre apprentissage.</p>
        <Link to="/preparation" className="browse-formations-btn">
          Se préparer
        </Link>
      </div>
    )
  }

  return (
    <div className="user-formations-container">
      <h2>Mes formations</h2>
      <div className="formations-list">
        {formations.map((inscription) => (
          <div key={inscription._id} className="formation-card">
            <div className="formation-image">
              <img
                src={getProcessedImageUrl(inscription.formation.image) || "/placeholder.svg?height=150&width=300"}
                alt={inscription.formation.title}
                onError={(e) => {
                  console.log("Erreur de chargement d'image, utilisation du placeholder")
                  e.target.src = "/placeholder.svg?height=150&width=300"
                }}
              />
            </div>
            <div className="formation-content">
              <h3>{inscription.formation.title}</h3>
              <div className="formation-details">
                <p>
                  <strong>Date de début:</strong> {formatDate(inscription.formation.startDate)}
                </p>
                <p>
                  <strong>Statut:</strong>{" "}
                  <span className={`status-badge ${getStatusClass(inscription.status)}`}>
                    {getStatusLabel(inscription.status)}
                  </span>
                </p>
              </div>
              <div className="formation-actions">
                <Link to={`/formations/${inscription.formation._id}`} className="view-formation-btn">
                  Voir les détails
                </Link>
                {inscription.status === "approved" && (
                  <Link to={`/formations/${inscription.formation._id}/resources`} className="access-resources-btn">
                    Accéder aux ressources
                  </Link>
                )}
                {inscription.status === "pending" && (
                  <button className="cancel-inscription-btn">Annuler l'inscription</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserFormations
