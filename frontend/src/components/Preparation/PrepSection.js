"use client"

import { useState, useEffect } from "react"
import { getResources, getFormations, getDocuments } from "../../services/api"
import { useNavigate } from "react-router-dom"
import { FileText, Download, Star, BookOpen, Calendar, Filter } from "lucide-react"
import { isAuthenticated } from "../../utils/auth"
import "./PrepSection.css"

// Composant ResourceCard intégré directement dans PrepSection
const ResourceCard = ({ resource }) => {
  const navigate = useNavigate()
  const { _id, title, type, subject, averageRating = 0, numRatings = 0, fileUrl, concours, year, price = 0 } = resource

  const handleCardClick = () => {
    if (type === "formation") {
      navigate(`/formations/${_id}`)
    } else if (type === "document") {
      navigate(`/documents/${_id}`)
    } else {
      navigate(`/resources/${_id}`)
    }
  }

  const handleDownload = async (e) => {
    e.stopPropagation()

    if (!isAuthenticated()) {
      alert("Veuillez vous connecter pour télécharger ce document")
      navigate("/login")
      return
    }

    if (type === "formation") {
      // Pour les formations, rediriger vers la page d'inscription
      navigate(`/formations/${_id}/register`)
      return
    }

    if (!fileUrl) {
      alert("Aucun fichier disponible pour cette ressource")
      return
    }

    try {
      // Ouvrir l'URL dans un nouvel onglet
      window.open(fileUrl, "_blank")
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      alert("Erreur lors du téléchargement du document")
    }
  }

  // Formater le titre en fonction du type
  let formattedTitle = title
  if (type === "past_paper") {
    formattedTitle = `ANCIENS SUJET ${subject?.toUpperCase() || ""} ${concours?.name?.toUpperCase() || ""} ${year ? `- ${year}` : ""}`
  } else if (type === "document" && !title) {
    formattedTitle = `SUJET ${subject?.toUpperCase() || ""} ${concours?.name?.toUpperCase() || ""} ${year ? `- ${year}` : ""}`
  }

  // Sous-titre avec le nom du concours
  const subtitle = concours?.name
    ? `CONCOURS ${concours.name.toUpperCase()}`
    : concours?.title
      ? `CONCOURS ${concours.title.toUpperCase()}`
      : ""

  // Générer les étoiles pour la notation
  const renderStars = () => {
    const stars = []
    const rating = Math.round(averageRating)

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`star ${i <= rating ? "filled" : ""}`}
          size={16}
          fill={i <= rating ? "currentColor" : "none"}
        />,
      )
    }

    return stars
  }

  // Déterminer l'icône en fonction du type
  const renderIcon = () => {
    if (type === "formation") {
      return <BookOpen size={48} className="formation-icon" />
    } else if (type === "document") {
      return <FileText size={48} className="document-icon" />
    } else {
      return <FileText size={48} className="pdf-icon" />
    }
  }

  // Déterminer le texte du bouton en fonction du type
  const buttonText = type === "formation" ? "S'inscrire" : "Télécharger"

  return (
    <div className="resource-card" onClick={handleCardClick}>
      <div className="resource-card-content">
        <div className="resource-card-icon">{renderIcon()}</div>

        <div className="resource-card-info">
          <h3 className="resource-card-title">{formattedTitle}</h3>
          <p className="resource-card-subtitle">{subtitle}</p>

          <div className="resource-card-rating">
            <div className="stars">{renderStars()}</div>
            <span className="rating-count">({numRatings || 0} avis)</span>
          </div>

          <div className="resource-card-price">{price > 0 ? `${price.toLocaleString()} FCFA` : "Gratuit"}</div>

          <div className="resource-card-details">
            <div className="detail-row">
              <span className="detail-label">Catégorie:</span>
              <span className="detail-value">{type === "formation" ? "Formation" : "Document"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Format:</span>
              <span className="detail-value">
                {type === "formation" ? "Présentiel/En ligne" : "Document numérique"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Livraison:</span>
              <span className="detail-value">{type === "formation" ? "Selon calendrier" : "Immédiate"}</span>
            </div>
          </div>
        </div>

        <button
          className="download-button"
          onClick={handleDownload}
          aria-label={type === "formation" ? "S'inscrire à la formation" : "Télécharger le document"}
        >
          {type === "formation" ? <Calendar size={24} /> : <Download size={24} />}
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  )
}

const PrepSection = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all") // all, formation, document, past_paper

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)

      // Récupérer à la fois les ressources, les formations et les documents
      const [resourcesResponse, formationsResponse, documentsResponse] = await Promise.all([
        getResources(),
        getFormations().catch((err) => {
          console.error("Error fetching formations:", err)
          return []
        }),
        getDocuments().catch((err) => {
          console.error("Error fetching documents:", err)
          return []
        }),
      ])

      console.log("Resources fetched:", resourcesResponse)
      console.log("Formations fetched:", formationsResponse)
      console.log("Documents fetched:", documentsResponse)

      // Combiner toutes les ressources
      let allResources = []

      // Ajouter les ressources standard
      if (Array.isArray(resourcesResponse)) {
        allResources = [...resourcesResponse]
      } else if (resourcesResponse && Array.isArray(resourcesResponse.data)) {
        allResources = [...resourcesResponse.data]
      }

      // Ajouter les formations (converties en format ressource)
      if (Array.isArray(formationsResponse)) {
        const formattedFormations = formationsResponse.map((formation) => ({
          _id: formation._id,
          title: formation.title,
          type: "formation",
          subject: "formation",
          description: formation.description,
          concours: formation.concours,
          price: formation.price,
          averageRating: formation.averageRating || 0,
          numRatings: formation.numRatings || 0,
        }))
        allResources = [...allResources, ...formattedFormations]
      }

      // Ajouter les documents (convertis en format ressource)
      if (Array.isArray(documentsResponse)) {
        const formattedDocuments = documentsResponse.map((document) => ({
          _id: document._id,
          title: document.title,
          type: "document",
          subject: document.subject || "document",
          description: document.description,
          concours: document.concours,
          fileUrl: document.fileUrl,
          price: document.price,
          averageRating: document.averageRating || 0,
          numRatings: document.numRatings || 0,
        }))
        allResources = [...allResources, ...formattedDocuments]
      }

      setResources(allResources)
      setError(null)
    } catch (err) {
      console.error("Error fetching resources:", err)
      setError("Erreur lors du chargement des ressources")
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les ressources selon le type sélectionné
  const filteredResources = filter === "all" ? resources : resources.filter((resource) => resource.type === filter)

  return (
    <div className="prep-section">
      <div className="prep-section-header">
        <h1 className="section-title">Ressources de préparation</h1>
        <div className="filter-container">
          <Filter size={20} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">Tous les types</option>
            <option value="formation">Formations</option>
            <option value="document">Documents</option>
            <option value="past_paper">Anciens sujets</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Chargement des ressources...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredResources.length === 0 ? (
        <div className="no-resources-message">
          {filter === "all" ? "Aucune ressource disponible." : `Aucune ressource de type "${filter}" disponible.`}
        </div>
      ) : (
        <div className="resources-grid">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PrepSection

