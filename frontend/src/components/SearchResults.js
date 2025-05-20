"use client"

import { useState, useEffect } from "react"
import { getFormations, getConcours, getDocuments, getEstablishments } from "../services/api"
import { Link } from "react-router-dom"
import { Calendar, MapPin, Users, BookOpen, FileText, Building, Star } from "lucide-react"
import "./SearchResults.css"

const SearchResults = ({ searchData }) => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!searchData) return

    const fetchResults = async () => {
      setLoading(true)
      setError(null)
      try {
        const { term, tab, filters } = searchData
        let fetchedResults = []

        // Déterminer quelles API appeler en fonction de l'onglet actif et des filtres
        if (tab === "all" || tab === "launched") {
          const concoursResponse = await getConcours()
          const concours = Array.isArray(concoursResponse) ? concoursResponse : concoursResponse.data || []

          // Filtrer les concours selon les critères
          const filteredConcours = concours.filter((item) => {
            // Filtrer par terme de recherche
            if (term && !matchesSearchTerm(item, term)) return false

            // Filtrer par statut
            if (filters.status !== "all" && item.status !== filters.status) return false

            // Filtrer par lieu
            if (filters.location !== "all" && item.location !== filters.location) return false

            // Filtrer par date
            if (!matchesDateRange(item, filters.date)) return false

            return true
          })

          // Ajouter un type pour identifier les résultats
          const formattedConcours = filteredConcours.map((item) => ({
            ...item,
            resultType: "concours",
          }))

          fetchedResults = [...fetchedResults, ...formattedConcours]
        }

        if (tab === "all" || tab === "prepare") {
          const formationsResponse = await getFormations()
          const formations = Array.isArray(formationsResponse) ? formationsResponse : formationsResponse.data || []

          // Filtrer les formations selon les critères
          const filteredFormations = formations.filter((item) => {
            // Filtrer par terme de recherche
            if (term && !matchesSearchTerm(item, term)) return false

            // Filtrer par statut (pour les formations, on peut utiliser isActive)
            if (filters.status !== "all") {
              if (filters.status === "active" && !item.isActive) return false
              // Autres conditions de statut si nécessaire
            }

            // Filtrer par date
            if (!matchesDateRange(item, filters.date)) return false

            return true
          })

          // Ajouter un type pour identifier les résultats
          const formattedFormations = filteredFormations.map((item) => ({
            ...item,
            resultType: "formation",
          }))

          fetchedResults = [...fetchedResults, ...formattedFormations]

          // Si on est dans l'onglet "Se préparer", on ajoute aussi les documents
          const documentsResponse = await getDocuments()
          const documents = Array.isArray(documentsResponse) ? documentsResponse : documentsResponse.data || []

          // Filtrer les documents selon les critères
          const filteredDocuments = documents.filter((item) => {
            // Filtrer par terme de recherche
            if (term && !matchesSearchTerm(item, term)) return false
            return true
          })

          // Ajouter un type pour identifier les résultats
          const formattedDocuments = filteredDocuments.map((item) => ({
            ...item,
            resultType: "document",
          }))

          fetchedResults = [...fetchedResults, ...formattedDocuments]
        }

        if (tab === "all" || tab === "establishments") {
          const establishmentsResponse = await getEstablishments()
          const establishments = Array.isArray(establishmentsResponse)
            ? establishmentsResponse
            : establishmentsResponse.data || []

          // Filtrer les établissements selon les critères
          const filteredEstablishments = establishments.filter((item) => {
            // Filtrer par terme de recherche
            if (term && !matchesSearchTerm(item, term)) return false

            // Filtrer par lieu
            if (filters.location !== "all" && item.country !== filters.location) return false

            return true
          })

          // Ajouter un type pour identifier les résultats
          const formattedEstablishments = filteredEstablishments.map((item) => ({
            ...item,
            resultType: "establishment",
          }))

          fetchedResults = [...fetchedResults, ...formattedEstablishments]
        }

        setResults(fetchedResults)
      } catch (err) {
        console.error("Erreur lors de la recherche:", err)
        setError("Une erreur est survenue lors de la recherche. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchData])

  // Fonction pour vérifier si un élément correspond au terme de recherche
  const matchesSearchTerm = (item, term) => {
    const searchLower = term.toLowerCase()
    const title = item.title || ""
    const name = item.name || ""
    const description = item.description || ""

    return (
      title.toLowerCase().includes(searchLower) ||
      name.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower)
    )
  }

  // Fonction pour vérifier si un élément correspond à la plage de dates
  const matchesDateRange = (item, dateRange) => {
    if (!dateRange.from && !dateRange.to) return true

    const itemDate = item.startDate || item.dateStart || item.createdAt || new Date()
    const itemDateObj = new Date(itemDate)

    if (dateRange.from) {
      const fromDate = new Date(dateRange.from)
      if (itemDateObj < fromDate) return false
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to)
      if (itemDateObj > toDate) return false
    }

    return true
  }

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Date non spécifiée"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch (error) {
      return "Date invalide"
    }
  }

  // Fonction pour rendre les étoiles de notation
  const renderStars = (rating = 0) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "star filled" : "star"}
            fill={star <= rating ? "#FFD700" : "none"}
            stroke={star <= rating ? "#FFD700" : "#ddd"}
          />
        ))}
      </div>
    )
  }

  // Rendu des résultats en fonction du type
  const renderResult = (result) => {
    switch (result.resultType) {
      case "concours":
        return (
          <div className="search-result-card concours-result" key={result._id}>
            <div className="result-header">
              <h3 className="result-title">{result.title}</h3>
              <span className={`result-status status-${result.status || "unknown"}`}>
                {result.status === "active"
                  ? "En cours"
                  : result.status === "upcoming"
                    ? "À venir"
                    : result.status === "past"
                      ? "Terminé"
                      : "Statut inconnu"}
              </span>
            </div>
            <div className="result-content">
              <div className="result-info">
                <div className="info-item">
                  <Calendar size={16} />
                  <span>
                    Inscription: {formatDate(result.dateStart)} - {formatDate(result.dateEnd)}
                  </span>
                </div>
                {result.location && (
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>{result.location}</span>
                  </div>
                )}
                {result.organizerName && (
                  <div className="info-item">
                    <Building size={16} />
                    <span>Organisé par: {result.organizerName}</span>
                  </div>
                )}
              </div>
              {result.rating > 0 && (
                <div className="result-rating">
                  {renderStars(result.rating)}
                  <span className="rating-count">({result.numRatings || 0} avis)</span>
                </div>
              )}
            </div>
            <div className="result-footer">
              <Link to={`/concours/${result._id}`} className="view-details-btn">
                Voir les détails
              </Link>
            </div>
          </div>
        )

      case "formation":
        return (
          <div className="search-result-card formation-result" key={result._id}>
            <div className="result-header">
              <h3 className="result-title">{result.title}</h3>
              <span className={`result-type ${result.type || "online"}`}>
                {result.type === "online"
                  ? "En ligne"
                  : result.type === "inperson"
                    ? "Présentiel"
                    : result.type === "hybrid"
                      ? "Hybride"
                      : "Formation"}
              </span>
            </div>
            <div className="result-content">
              <div className="result-info">
                <div className="info-item">
                  <Calendar size={16} />
                  <span>
                    Du {formatDate(result.startDate)} au {formatDate(result.endDate)}
                  </span>
                </div>
                {result.location && (
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>{result.location}</span>
                  </div>
                )}
                {result.business && (
                  <div className="info-item">
                    <Building size={16} />
                    <span>Par: {result.business.structureName || result.business.name || "Entreprise"}</span>
                  </div>
                )}
                {result.places && (
                  <div className="info-item">
                    <Users size={16} />
                    <span>{result.places} places</span>
                  </div>
                )}
              </div>
              {result.rating > 0 && (
                <div className="result-rating">
                  {renderStars(result.rating)}
                  <span className="rating-count">({result.numReviews || 0} avis)</span>
                </div>
              )}
            </div>
            <div className="result-footer">
              <div className="result-price">
                {result.price > 0 ? `${result.price.toLocaleString()} FCFA` : "Gratuit"}
              </div>
              <Link to={`/formations/${result._id}`} className="view-details-btn">
                Voir les détails
              </Link>
            </div>
          </div>
        )

      case "document":
        return (
          <div className="search-result-card document-result" key={result._id}>
            <div className="result-header">
              <h3 className="result-title">{result.title}</h3>
              <span className="result-type document">Document</span>
            </div>
            <div className="result-content">
              <div className="result-info">
                {result.subject && (
                  <div className="info-item">
                    <BookOpen size={16} />
                    <span>Matière: {result.subject}</span>
                  </div>
                )}
                {result.year && (
                  <div className="info-item">
                    <Calendar size={16} />
                    <span>Année: {result.year}</span>
                  </div>
                )}
                {result.business && (
                  <div className="info-item">
                    <Building size={16} />
                    <span>Par: {result.business.structureName || result.business.name || "Entreprise"}</span>
                  </div>
                )}
                {result.fileType && (
                  <div className="info-item">
                    <FileText size={16} />
                    <span>Type: {result.fileType}</span>
                  </div>
                )}
              </div>
              {result.rating > 0 && (
                <div className="result-rating">
                  {renderStars(result.rating)}
                  <span className="rating-count">({result.numRatings || 0} avis)</span>
                </div>
              )}
            </div>
            <div className="result-footer">
              <div className="result-price">
                {result.price > 0 ? `${result.price.toLocaleString()} FCFA` : "Gratuit"}
              </div>
              <Link to={`/documents/${result._id}`} className="view-details-btn">
                Voir les détails
              </Link>
            </div>
          </div>
        )

      case "establishment":
        return (
          <div className="search-result-card establishment-result" key={result._id}>
            <div className="result-header">
              <h3 className="result-title">{result.name}</h3>
              <span className="result-type establishment">Établissement</span>
            </div>
            <div className="result-content">
              <div className="result-info">
                {result.country && (
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>Pays: {result.country}</span>
                  </div>
                )}
                {result.website && (
                  <div className="info-item">
                    <Building size={16} />
                    <span>Site web: {result.website}</span>
                  </div>
                )}
              </div>
              {result.averageRatings && (
                <div className="result-rating">
                  {renderStars(result.averageRatings.overall || 0)}
                  <span className="rating-count">({result.numRatings || 0} avis)</span>
                </div>
              )}
            </div>
            <div className="result-footer">
              <Link to={`/establishments/${result._id}`} className="view-details-btn">
                Voir les détails
              </Link>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return <div className="search-results-loading">Recherche en cours...</div>
  }

  if (error) {
    return <div className="search-results-error">{error}</div>
  }

  if (!searchData) {
    return (
      <div className="search-results-empty">
        Utilisez la barre de recherche ci-dessus pour trouver des concours, formations et plus.
      </div>
    )
  }

  if (results.length === 0) {
    return <div className="search-results-empty">Aucun résultat trouvé pour votre recherche.</div>
  }

  return (
    <div className="search-results-container">
      <h2 className="results-title">
        {results.length} résultat{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
      </h2>
      <div className="search-results-grid">{results.map((result) => renderResult(result))}</div>
    </div>
  )
}

export default SearchResults
