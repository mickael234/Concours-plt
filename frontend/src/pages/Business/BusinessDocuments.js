"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Search, FileText, Edit, Trash, Eye, Download, Filter, ChevronDown, X, Tag, Clock } from "lucide-react"
import { getBusinessDocuments, deleteDocument } from "../../services/api"
import "./BusinessDocuments.css"

const BusinessDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    type: "all",
    price: "all",
    date: "all",
  })

  // Types de documents pour le filtre
  const documentTypes = [
    { id: "all", name: "Tous les types" },
    { id: "pdf", name: "PDF" },
    { id: "doc", name: "Document Word" },
    { id: "ppt", name: "Présentation" },
    { id: "xls", name: "Feuille de calcul" },
    { id: "image", name: "Image" },
    { id: "video", name: "Vidéo" },
    { id: "audio", name: "Audio" },
    { id: "other", name: "Autre" },
  ]

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await getBusinessDocuments()
      console.log("Réponse complète:", response)

      // Vérifier si la réponse est un tableau ou un objet avec une propriété data
      let documentsData = []
      if (Array.isArray(response)) {
        documentsData = response
      } else if (response && response.data && Array.isArray(response.data)) {
        documentsData = response.data
      } else if (response && typeof response === "object") {
        // Si c'est un objet mais pas un tableau, essayer de le convertir en tableau
        documentsData = [response]
      }

      console.log("Documents traités:", documentsData)
      setDocuments(documentsData)
      setError(null)
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error)
      setError("Impossible de charger les documents. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Formater le prix
  const formatPrice = (price) => {
    if (!price || price === 0) return "Gratuit"
    return `${price.toLocaleString()} FCFA`
  }

  // Filtrer les documents
  const filteredDocuments = documents.filter((document) => {
    // Vérifier si le document existe et a un titre
    if (!document || !document.title) return false

    // Filtre de recherche
    const matchesSearch =
      document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (document.description && document.description.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtre par type
    const matchesType = filters.type === "all" || document.type === filters.type

    // Filtre par prix
    const matchesPrice =
      filters.price === "all" ||
      (filters.price === "free" && (!document.price || document.price === 0)) ||
      (filters.price === "paid" && document.price > 0)

    // Filtre par date
    let matchesDate = true
    if (filters.date === "today") {
      const today = new Date()
      const docDate = new Date(document.createdAt)
      matchesDate = docDate.toDateString() === today.toDateString()
    } else if (filters.date === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const docDate = new Date(document.createdAt)
      matchesDate = docDate >= weekAgo
    } else if (filters.date === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      const docDate = new Date(document.createdAt)
      matchesDate = docDate >= monthAgo
    }

    return matchesSearch && matchesType && matchesPrice && matchesDate
  })

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value,
    })
  }

  const resetFilters = () => {
    setFilters({
      type: "all",
      price: "all",
      date: "all",
    })
    setSearchTerm("")
    setFilterOpen(false)
  }

  const handleEdit = (documentId) => {
    navigate(`/business/dashboard/documents/edit/${documentId}`)
  }

  const confirmDelete = (document) => {
    setDocumentToDelete(document)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!documentToDelete) return

    try {
      await deleteDocument(documentToDelete._id)
      // Rafraîchir la liste après suppression
      fetchDocuments()
      setShowDeleteModal(false)
      setDocumentToDelete(null)
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      setError("Impossible de supprimer le document. Veuillez réessayer.")
    }
  }

  const toggleFilters = () => {
    setFilterOpen(!filterOpen)
  }

  return (
    <div className="business-documents-container">
      <div className="documents-header">
      <button onClick={() => navigate(-1)} className="back-btn">
          ← Retour
        </button>
        <h2 className="section-title">Documents de l'entreprise</h2>
        <Link to="/business/dashboard/documents/add" className="add-document-btn">
          <Plus size={18} />
          Ajouter un document
        </Link>
      </div>

      <div className="documents-toolbar">
        <div className="search-container">
          <div className="search-input">
            <Search size={18} className="search-icon" />
            <input
              type="search"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <button className="filter-toggle" onClick={toggleFilters}>
            <Filter size={18} />
            Filtres
            <ChevronDown size={16} className={filterOpen ? "rotate-180" : ""} />
          </button>
        </div>

        {filterOpen && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Type de document</label>
              <div className="filter-options">
                {documentTypes.map((type) => (
                  <button
                    key={type.id}
                    className={filters.type === type.id ? "filter-option active" : "filter-option"}
                    onClick={() => handleFilterChange("type", type.id)}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Prix</label>
              <div className="filter-options">
                <button
                  className={filters.price === "all" ? "filter-option active" : "filter-option"}
                  onClick={() => handleFilterChange("price", "all")}
                >
                  Tous
                </button>
                <button
                  className={filters.price === "free" ? "filter-option active" : "filter-option"}
                  onClick={() => handleFilterChange("price", "free")}
                >
                  Gratuit
                </button>
                <button
                  className={filters.price === "paid" ? "filter-option active" : "filter-option"}
                  onClick={() => handleFilterChange("price", "paid")}
                >
                  Payant
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>Date d'ajout</label>
              <div className="filter-options">
                <button
                  className={filters.date === "all" ? "filter-option active" : "filter-option"}
                  onClick={() => handleFilterChange("date", "all")}
                >
                  Toutes les dates
                </button>
                <button
                  className={filters.date === "today" ? "filter-option active" : "filter-option"}
                  onClick={() => handleFilterChange("date", "today")}
                >
                  Aujourd'hui
                </button>
                <button
                  className={filters.date === "week" ? "filter-option active" : "filter-option"}
                  onClick={() => handleFilterChange("date", "week")}
                >
                  Cette semaine
                </button>
                <button
                  className={filters.date === "month" ? "filter-option active" : "filter-option"}
                  onClick={() => handleFilterChange("date", "month")}
                >
                  Ce mois
                </button>
              </div>
            </div>

            <div className="filter-actions">
              <button className="reset-filters" onClick={resetFilters}>
                <X size={16} />
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-container">{error}</div>}
      {loading && <div className="loading-container">Chargement des documents...</div>}

      {!loading && filteredDocuments.length === 0 && (
        <div className="no-documents">
          <FileText size={48} className="no-documents-icon" />
          <p>Aucun document trouvé.</p>
          <p>
            {searchTerm || filters.type !== "all" || filters.price !== "all" || filters.date !== "all"
              ? "Essayez de modifier vos filtres ou votre recherche."
              : "Commencez à partager des ressources avec vos utilisateurs."}
          </p>
          <Link to="/business/dashboard/documents/add" className="add-first-document-btn">
            <Plus size={18} />
            Ajouter votre premier document
          </Link>
        </div>
      )}

      {!loading && filteredDocuments.length > 0 && (
        <div className="documents-list">
          {filteredDocuments.map((document) => (
            <div className="document-card" key={document._id}>
              <div className="document-icon">
                <FileText size={24} />
              </div>
              <div className="document-info">
                <h3 className="document-title">{document.title}</h3>
                <p className="document-description">
                  {document.description || "Aucune description fournie pour ce document."}
                </p>

                <div className="document-meta">
                  {document.concours && document.concours.length > 0 && (
                    <span className="document-concours">
                      <Tag size={14} />
                      {document.concours.length} concours
                    </span>
                  )}
                  <span className="document-date">
                    <Clock size={14} />
                    Ajouté le {formatDate(document.createdAt)}
                  </span>
                </div>

                <div className="document-stats">
                  <span className="document-price">{formatPrice(document.price)}</span>
                  <span className="document-downloads">
                    <Download size={14} />
                    {document.downloads || 0} téléchargements
                  </span>
                </div>
              </div>

              <div className="document-actions">
                <button
                  className="action-btn edit-btn"
                  title="Modifier le document"
                  onClick={() => handleEdit(document._id)}
                >
                  <Edit size={18} />
                </button>

                <button
                  className="action-btn delete-btn"
                  title="Supprimer le document"
                  onClick={() => confirmDelete(document)}
                >
                  <Trash size={18} />
                </button>

                <Link
                  to={`/documents/${document._id}`}
                  className="action-btn view-btn"
                  title="Prévisualiser"
                  target="_blank"
                >
                  <Eye size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer le document "{documentToDelete?.title}" ?</p>
            <p className="warning-text">Cette action est irréversible.</p>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </button>
              <button className="confirm-btn" onClick={handleDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessDocuments
