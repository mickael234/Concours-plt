"use client"

import { useState, useEffect } from "react"
import { getUserDocuments, deleteUserDocument } from "../../services/api"
import { FileText, Filter, ExternalLink } from "lucide-react"
import "./UserDocuments.css"

const UserDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all") // all, document, resource, past_paper

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        const data = await getUserDocuments()
        setDocuments(data || [])
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des documents:", err)
        setError("Impossible de charger vos documents. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const handleDelete = async (documentId) => {
    try {
      await deleteUserDocument(documentId)
      setDocuments(documents.filter((doc) => doc._id !== documentId))
    } catch (err) {
      console.error("Erreur lors de la suppression du document:", err)
      setError("Impossible de supprimer le document. Veuillez réessayer.")
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) {
      return "pdf"
    } else if (fileType.includes("image")) {
      return "image"
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return "doc"
    } else if (fileType.includes("excel") || fileType.includes("sheet")) {
      return "xls"
    } else {
      return "file"
    }
  }

  // Filtrer les documents selon le type sélectionné
  const filteredDocuments = filter === "all" ? documents : documents.filter((doc) => doc.type === filter)

  if (loading && !documents.length) {
    return <div className="loading-state">Chargement de vos documents...</div>
  }

  return (
    <div className="user-documents-container">
      <div className="documents-header">
        <h1>Mes Documents Téléchargés</h1>
        <div className="filter-container">
          <Filter size={18} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">Tous les types</option>
            <option value="document">Documents</option>
            <option value="resource">Ressources</option>
            <option value="past_paper">Anciens sujets</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="documents-section">
        <h2>Mes documents téléchargés</h2>

        {documents.length === 0 ? (
          <div className="empty-documents">
            <FileText size={48} />
            <p>Vous n'avez pas encore téléchargé de documents</p>
            <p className="empty-subtitle">Parcourez nos ressources pour télécharger des documents</p>
            <a href="/preparation" className="browse-btn">
              Parcourir les ressources
            </a>
          </div>
        ) : (
          <div className="documents-grid">
            {filteredDocuments.map((document) => (
              <div key={document._id} className="document-card">
                <div className={`document-icon ${getFileIcon(document.type)}`}>
                  <FileText size={24} />
                </div>
                <div className="document-info">
                  <h3 className="document-name">{document.name}</h3>
                  <p className="document-date">Téléchargé le {new Date(document.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="document-actions">
                  <a href={document.url} target="_blank" rel="noopener noreferrer" className="view-btn">
                    <ExternalLink size={16} />
                    <span>Ouvrir</span>
                  </a>
                  <button onClick={() => handleDelete(document._id)} className="delete-btn">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDocuments

