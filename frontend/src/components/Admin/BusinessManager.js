"use client"

import { useState, useEffect } from "react"
import { fetchBusinesses, deleteBusiness } from "../../services/api"
import {  Trash, Eye, Search} from "lucide-react"
import "./BusinessManager.css"

const BusinessManager = () => {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date") // date, name, email
  const [sortOrder, setSortOrder] = useState("desc") // asc, desc
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchAllBusinesses()
  }, [])

  const fetchAllBusinesses = async () => {
    setLoading(true)
    try {
      const data = await fetchBusinesses()
      console.log("Entreprises récupérées:", data)
      setBusinesses(data || [])
      setError(null)
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error)
      setError("Impossible de charger les entreprises. Veuillez réessayer.")
      setBusinesses([])
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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
      try {
        await deleteBusiness(id)
        setBusinesses(businesses.filter((business) => business._id !== id))
      } catch (error) {
        console.error("Erreur lors de la suppression de l'entreprise:", error)
        alert("Erreur lors de la suppression de l'entreprise")
      }
    }
  }

  const handleView = (business) => {
    setSelectedBusiness(business)
    setShowModal(true)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Filtrer et trier les entreprises
  const filteredAndSortedBusinesses = [...businesses]
    .filter(
      (business) =>
        (business.name && business.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (business.email && business.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (business.phone && business.phone.includes(searchTerm)),
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          : new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      } else if (sortBy === "name") {
        const nameA = a.name || ""
        const nameB = b.name || ""
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (sortBy === "email") {
        const emailA = a.email || ""
        const emailB = b.email || ""
        return sortOrder === "asc" ? emailA.localeCompare(emailB) : emailB.localeCompare(emailA)
      }
      return 0
    })

  return (
    <div className="business-manager">
      <div className="manager-header">
        <h2>Gestion des Entreprises</h2>
        
      </div>

      <div className="manager-toolbar">
        <div className="search-bar">
          <Search size={20} />
          <input type="text" placeholder="Rechercher une entreprise..." value={searchTerm} onChange={handleSearch} />
        </div>

        <div className="sort-options">
          <span>Trier par:</span>
          <button className={sortBy === "date" ? "active" : ""} onClick={() => handleSort("date")}>
            Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button className={sortBy === "name" ? "active" : ""} onClick={() => handleSort("name")}>
            Nom {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button className={sortBy === "email" ? "active" : ""} onClick={() => handleSort("email")}>
            Email {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Chargement des entreprises...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : filteredAndSortedBusinesses.length === 0 ? (
        <div className="empty-state">
          <p>Aucune entreprise trouvée.</p>
        </div>
      ) : (
        <div className="businesses-list">
          <table className="businesses-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Date d'inscription</th>
                <th>Formations</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedBusinesses.map((business) => (
                <tr key={business._id}>
                  <td>{business.name || "N/A"}</td>
                  <td>{business.email || "N/A"}</td>
                  <td>{business.phone || "N/A"}</td>
                  <td>{business.createdAt ? formatDate(business.createdAt) : "N/A"}</td>
                  <td>{business.formationsCount || business.formations?.length || 0}</td>
                  <td>{business.documentsCount || business.documents?.length || 0}</td>
                  <td className="actions-cell">
                    <button className="action-btn view-btn0" onClick={() => handleView(business)}>
                      <Eye size={18} />
                    </button>
                    <button className="action-btn delete-btn3" onClick={() => handleDelete(business._id)}>
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedBusiness && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedBusiness.name || "Entreprise sans nom"}</h3>
            <div className="business-details">
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedBusiness.email || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Téléphone:</span>
                <span className="detail-value">{selectedBusiness.phone || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Adresse:</span>
                <span className="detail-value">{selectedBusiness.address || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date d'inscription:</span>
                <span className="detail-value">
                  {selectedBusiness.createdAt ? formatDate(selectedBusiness.createdAt) : "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <p className="detail-value">{selectedBusiness.description || "Aucune description"}</p>
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
    </div>
  )
}

export default BusinessManager

