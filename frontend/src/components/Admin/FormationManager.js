"use client"

import { useState, useEffect } from "react"
import { getAdminFormations, deleteFormation } from "../../services/api"
import {  Trash, Eye, Search } from "lucide-react"
import "./FormationManager.css"

const FormationManager = () => {
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date") // date, title, business
  const [sortOrder, setSortOrder] = useState("desc") // asc, desc
  const [selectedFormation, setSelectedFormation] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)

  useEffect(() => {
    fetchFormations()
  }, [])

  const fetchFormations = async () => {
    setLoading(true)
    try {
      const data = await getAdminFormations()
      console.log("Formations récupérées:", data)
      setFormations(Array.isArray(data) ? data : [])
      setError(null)
    } catch (error) {
      console.error("Erreur lors du chargement des formations:", error)
      setError("Impossible de charger les formations. Veuillez réessayer.")
      setFormations([])
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
    setDeleteConfirmation(id)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation) return

    try {
      await deleteFormation(deleteConfirmation)
      setFormations(formations.filter((formation) => formation._id !== deleteConfirmation))
      setDeleteConfirmation(null)
    } catch (error) {
      console.error("Erreur lors de la suppression de la formation:", error)
      alert("Erreur lors de la suppression de la formation")
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmation(null)
  }

  const handleView = (formation) => {
    setSelectedFormation(formation)
    setShowModal(true)
  }

 //const handleEdit = (formation) => {
    // Rediriger vers la page d'édition ou ouvrir un modal d'édition
  //  window.location.href = `/admin/formations/edit/${formation._id}`
 // }

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
      console.error("Erreur de formatage de date:", error)
      return "Date invalide"
    }
  }

  // Filtrer et trier les formations
  const filteredAndSortedFormations = [...formations]
    .filter(
      (formation) =>
        formation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (formation.description && formation.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (formation.business &&
          formation.business.name &&
          formation.business.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (formation.business &&
          formation.business.structureName &&
          formation.business.structureName.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          : new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      } else if (sortBy === "title") {
        return sortOrder === "asc"
          ? (a.title || "").localeCompare(b.title || "")
          : (b.title || "").localeCompare(a.title || "")
      } else if (sortBy === "business") {
        const businessA = a.business?.name || a.business?.structureName || ""
        const businessB = b.business?.name || b.business?.structureName || ""
        return sortOrder === "asc" ? businessA.localeCompare(businessB) : businessB.localeCompare(businessA)
      }
      return 0
    })

  return (
    <div className="formation-manager">
      <div className="manager-header">
        <h2>Gestion des Formations</h2>
      
      </div>

      <div className="manager-toolbar">
        <div className="search-bar">
          <Search size={20} />
          <input type="text" placeholder="Rechercher une formation..." value={searchTerm} onChange={handleSearch} />
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
        <div className="loading-state">Chargement des formations...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : filteredAndSortedFormations.length === 0 ? (
        <div className="empty-state">
          <p>Aucune formation trouvée.</p>
        </div>
      ) : (
        <div className="formations-list1">
          <table className="formations-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Entreprise</th>
                <th>Type</th>
                <th>Prix</th>
                <th>Dates</th>
                <th>Inscrits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedFormations.map((formation) => (
                <tr key={formation._id}>
                  <td>{formation.title}</td>
                  <td>{formation.business?.structureName || formation.business?.name || "N/A"}</td>
                  <td>
                    {formation.type === "online"
                      ? "En ligne"
                      : formation.type === "inperson"
                        ? "Présentiel"
                        : "Hybride"}
                  </td>
                  <td>{formation.price ? formation.price.toLocaleString() : 0} FCFA</td>
                  <td>
                    {formatDate(formation.startDate)} - {formatDate(formation.endDate)}
                  </td>
                  <td>{formation.inscriptions || 0}</td>
                  <td className="actions-cell">
                    <button className="action-btn view-btn3" onClick={() => handleView(formation)}>
                      <Eye size={18} />
                    </button>
                    <button className="action-btn delete-btn2" onClick={() => handleDelete(formation._id)}>
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedFormation && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedFormation.title}</h3>
            <div className="formation-details">
              <div className="detail-row">
                <span className="detail-label">Entreprise:</span>
                <span className="detail-value">
                  {selectedFormation.business?.structureName || selectedFormation.business?.name || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">
                  {selectedFormation.type === "online"
                    ? "En ligne"
                    : selectedFormation.type === "inperson"
                      ? "Présentiel"
                      : "Hybride"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Prix:</span>
                <span className="detail-value">
                  {selectedFormation.price ? selectedFormation.price.toLocaleString() : 0} FCFA
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dates:</span>
                <span className="detail-value">
                  {formatDate(selectedFormation.startDate)} - {formatDate(selectedFormation.endDate)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Niveau:</span>
                <span className="detail-value">
                  {selectedFormation.level === "debutant"
                    ? "Débutant"
                    : selectedFormation.level === "intermediaire"
                      ? "Intermédiaire"
                      : "Avancé"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Places:</span>
                <span className="detail-value">{selectedFormation.places || "Illimité"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <p className="detail-value">{selectedFormation.description || "Aucune description"}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-close" onClick={() => setShowModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content confirmation-modal">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer cette formation ?</p>
            <div className="confirmation-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Annuler
              </button>
              <button className="btn-confirm" onClick={confirmDelete}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FormationManager

