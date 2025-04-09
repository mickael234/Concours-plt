"use client"

import { useState, useEffect } from "react"
import {
  getAdminInscriptions,
  updateInscriptionStatus,
  updateInscriptionPaymentMethod,
  deleteInscription,
} from "../../services/api"
import { Trash, Eye, Search, Download, Mail, Phone } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { ROLES } from "../../utils/roles"
import "./InscriptionManager.css"

const InscriptionManager = () => {
  const { user } = useAuth()
  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date") // date, name, formation
  const [sortOrder, setSortOrder] = useState("desc") // asc, desc
  const [selectedInscription, setSelectedInscription] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all") // all, pending, confirmed, cancelled, completed
  const [filterPayment, setFilterPayment] = useState("all") // all, pending, paid, failed, refunded
  const [filterFormation, setFilterFormation] = useState("all")
  const [formations, setFormations] = useState([])
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    pendingPayment: 0,
    paid: 0,
    totalAmount: 0,
    paidAmount: 0,
  })

  // Vérifier si l'utilisateur est super admin
  // eslint-disable-next-line no-unused-vars
  const isSuperAdmin = user && user.role === ROLES.SUPERADMIN

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "superadmin")) {
      fetchInscriptions()
    }
  }, [user])

  // Calculer les statistiques à partir des inscriptions
  useEffect(() => {
    if (inscriptions.length > 0) {
      const stats = {
        total: inscriptions.length,
        pending: inscriptions.filter((i) => i.status === "pending").length,
        confirmed: inscriptions.filter((i) => i.status === "confirmed").length,
        cancelled: inscriptions.filter((i) => i.status === "cancelled").length,
        completed: inscriptions.filter((i) => i.status === "completed").length,
        pendingPayment: inscriptions.filter((i) => i.paymentStatus === "pending").length,
        paid: inscriptions.filter((i) => i.paymentStatus === "paid").length,
        totalAmount: inscriptions.reduce((sum, i) => sum + (i.amount || 0), 0),
        paidAmount: inscriptions.filter((i) => i.paymentStatus === "paid").reduce((sum, i) => sum + (i.amount || 0), 0),
      }
      setStatistics(stats)

      // Extraire les formations uniques
      const uniqueFormations = [
        ...new Set(
          inscriptions
            .filter((i) => i.formation && i.formation._id)
            .map((i) => JSON.stringify({ id: i.formation._id, title: i.formation.title })),
        ),
      ].map((f) => JSON.parse(f))

      setFormations([{ id: "all", title: "Toutes les formations" }, ...uniqueFormations])
    }
  }, [inscriptions])

  const fetchInscriptions = async () => {
    setLoading(true)
    try {
      console.log("Récupération des inscriptions...")
      const data = await getAdminInscriptions()
      console.log("Inscriptions récupérées:", data)
      setInscriptions(data || [])
      setError(null)
    } catch (error) {
      console.error("Erreur lors du chargement des inscriptions:", error)
      setError("Impossible de charger les inscriptions. Veuillez réessayer.")
      setInscriptions([])
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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette inscription ?")) {
      try {
        await deleteInscription(id)
        setInscriptions(inscriptions.filter((inscription) => inscription._id !== id))
      } catch (error) {
        console.error("Erreur lors de la suppression de l'inscription:", error)
        alert("Erreur lors de la suppression de l'inscription")
      }
    }
  }

  const handleView = (inscription) => {
    setSelectedInscription(inscription)
    setShowModal(true)
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateInscriptionStatus(id, { status })
      setInscriptions(
        inscriptions.map((inscription) => (inscription._id === id ? { ...inscription, status } : inscription)),
      )
      if (selectedInscription && selectedInscription._id === id) {
        setSelectedInscription({ ...selectedInscription, status })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
      alert("Erreur lors de la mise à jour du statut")
    }
  }

  const handlePaymentStatusChange = async (id, paymentStatus) => {
    try {
      await updateInscriptionStatus(id, { paymentStatus })
      setInscriptions(
        inscriptions.map((inscription) => (inscription._id === id ? { ...inscription, paymentStatus } : inscription)),
      )
      if (selectedInscription && selectedInscription._id === id) {
        setSelectedInscription({ ...selectedInscription, paymentStatus })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de paiement:", error)
      alert("Erreur lors de la mise à jour du statut de paiement")
    }
  }

  const handlePaymentMethodChange = async (id, paymentMethod) => {
    try {
      await updateInscriptionPaymentMethod(id, { paymentMethod })
      setInscriptions(
        inscriptions.map((inscription) => (inscription._id === id ? { ...inscription, paymentMethod } : inscription)),
      )
      if (selectedInscription && selectedInscription._id === id) {
        setSelectedInscription({ ...selectedInscription, paymentMethod })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la méthode de paiement:", error)
      alert("Erreur lors de la mise à jour de la méthode de paiement")
    }
  }

  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value)
  }

  const handleFilterPayment = (e) => {
    setFilterPayment(e.target.value)
  }

  const handleFilterFormation = (e) => {
    setFilterFormation(e.target.value)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Fonction pour obtenir le nom de l'entreprise à partir de différentes sources possibles
  const getBusinessName = (inscription) => {
    // Essayer d'abord l'entreprise directement liée à l'inscription
    if (inscription.business && (inscription.business.structureName || inscription.business.name)) {
      return inscription.business.structureName || inscription.business.name
    }

    // Essayer ensuite l'entreprise liée à la formation
    if (inscription.formation && inscription.formation.business) {
      return inscription.formation.business.structureName || inscription.formation.business.name
    }

    return "N/A"
  }

  // Filtrer et trier les inscriptions
  const filteredAndSortedInscriptions = [...inscriptions]
    .filter(
      (inscription) =>
        // Filtre de recherche
        (inscription.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inscription.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inscription.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inscription.formation && inscription.formation.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (inscription.business && inscription.business.name?.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        // Filtre de statut
        (filterStatus === "all" || inscription.status === filterStatus) &&
        // Filtre de paiement
        (filterPayment === "all" || inscription.paymentStatus === filterPayment) &&
        // Filtre de formation
        (filterFormation === "all" || (inscription.formation && inscription.formation._id === filterFormation)),
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === "name") {
        const nameA = `${a.firstName || ""} ${a.lastName || ""}`
        const nameB = `${b.firstName || ""} ${b.lastName || ""}`
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (sortBy === "formation") {
        const formationA = a.formation?.title || ""
        const formationB = b.formation?.title || ""
        return sortOrder === "asc" ? formationA.localeCompare(formationB) : formationB.localeCompare(formationA)
      }
      return 0
    })

  // Générer un rapport CSV des inscriptions
  const generateCSV = () => {
    const headers = [
      "ID",
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Formation",
      "Entreprise",
      "Date d'inscription",
      "Montant",
      "Statut",
      "Statut de paiement",
      "Méthode de paiement",
      "Date de paiement",
    ]

    const rows = filteredAndSortedInscriptions.map((i) => [
      i._id,
      i.firstName || "",
      i.lastName || "",
      i.email || "",
      i.phone || "",
      i.formation?.title || "N/A",
      getBusinessName(i),
      new Date(i.createdAt).toLocaleDateString(),
      i.amount || 0,
      i.status || "",
      i.paymentStatus || "",
      i.paymentMethod || "mobile_money",
      i.paymentDate ? new Date(i.paymentDate).toLocaleDateString() : "N/A",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `inscriptions_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Contacter un inscrit par email
  const contactByEmail = (email) => {
    window.location.href = `mailto:${email}`
  }

  // Contacter un inscrit par téléphone
  const contactByPhone = (phone) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="inscription-manager">
      <div className="manager-header">
        <h2>Gestion des Inscriptions</h2>
        <button className="export-button" onClick={generateCSV}>
          <Download size={20} />
          <span>Exporter CSV</span>
        </button>
      </div>

      <div className="statistics-panel3">
        <div className="stat-card5">
          <h3>Total</h3>
          <p>{statistics.total}</p>
        </div>
        <div className="stat-card5">
          <h3>En attente</h3>
          <p>{statistics.pending}</p>
        </div>
        <div className="stat-card5">
          <h3>Confirmées</h3>
          <p>{statistics.confirmed}</p>
        </div>
        <div className="stat-card5">
          <h3>Annulées</h3>
          <p>{statistics.cancelled}</p>
        </div>
        <div className="stat-card5">
          <h3>Terminées</h3>
          <p>{statistics.completed}</p>
        </div>
        <div className="stat-card5">
          <h3>Montant total</h3>
          <p>{statistics.totalAmount.toLocaleString()} FCFA</p>
        </div>
        <div className="stat-card5">
          <h3>Montant payé</h3>
          <p>{statistics.paidAmount.toLocaleString()} FCFA</p>
        </div>
      </div>

      <div className="manager-toolbar">
        <div className="search-bar">
          <Search size={20} />
          <input type="text" placeholder="Rechercher une inscription..." value={searchTerm} onChange={handleSearch} />
        </div>

        <div className="filter-options">
          <select value={filterStatus} onChange={handleFilterStatus}>
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="cancelled">Annulée</option>
            <option value="completed">Terminée</option>
          </select>

          <select value={filterPayment} onChange={handleFilterPayment}>
            <option value="all">Tous les paiements</option>
            <option value="pending">En attente</option>
            <option value="paid">Payé</option>
            <option value="failed">Échoué</option>
            <option value="refunded">Remboursé</option>
          </select>

          <select value={filterFormation} onChange={handleFilterFormation}>
            {formations.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </div>

        <div className="sort-options">
          <span>Trier par:</span>
          <button className={sortBy === "date" ? "active" : ""} onClick={() => handleSort("date")}>
            Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button className={sortBy === "name" ? "active" : ""} onClick={() => handleSort("name")}>
            Nom {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button className={sortBy === "formation" ? "active" : ""} onClick={() => handleSort("formation")}>
            Formation {sortBy === "formation" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Chargement des inscriptions...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : filteredAndSortedInscriptions.length === 0 ? (
        <div className="empty-state">
          <p>Aucune inscription trouvée.</p>
        </div>
      ) : (
        <div className="inscriptions-list">
          <table className="inscriptions-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Formation</th>
                <th>Entreprise</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th>Méthode</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedInscriptions.map((inscription) => (
                <tr key={inscription._id}>
                  <td>{`${inscription.firstName || ""} ${inscription.lastName || ""}`}</td>
                  <td>{inscription.formation?.title || "N/A"}</td>
                  <td>{getBusinessName(inscription)}</td>
                  <td>{formatDate(inscription.createdAt)}</td>
                  <td>{inscription.amount ? inscription.amount.toLocaleString() : "0"} FCFA</td>
                  <td>
                    <select
                      value={inscription.status}
                      onChange={(e) => handleStatusChange(inscription._id, e.target.value)}
                      className={`status-select status-${inscription.status}`}
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="cancelled">Annulée</option>
                      <option value="completed">Terminée</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={inscription.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(inscription._id, e.target.value)}
                      className={`payment-status-select payment-status-${inscription.paymentStatus}`}
                    >
                      <option value="pending">En attente</option>
                      <option value="paid">Payé</option>
                      <option value="failed">Échoué</option>
                      <option value="refunded">Remboursé</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={inscription.paymentMethod || "mobile_money"}
                      onChange={(e) => handlePaymentMethodChange(inscription._id, e.target.value)}
                      className={`payment-method-select`}
                    >
                      <option value="mobile_money">Mobile Money</option>
                      <option value="card">Carte bancaire</option>
                      <option value="bank_transfer">Virement</option>
                      <option value="cash">Espèces</option>
                    </select>
                  </td>
                  <td className="contact-cell4">
                    <button className="action-btn contact-email-btn1" onClick={() => contactByEmail(inscription.email)}>
                      <Mail size={18} />
                    </button>
                    <button className="action-btn contact-phone-btn2" onClick={() => contactByPhone(inscription.phone)}>
                      <Phone size={18} />
                    </button>
                  </td>
                  <td className="actions-cell8">
                    <button className="action-btn view-btn9" onClick={() => handleView(inscription)}>
                      <Eye size={18} />
                    </button>
                    <button className="action-btn delete-btn2" onClick={() => handleDelete(inscription._id)}>
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedInscription && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Détails de l'inscription</h3>
            <div className="inscription-details">
              <div className="detail-section">
                <h4>Informations personnelles</h4>
                <div className="detail-row">
                  <span className="detail-label">Nom:</span>
                  <span className="detail-value">{`${selectedInscription.firstName || ""} ${selectedInscription.lastName || ""}`}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">
                    {selectedInscription.email || ""}
                    <button
                      className="action-btn contact-email-btn"
                      onClick={() => contactByEmail(selectedInscription.email)}
                    >
                      <Mail size={16} />
                    </button>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Téléphone:</span>
                  <span className="detail-value">
                    {selectedInscription.phone || ""}
                    <button
                      className="action-btn contact-phone-btn"
                      onClick={() => contactByPhone(selectedInscription.phone)}
                    >
                      <Phone size={16} />
                    </button>
                  </span>
                </div>
                {selectedInscription.birthDate && (
                  <div className="detail-row">
                    <span className="detail-label">Date de naissance:</span>
                    <span className="detail-value">{formatDate(selectedInscription.birthDate)}</span>
                  </div>
                )}
                {selectedInscription.address && (
                  <div className="detail-row">
                    <span className="detail-label">Adresse:</span>
                    <span className="detail-value">{selectedInscription.address}</span>
                  </div>
                )}
                {selectedInscription.city && (
                  <div className="detail-row">
                    <span className="detail-label">Ville:</span>
                    <span className="detail-value">{selectedInscription.city}</span>
                  </div>
                )}
                {selectedInscription.country && (
                  <div className="detail-row">
                    <span className="detail-label">Pays:</span>
                    <span className="detail-value">{selectedInscription.country}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Informations de formation</h4>
                <div className="detail-row">
                  <span className="detail-label">Formation:</span>
                  <span className="detail-value">{selectedInscription.formation?.title || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Entreprise:</span>
                  <span className="detail-value">{getBusinessName(selectedInscription)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date d'inscription:</span>
                  <span className="detail-value">{formatDate(selectedInscription.createdAt)}</span>
                </div>
                {selectedInscription.selectedMonths && selectedInscription.selectedMonths.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Mois sélectionnés:</span>
                    <span className="detail-value">{selectedInscription.selectedMonths.join(", ")}</span>
                  </div>
                )}
              </div>

              <div className="detail-section1">
                <h4>Informations de paiement</h4>
                <div className="detail-row1">
                  <span className="detail-label">Montant:</span>
                  <span className="detail-value">
                    {selectedInscription.amount ? selectedInscription.amount.toLocaleString() : "0"} FCFA
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Méthode de paiement:</span>
                  <select
                    value={selectedInscription.paymentMethod || "mobile_money"}
                    onChange={(e) => handlePaymentMethodChange(selectedInscription._id, e.target.value)}
                    className="payment-method-select"
                  >
                    <option value="mobile_money">Mobile Money</option>
                    <option value="card">Carte bancaire</option>
                    <option value="bank_transfer">Virement bancaire</option>
                    <option value="cash">Espèces</option>
                  </select>
                </div>
                <div className="detail-row1">
                  <span className="detail-label">Statut de paiement:</span>
                  <select
                    value={selectedInscription.paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(selectedInscription._id, e.target.value)}
                    className={`payment-status-select payment-status-${selectedInscription.paymentStatus}`}
                  >
                    <option value="pending">En attente</option>
                    <option value="paid">Payé</option>
                    <option value="failed">Échoué</option>
                    <option value="refunded">Remboursé</option>
                  </select>
                </div>
                {selectedInscription.paymentReference && (
                  <div className="detail-row1">
                    <span className="detail-label">Référence de paiement:</span>
                    <span className="detail-value">{selectedInscription.paymentReference}</span>
                  </div>
                )}
                {selectedInscription.paymentDate && (
                  <div className="detail-row1">
                    <span className="detail-label">Date de paiement:</span>
                    <span className="detail-value">{formatDate(selectedInscription.paymentDate)}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Statut</h4>
                <div className="detail-row">
                  <span className="detail-label">Statut de l'inscription:</span>
                  <select
                    value={selectedInscription.status}
                    onChange={(e) => handleStatusChange(selectedInscription._id, e.target.value)}
                    className={`status-select status-${selectedInscription.status}`}
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="cancelled">Annulée</option>
                    <option value="completed">Terminée</option>
                  </select>
                </div>
                {selectedInscription.notes && (
                  <div className="detail-row">
                    <span className="detail-label">Notes:</span>
                    <p className="detail-value">{selectedInscription.notes}</p>
                  </div>
                )}
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

export default InscriptionManager

