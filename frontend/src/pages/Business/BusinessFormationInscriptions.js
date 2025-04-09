"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Download, Filter, ArrowUp, ArrowDown } from "lucide-react"
import {
  fetchBusinessInscriptions,
  fetchBusinessFormations,
  updateInscriptionStatus,
  updateInscriptionPaymentMethod,
} from "../../services/api"
import "./BusinessInscriptions.css"

const BusinessInscriptionsFormation = () => {
  const navigate = useNavigate() // Add navigate for the back button
  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFormation, setFilterFormation] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" })
  const [formations, setFormations] = useState([])
  const [selectedInscription, setSelectedInscription] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Récupérer les formations de l'entreprise
        const formationsResponse = await fetchBusinessFormations()
        const formationsData = formationsResponse.data || formationsResponse
        setFormations(Array.isArray(formationsData) ? formationsData : [])

        // Récupérer les inscriptions de l'entreprise
        const inscriptionsResponse = await fetchBusinessInscriptions()
        const inscriptionsData = inscriptionsResponse.data || inscriptionsResponse

        // Log pour déboguer les données d'inscription
        console.log("Inscriptions reçues:", inscriptionsData)

        // Vérifier si les inscriptions ont des montants
        const inscriptionsWithPrices = Array.isArray(inscriptionsData)
          ? inscriptionsData.map((inscription) => {
              // Si l'inscription n'a pas de montant mais a une formation avec un prix
              if (
                (!inscription.amount || inscription.amount === 0) &&
                inscription.formation &&
                inscription.formation.price
              ) {
                return {
                  ...inscription,
                  amount: inscription.formation.price,
                }
              }
              return inscription
            })
          : []

        setInscriptions(inscriptionsWithPrices)
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError("Impossible de charger les données. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (e) => {
    setFilterFormation(e.target.value)
  }

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Date non spécifiée"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const exportToCSV = () => {
    // Fonction pour exporter les inscriptions au format CSV
    const headers = [
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Formation",
      "Date d'inscription",
      "Statut",
      "Paiement",
      "Montant",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredInscriptions.map((insc) =>
        [
          insc.user?.lastName || insc.lastName || insc.nom || "",
          insc.user?.firstName || insc.firstName || insc.prenom || "",
          insc.user?.email || insc.email || "",
          insc.user?.phone || insc.phone || insc.telephone || "",
          insc.formation?.title || "",
          formatDate(insc.createdAt || insc.dateInscription),
          insc.status || insc.statut || "",
          insc.paymentStatus || insc.payment || insc.paiement || "",
          `${insc.amount || 0} FCFA`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "inscriptions.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtrer les inscriptions en fonction du terme de recherche et du filtre de formation
  const filteredInscriptions = inscriptions.filter((insc) => {
    const firstName = insc.user?.firstName || insc.firstName || insc.nom || ""
    const lastName = insc.user?.lastName || insc.lastName || insc.prenom || ""
    const email = insc.user?.email || insc.email || ""
    const phone = insc.user?.phone || insc.phone || insc.telephone || ""
    const formationId = insc.formation?._id || insc.formation?.id || ""

    const matchesSearch =
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm)

    const matchesFormation = filterFormation === "all" || formationId === filterFormation

    return matchesSearch && matchesFormation
  })

  // Trier les inscriptions
  const sortedInscriptions = [...filteredInscriptions].sort((a, b) => {
    if (sortConfig.key === "date") {
      const dateA = new Date(a.createdAt || a.dateInscription || 0)
      const dateB = new Date(b.createdAt || b.dateInscription || 0)
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA
    }

    if (sortConfig.key === "nom") {
      const nameA = (a.user?.lastName || a.lastName || a.nom || "").toLowerCase()
      const nameB = (b.user?.lastName || b.lastName || b.nom || "").toLowerCase()
      return sortConfig.direction === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    }

    if (sortConfig.key === "formation") {
      const formationA = (a.formation?.title || "").toLowerCase()
      const formationB = (b.formation?.title || "").toLowerCase()
      return sortConfig.direction === "asc"
        ? formationA.localeCompare(formationB)
        : formationB.localeCompare(formationA)
    }

    if (sortConfig.key === "statut") {
      const statusA = (a.status || a.statut || "").toLowerCase()
      const statusB = (b.status || b.statut || "").toLowerCase()
      return sortConfig.direction === "asc" ? statusA.localeCompare(statusB) : statusB.localeCompare(statusA)
    }

    return 0
  })

  // Calculer les statistiques
  const stats = {
    total: inscriptions.length,
    confirmes: inscriptions.filter(
      (i) =>
        (i.status || i.statut) === "confirmed" ||
        (i.status || i.statut) === "confirmé" ||
        (i.statut|| i.statut) === "completed" ||
        (i.status || i.statut) === "approved",
    ).length,
    enAttente: inscriptions.filter(
      (i) => (i.status || i.statut) === "pending" || (i.status || i.statut) === "en attente",
    ).length,
    paiementComplet: inscriptions.filter(
      (i) =>
        (i.paymentStatus || i.payment || i.paiement) === "completed" ||
        (i.paymentStatus || i.payment || i.paiement) === "paid" ||
        (i.paymentStatus || i.payment || i.paiement) === "complet" ||
        (i.paymentStatus || i.payment || i.paiement) === "complete",
    ).length,
  }

  // Fonction pour obtenir le statut en français
  const getStatusLabel = (status) => {
    if (!status) return "Non défini"

    switch (status.toLowerCase()) {
      case "pending":
      case "en attente":
        return "En attente"
      case "confirmed":
      case "approved":
      case "confirmé":
        return "Confirmé"
      case "completed":
      case "terminé":
        return "terminé"
      case "cancelled":
      case "annulé":
        return "Annulé"
      default:
        return status
    }
  }

  // Fonction pour obtenir la classe CSS du statut
  const getStatusClass = (status) => {
    if (!status) return ""

    switch (status.toLowerCase()) {
      case "pending":
      case "en attente":
        return "status-pending"
      case "confirmed":
      case "approved":
      case "confirmé":
        return "status-confirmed"
      case "completed":
      case "terminé":
        return "status-completed"
      case "cancelled":
      case "annulé":
        return "status-cancelled"
      default:
        return ""
    }
  }

  // Fonction pour afficher les détails d'une inscription
  const showDetails = (inscription) => {
    console.log("Détails de l'inscription:", inscription)
    setSelectedInscription(inscription)
    setShowDetailsModal(true)
  }

  // Fonction pour fermer la modale de détails
  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedInscription(null)
  }

  // Fonction pour obtenir le montant de l'inscription
  const getInscriptionAmount = (inscription) => {
    // Si l'inscription a un montant défini
    if (inscription.amount && inscription.amount > 0) {
      return `${inscription.amount} FCFA`
    }

    // Si l'inscription a une formation avec un prix
    if (inscription.formation && inscription.formation.price) {
      return `${inscription.formation.price} FCFA`
    }

    // Sinon, retourner 0 FCFA
    return "0 FCFA"
  }

  // Fonction pour mettre à jour le statut d'une inscription
  const handleStatusChange = async (id, status) => {
    try {
      await updateInscriptionStatus(id, { status })

      // Mettre à jour l'état local
      setInscriptions(
        inscriptions.map((inscription) => (inscription._id === id ? { ...inscription, status } : inscription)),
      )

      // Mettre à jour l'inscription sélectionnée si elle est affichée
      if (selectedInscription && selectedInscription._id === id) {
        setSelectedInscription({ ...selectedInscription, status })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
      alert("Une erreur est survenue lors de la mise à jour du statut")
    }
  }

  // Fonction pour mettre à jour le statut de paiement d'une inscription
  const handlePaymentStatusChange = async (id, paymentStatus) => {
    try {
      await updateInscriptionStatus(id, { paymentStatus })

      // Mettre à jour l'état local
      setInscriptions(
        inscriptions.map((inscription) => (inscription._id === id ? { ...inscription, paymentStatus } : inscription)),
      )

      // Mettre à jour l'inscription sélectionnée si elle est affichée
      if (selectedInscription && selectedInscription._id === id) {
        setSelectedInscription({ ...selectedInscription, paymentStatus })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de paiement:", error)
      alert("Une erreur est survenue lors de la mise à jour du statut de paiement")
    }
  }

  // Fonction pour mettre à jour la méthode de paiement d'une inscription
  const handlePaymentMethodChange = async (id, paymentMethod) => {
    try {
      await updateInscriptionPaymentMethod(id, { paymentMethod })

      // Mettre à jour l'état local
      setInscriptions(
        inscriptions.map((inscription) => (inscription._id === id ? { ...inscription, paymentMethod } : inscription)),
      )

      // Mettre à jour l'inscription sélectionnée si elle est affichée
      if (selectedInscription && selectedInscription._id === id) {
        setSelectedInscription({ ...selectedInscription, paymentMethod })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la méthode de paiement:", error)
      alert("Une erreur est survenue lors de la mise à jour de la méthode de paiement")
    }
  }

  // Fonction pour retourner à la page précédente
  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="inscriptions-container">
      <div className="inscriptions-header">
        <div className="header-left">
          {/* Bouton de retour */}
          <button onClick={handleGoBack} className="back-btn">
            ← Retour
          </button>
          <h2>Gestion des inscriptions</h2>
        </div>
        <button className="export-btn" onClick={exportToCSV}>
          <Download size={18} />
          <span>Exporter</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Chargement des inscriptions...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <>
          <div className="inscriptions-stats3">
            <div className="stat-card0">
              <h4>Total</h4>
              <p>{stats.total}</p>
            </div>
            <div className="stat-card0">
              <h4>Confirmés</h4>
              <p>{stats.confirmes}</p>
            </div>
            <div className="stat-card0">
              <h4>En attente</h4>
              <p>{stats.enAttente}</p>
            </div>
            <div className="stat-card0">
              <h4>Paiement complet</h4>
              <p>{stats.paiementComplet}</p>
            </div>
          </div>

          <div className="inscriptions-filters">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Rechercher un inscrit..." value={searchTerm} onChange={handleSearch} />
            </div>

            <div className="filter-box">
              <Filter size={18} />
              <select value={filterFormation} onChange={handleFilterChange}>
                <option value="all">Toutes les formations</option>
                {formations.map((formation) => (
                  <option key={formation._id || formation.id} value={formation._id || formation.id}>
                    {formation.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {sortedInscriptions.length === 0 ? (
            <div className="no-results">Aucun résultat ne correspond à votre recherche</div>
          ) : (
            <div className="inscriptions-table-container13">
              <table className="inscriptions-table12">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("nom")}
                      className={sortConfig.key === "nom" ? `sorted-${sortConfig.direction}` : ""}
                    >
                      Nom & Prénom
                      {sortConfig.key === "nom" && (
                        <span className="sort-icon">
                          {sortConfig.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </th>
                    <th>Contact</th>
                    <th
                      onClick={() => handleSort("formation")}
                      className={sortConfig.key === "formation" ? `sorted-${sortConfig.direction}` : ""}
                    >
                      Formation
                      {sortConfig.key === "formation" && (
                        <span className="sort-icon">
                          {sortConfig.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </th>
                    <th
                      onClick={() => handleSort("date")}
                      className={sortConfig.key === "date" ? `sorted-${sortConfig.direction}` : ""}
                    >
                      Date d'inscription
                      {sortConfig.key === "date" && (
                        <span className="sort-icon">
                          {sortConfig.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </th>
                    <th
                      onClick={() => handleSort("statut")}
                      className={sortConfig.key === "statut" ? `sorted-${sortConfig.direction}` : ""}
                    >
                      Statut
                      {sortConfig.key === "statut" && (
                        <span className="sort-icon">
                          {sortConfig.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </th>
                    <th>Paiement</th>
                    <th>Montant</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInscriptions.map((inscription) => (
                    <tr key={inscription._id || inscription.id}>
                      <td>
                        <div className="inscrit-name">
                          <span className="nom">
                            {inscription.user?.lastName || inscription.lastName || inscription.nom || ""}
                          </span>
                          <span className="prenom">
                            {inscription.user?.firstName || inscription.firstName || inscription.prenom || ""}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="inscrit-contact">
                          <div className="email">{inscription.user?.email || inscription.email || ""}</div>
                          <div className="phone">
                            {inscription.user?.phone || inscription.phone || inscription.telephone || ""}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Link
                          to={`/business/dashboard/formations/${inscription.formation?._id || inscription.formation?.id || ""}`}
                          className="formation-link"
                        >
                          {inscription.formation?.title || "Formation non spécifiée"}
                        </Link>
                      </td>
                      <td>{formatDate(inscription.createdAt || inscription.dateInscription)}</td>
                      <td>
                        <select
                          value={inscription.status || inscription.statut || "pending"}
                          onChange={(e) => handleStatusChange(inscription._id || inscription.id, e.target.value)}
                          className={`status-select ${getStatusClass(inscription.status || inscription.statut)}`}
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="completed">terminé</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={inscription.paymentStatus || inscription.payment || inscription.paiement || "pending"}
                          onChange={(e) => handlePaymentStatusChange(inscription._id || inscription.id, e.target.value)}
                          className={`payment-status-select payment-status-${inscription.paymentStatus || inscription.payment || inscription.paiement || "pending"}`}
                        >
                          <option value="pending">En attente</option>
                          <option value="paid">Payé</option>
                          <option value="failed">Échoué</option>
                          <option value="refunded">Remboursé</option>
                        </select>
                      </td>
                      <td>{getInscriptionAmount(inscription)}</td>
                      <td>
                        <div className="action-buttons">
                          <button type="button" className="view-btn" onClick={() => showDetails(inscription)}>
                            Détails
                          </button>
                          <button
                            type="button"
                            className="contact-btn"
                            onClick={() => {
                              const email = inscription.user?.email || inscription.email
                              if (email) {
                                window.location.href = `mailto:${email}`
                              }
                            }}
                          >
                            Contacter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedInscription && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails de l'inscription</h3>
              <button type="button" className="close-btn" onClick={closeDetailsModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Informations personnelles</h4>
                <p>
                  <strong>Nom:</strong>{" "}
                  {selectedInscription.user?.lastName ||
                    selectedInscription.lastName ||
                    selectedInscription.nom ||
                    "Non spécifié"}
                </p>
                <p>
                  <strong>Prénom:</strong>{" "}
                  {selectedInscription.user?.firstName ||
                    selectedInscription.firstName ||
                    selectedInscription.prenom ||
                    "Non spécifié"}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {selectedInscription.user?.email || selectedInscription.email || "Non spécifié"}
                </p>
                <p>
                  <strong>Téléphone:</strong>{" "}
                  {selectedInscription.user?.phone ||
                    selectedInscription.phone ||
                    selectedInscription.telephone ||
                    "Non spécifié"}
                </p>
              </div>

              <div className="detail-section">
                <h4>Informations sur la formation</h4>
                <p>
                  <strong>Formation:</strong> {selectedInscription.formation?.title || "Non spécifiée"}
                </p>
                <p>
                  <strong>Date d'inscription:</strong>{" "}
                  {formatDate(selectedInscription.createdAt || selectedInscription.dateInscription)}
                </p>
                <p>
                  <strong>Statut:</strong>
                  <select
                    value={selectedInscription.status || selectedInscription.statut || "pending"}
                    onChange={(e) =>
                      handleStatusChange(selectedInscription._id || selectedInscription.id, e.target.value)
                    }
                    className={`status-select ${getStatusClass(selectedInscription.status || selectedInscription.statut)}`}
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="rejected">Refusé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </p>
                <p>
                  <strong>Paiement:</strong>
                  <select
                    value={
                      selectedInscription.paymentStatus ||
                      selectedInscription.payment ||
                      selectedInscription.paiement ||
                      "pending"
                    }
                    onChange={(e) =>
                      handlePaymentStatusChange(selectedInscription._id || selectedInscription.id, e.target.value)
                    }
                    className={`payment-status-select payment-status-${selectedInscription.paymentStatus || selectedInscription.payment || selectedInscription.paiement || "pending"}`}
                  >
                    <option value="pending">En attente</option>
                    <option value="paid">Payé</option>
                    <option value="failed">Échoué</option>
                    <option value="refunded">Remboursé</option>
                  </select>
                </p>
                <p>
                  <strong>Méthode de paiement:</strong>
                  <select
                    value={selectedInscription.paymentMethod || "mobile_money"}
                    onChange={(e) =>
                      handlePaymentMethodChange(selectedInscription._id || selectedInscription.id, e.target.value)
                    }
                    className="payment-method-select"
                  >
                    <option value="mobile_money">Mobile Money</option>
                    <option value="card">Carte bancaire</option>
                    <option value="bank_transfer">Virement bancaire</option>
                    <option value="cash">Espèces</option>
                  </select>
                </p>
                <p>
                  <strong>Montant:</strong> {getInscriptionAmount(selectedInscription)}
                </p>
              </div>

              {selectedInscription.notes && (
                <div className="detail-section">
                  <h4>Notes</h4>
                  <p>{selectedInscription.notes}</p>
                </div>
              )}

              {selectedInscription.motivation && (
                <div className="detail-section">
                  <h4>Motivation</h4>
                  <p>{selectedInscription.motivation}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-primary" onClick={closeDetailsModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessInscriptionsFormation

