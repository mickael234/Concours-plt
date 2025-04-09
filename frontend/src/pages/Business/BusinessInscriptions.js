"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Download, Filter, ArrowUp, ArrowDown, Eye, Mail, Phone } from "lucide-react"
import "./BusinessInscriptions.css"

const BusinessInscriptions = () => {
  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFormation, setFilterFormation] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" })
  const [formations, setFormations] = useState([])
  const [selectedInscription, setSelectedInscription] = useState(null)
  const [showModal, setShowModal] = useState(false)
  // Ajouter un état pour les statistiques
  const [stats, setStats] = useState({
    total: 0,
    confirmes: 0,
    enAttente: 0,
    paiementComplet: 0,
  })

  // Modifier useEffect pour initialiser les statistiques correctement
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Simuler un appel API pour récupérer les données
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Données de test pour les formations
        const mockFormations = [
          { id: "form1", title: "Préparation au concours CAFOP 2024" },
          { id: "form2", title: "Préparation au concours de la Fonction Publique" },
          { id: "form3", title: "Préparation au concours d'entrée à l'INFS" },
        ]

        // Données de test pour les inscriptions
        const mockInscriptions = [
          {
            id: "insc1",
            nom: "Koné",
            prenom: "Amadou",
            email: "amadou.kone@example.com",
            telephone: "0708123456",
            formation: { id: "form1", title: "Préparation au concours CAFOP 2024" },
            dateInscription: "2024-03-15T10:30:00Z",
            statut: "confirmé",
            paiement: "complet",
          },
          {
            id: "insc2",
            nom: "Bamba",
            prenom: "Fatou",
            email: "fatou.bamba@example.com",
            telephone: "0709876543",
            formation: { id: "form1", title: "Préparation au concours CAFOP 2024" },
            dateInscription: "2024-03-16T14:45:00Z",
            statut: "en attente",
            paiement: "partiel",
          },
          {
            id: "insc3",
            nom: "Touré",
            prenom: "Ibrahim",
            email: "ibrahim.toure@example.com",
            telephone: "0705432198",
            formation: { id: "form2", title: "Préparation au concours de la Fonction Publique" },
            dateInscription: "2024-03-17T09:15:00Z",
            statut: "confirmé",
            paiement: "complet",
          },
          {
            id: "insc4",
            nom: "Diallo",
            prenom: "Mariam",
            email: "mariam.diallo@example.com",
            telephone: "0701234567",
            formation: { id: "form3", title: "Préparation au concours d'entrée à l'INFS" },
            dateInscription: "2024-03-18T11:20:00Z",
            statut: "en attente",
            paiement: "non payé",
          },
          {
            id: "insc5",
            nom: "Coulibaly",
            prenom: "Seydou",
            email: "seydou.coulibaly@example.com",
            telephone: "0707654321",
            formation: { id: "form2", title: "Préparation au concours de la Fonction Publique" },
            dateInscription: "2024-03-19T16:10:00Z",
            statut: "confirmé",
            paiement: "complet",
          },
          {
            id: "insc6",
            nom: "Ouattara",
            prenom: "Aïcha",
            email: "aicha.ouattara@example.com",
            telephone: "0702345678",
            formation: { id: "form1", title: "Préparation au concours CAFOP 2024" },
            dateInscription: "2024-03-20T13:25:00Z",
            statut: "confirmé",
            paiement: "complet",
          },
          {
            id: "insc7",
            nom: "Konaté",
            prenom: "Mamadou",
            email: "mamadou.konate@example.com",
            telephone: "0703456789",
            formation: { id: "form3", title: "Préparation au concours d'entrée à l'INFS" },
            dateInscription: "2024-03-21T10:40:00Z",
            statut: "en attente",
            paiement: "partiel",
          },
        ]

        setFormations(mockFormations)
        setInscriptions(mockInscriptions)

        // Calculer les statistiques initiales
        const initialStats = {
          total: mockInscriptions.length,
          confirmes: mockInscriptions.filter((i) => i.statut === "confirmé").length,
          enAttente: mockInscriptions.filter((i) => i.statut === "en attente").length,
          paiementComplet: mockInscriptions.filter((i) => i.paiement === "complet").length,
        }

        setStats(initialStats)
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError("Impossible de charger les données. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Modifier la fonction handleInscriptionClick pour qu'elle fonctionne correctement
  const handleInscriptionClick = (inscription) => {
    console.log("Détails de l'inscription:", inscription)
    setSelectedInscription(inscription)
    setShowModal(true)
  }

  // Modifier la fonction contactByEmail pour qu'elle fonctionne correctement
  const contactByEmail = (email, event) => {
    if (event) event.stopPropagation() // Empêcher la propagation de l'événement
    window.location.href = `mailto:${email}`
  }

  // Modifier la fonction contactByPhone pour qu'elle fonctionne correctement
  const contactByPhone = (phone, event) => {
    if (event) event.stopPropagation() // Empêcher la propagation de l'événement
    window.location.href = `tel:${phone}`
  }

  // Ajouter une fonction pour mettre à jour le statut d'une inscription
  const handleStatusChange = (id, newStatus) => {
    // Mettre à jour l'inscription localement
    const updatedInscriptions = inscriptions.map((inscription) =>
      inscription.id === id ? { ...inscription, statut: newStatus } : inscription,
    )

    setInscriptions(updatedInscriptions)

    // Recalculer les statistiques
    const newStats = {
      total: updatedInscriptions.length,
      confirmes: updatedInscriptions.filter((i) => i.statut === "confirmé").length,
      enAttente: updatedInscriptions.filter((i) => i.statut === "en attente").length,
      paiementComplet: updatedInscriptions.filter((i) => i.paiement === "complet").length,
    }

    // Mettre à jour les statistiques
    setStats(newStats)

    // Fermer le modal si nécessaire
    if (selectedInscription && selectedInscription.id === id) {
      setSelectedInscription({ ...selectedInscription, statut: newStatus })
    }

    // Ici, vous feriez normalement un appel API pour mettre à jour le statut sur le serveur
    console.log(`Statut de l'inscription ${id} mis à jour à ${newStatus}`)
  }

  // Ajouter une fonction pour mettre à jour le statut de paiement
  const handlePaymentStatusChange = (id, newPaymentStatus) => {
    // Mettre à jour l'inscription localement
    const updatedInscriptions = inscriptions.map((inscription) =>
      inscription.id === id ? { ...inscription, paiement: newPaymentStatus } : inscription,
    )

    setInscriptions(updatedInscriptions)

    // Recalculer les statistiques
    const newStats = {
      total: updatedInscriptions.length,
      confirmes: updatedInscriptions.filter((i) => i.statut === "confirmé").length,
      enAttente: updatedInscriptions.filter((i) => i.statut === "en attente").length,
      paiementComplet: updatedInscriptions.filter((i) => i.paiement === "complet").length,
    }

    // Mettre à jour les statistiques
    setStats(newStats)

    // Fermer le modal si nécessaire
    if (selectedInscription && selectedInscription.id === id) {
      setSelectedInscription({ ...selectedInscription, paiement: newPaymentStatus })
    }

    // Ici, vous feriez normalement un appel API pour mettre à jour le statut sur le serveur
    console.log(`Statut de paiement de l'inscription ${id} mis à jour à ${newPaymentStatus}`)
  }

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
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const exportToCSV = () => {
    // Fonction pour exporter les inscriptions au format CSV
    const headers = ["Nom", "Prénom", "Email", "Téléphone", "Formation", "Date d'inscription", "Statut", "Paiement"]
    const csvContent = [
      headers.join(","),
      ...filteredInscriptions.map((insc) =>
        [
          insc.nom,
          insc.prenom,
          insc.email,
          insc.telephone,
          insc.formation.title,
          new Date(insc.dateInscription).toLocaleDateString("fr-FR"),
          insc.statut,
          insc.paiement,
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
    const matchesSearch =
      insc.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insc.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insc.telephone.includes(searchTerm)

    const matchesFormation = filterFormation === "all" || insc.formation.id === filterFormation

    return matchesSearch && matchesFormation
  })

  // Trier les inscriptions
  const sortedInscriptions = [...filteredInscriptions].sort((a, b) => {
    if (sortConfig.key === "date") {
      return sortConfig.direction === "asc"
        ? new Date(a.dateInscription) - new Date(b.dateInscription)
        : new Date(b.dateInscription) - new Date(a.dateInscription)
    }

    if (sortConfig.key === "nom") {
      return sortConfig.direction === "asc" ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom)
    }

    if (sortConfig.key === "formation") {
      return sortConfig.direction === "asc"
        ? a.formation.title.localeCompare(b.formation.title)
        : b.formation.title.localeCompare(a.formation.title)
    }

    if (sortConfig.key === "statut") {
      return sortConfig.direction === "asc" ? a.statut.localeCompare(b.statut) : b.statut.localeCompare(a.statut)
    }

    return 0
  })

  return (
    <div className="inscriptions-container">
      <div className="inscriptions-header">
        <h2>Gestion des inscriptions</h2>
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
          <div className="inscriptions-stats">
            <div className="stat-card">
              <h4>Total</h4>
              <p>{stats.total}</p>
            </div>
            <div className="stat-card">
              <h4>Confirmés</h4>
              <p>{stats.confirmes}</p>
            </div>
            <div className="stat-card">
              <h4>En attente</h4>
              <p>{stats.enAttente}</p>
            </div>
            <div className="stat-card">
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
                  <option key={formation.id} value={formation.id}>
                    {formation.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {sortedInscriptions.length === 0 ? (
            <div className="no-results">Aucun résultat ne correspond à votre recherche</div>
          ) : (
            <div className="inscriptions-table-container">
              <table className="inscriptions-table">
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInscriptions.map((inscription) => (
                    <tr key={inscription.id}>
                      <td>
                        <div className="inscrit-name">
                          <span className="nom">{inscription.nom}</span>
                          <span className="prenom">{inscription.prenom}</span>
                        </div>
                      </td>
                      <td>
                        <div className="inscrit-contact">
                          <div className="email">{inscription.email}</div>
                          <div className="phone">{inscription.telephone}</div>
                        </div>
                      </td>
                      <td>
                        <Link
                          to={`/business/dashboard/formations/${inscription.formation.id}`}
                          className="formation-link"
                        >
                          {inscription.formation.title}
                        </Link>
                      </td>
                      <td>{formatDate(inscription.dateInscription)}</td>
                      <td>
                        <span className={`status-badge ${inscription.statut}`}>{inscription.statut}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="view-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInscriptionClick(inscription)
                            }}
                          >
                            <Eye size={16} />
                            <span>Détails</span>
                          </button>
                          <button
                            className="contact-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              contactByEmail(inscription.email)
                            }}
                          >
                            <Mail size={16} />
                            <span>Contacter</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal for inscription details */}
          {showModal && selectedInscription && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Détails de l'inscription</h3>
                <div className="inscription-details">
                  <div className="detail-section">
                    <h4>Informations personnelles</h4>
                    <div className="detail-row">
                      <span className="detail-label">Nom:</span>
                      <span className="detail-value">{selectedInscription.nom}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Prénom:</span>
                      <span className="detail-value">{selectedInscription.prenom}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">
                        {selectedInscription.email}
                        <button
                          className="contact-email-btn"
                          onClick={(e) => contactByEmail(selectedInscription.email, e)}
                        >
                          <Mail size={16} />
                        </button>
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Téléphone:</span>
                      <span className="detail-value">
                        {selectedInscription.telephone}
                        <button
                          className="contact-phone-btn"
                          onClick={(e) => contactByPhone(selectedInscription.telephone, e)}
                        >
                          <Phone size={16} />
                        </button>
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Informations de formation</h4>
                    <div className="detail-row">
                      <span className="detail-label">Formation:</span>
                      <span className="detail-value">{selectedInscription.formation.title}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Date d'inscription:</span>
                      <span className="detail-value">{formatDate(selectedInscription.dateInscription)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Statut:</span>
                      <span className="detail-value">
                        <select
                          value={selectedInscription.statut}
                          onChange={(e) => handleStatusChange(selectedInscription.id, e.target.value)}
                          className={`status-select status-${selectedInscription.statut}`}
                        >
                          <option value="en attente">En attente</option>
                          <option value="confirmé">Confirmé</option>
                          <option value="annulé">Annulé</option>
                          <option value="terminé">Terminé</option>
                        </select>
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Paiement:</span>
                      <span className="detail-value">
                        <select
                          value={selectedInscription.paiement}
                          onChange={(e) => handlePaymentStatusChange(selectedInscription.id, e.target.value)}
                          className={`payment-select payment-${selectedInscription.paiement}`}
                        >
                          <option value="non payé">Non payé</option>
                          <option value="partiel">Partiel</option>
                          <option value="complet">Complet</option>
                        </select>
                      </span>
                    </div>
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
        </>
      )}
    </div>
  )
}

export default BusinessInscriptions

