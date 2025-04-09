"use client"

import { useState, useEffect } from "react"
import { getDocuments, deleteDocument } from "../../services/api"
import { Download, Edit, Trash, Eye, Search } from "lucide-react"
import DocumentForm from "./DocumentForm"
import "./DocumentManager.css"

const DocumentManager = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date") // date, title, business
  const [sortOrder, setSortOrder] = useState("desc") // asc, desc
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const data = await getDocuments()
      console.log("Documents récupérés:", data)
      setDocuments(data || [])
      setError(null)
    } catch (error) {
      console.error("Erreur lors du chargement des documents:", error)
      setError("Impossible de charger les documents. Veuillez réessayer.")
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      // Inverser l'ordre si on clique sur le même critère
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(criteria)
      setSortOrder("desc") // Par défaut, ordre décroissant
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await deleteDocument(id)
        setDocuments(documents.filter((document) => document._id !== id))
      } catch (error) {
        console.error("Erreur lors de la suppression du document:", error)
        alert("Erreur lors de la suppression du document")
      }
    }
  }

  const handleView = (document) => {
    setSelectedDocument(document)
    setShowModal(true)
  }

  //const handleAddDocument = () => {
  //  setShowForm(true)
  //}

  const handleFormSuccess = () => {
    fetchDocuments()
    setShowForm(false)
  }

  const handleFormCancel = () => {
    setShowForm(false)
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Filtrer et trier les documents
  const filteredAndSortedDocuments = [...documents]
    .filter(
      (document) =>
        document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (document.description && document.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (document.business &&
          document.business.name &&
          document.business.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === "title") {
        return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      } else if (sortBy === "business") {
        const businessA = a.business?.name || a.business?.structureName || ""
        const businessB = b.business?.name || b.business?.structureName || ""
        return sortOrder === "asc" ? businessA.localeCompare(businessB) : businessB.localeCompare(businessA)
      }
      return 0
    })

  // Si le formulaire est affiché, montrer uniquement le formulaire
  if (showForm) {
    return <DocumentForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
  }

  return (
    <div className="document-manager">
      <div className="manager-header">
        <h2>Gestion des Documents</h2>
        
      </div>

      <div className="manager-toolbar">
        <div className="search-bar">
          <Search size={20} />
          <input type="text" placeholder="Rechercher un document..." value={searchTerm} onChange={handleSearch} />
        </div>

        <div className="sort-options">
          <span>Trier par:</span>
          <button className={sortBy === "date" ? "active" : ""} onClick={() => handleSort("date")}>
            Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button className={sortBy === "title" ? "active" : ""} onClick={() => handleSort("title")}>
            Titre {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button className={sortBy === "business" ? "active" : ""} onClick={() => handleSort("business")}>
            Entreprise {sortBy === "business" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Chargement des documents...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : filteredAndSortedDocuments.length === 0 ? (
        <div className="empty-state">
          <p>Aucun document trouvé.</p>
        </div>
      ) : (
        <div className="documents-list">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Entreprise</th>
                <th>Type</th>
                <th>Taille</th>
                <th>Prix</th>
                <th>Téléchargements</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedDocuments.map((document) => (
                <tr key={document._id}>
                  <td>{document.title}</td>
                  <td>{document.business?.name || "N/A"}</td>
                  <td>{document.type}</td>
                  <td>{formatFileSize(document.size || 0)}</td>
                  <td>{document.price ? `${document.price.toLocaleString()} FCFA` : "Gratuit"}</td>
                  <td>{document.downloads || 0}</td>
                  <td className="actions-cell">
                    <button className="action-btn view-btn" onClick={() => handleView(document)}>
                      <Eye size={18} />
                    </button>
                    <button className="action-btn edit-btn">
                      <Edit size={18} />
                    </button>
                    <button className="action-btn delete-btn11" onClick={() => handleDelete(document._id)}>
                      <Trash size={18} />
                    </button>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn download-btn"
                    >
                      <Download size={18} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedDocument.title}</h3>
            <div className="document-details">
              <div className="detail-row">
                <span className="detail-label">Entreprise:</span>
                <span className="detail-value">
                  {selectedDocument.business?.structurename || selectedDocument.business?.name || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedDocument.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Taille:</span>
                <span className="detail-value">{formatFileSize(selectedDocument.size || 0)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Prix:</span>
                <span className="detail-value">
                  {selectedDocument.price ? `${selectedDocument.price.toLocaleString()} FCFA` : "Gratuit"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Téléchargements:</span>
                <span className="detail-value">{selectedDocument.downloads || 0}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <p className="detail-value">{selectedDocument.description || "Aucune description"}</p>
              </div>
            </div>
            <div className="modal-actions">
              <a href={selectedDocument.url} target="_blank" rel="noopener noreferrer" className="btn-download">
                <Download size={18} />
                Télécharger
              </a>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentManager

