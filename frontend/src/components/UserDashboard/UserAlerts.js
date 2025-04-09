"use client"

import { useState, useEffect } from "react"
import { Bell, Plus } from "lucide-react"
import { getConcours } from "../../services/api"
import "./UserAlerts.css"

const UserAlerts = () => {
  const [alerts, setAlerts] = useState([])
  const [isAddAlertModalOpen, setIsAddAlertModalOpen] = useState(false)
  const [selectedConcours, setSelectedConcours] = useState("")
  const [availableConcours, setAvailableConcours] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchConcours = async () => {
      try {
        setLoading(true)
        const response = await getConcours()
        const concoursData = response.data || []
        setAvailableConcours(concoursData)
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des concours:", err)
        setError("Impossible de charger les concours. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchConcours()
  }, [])

  const openAddAlertModal = () => {
    setIsAddAlertModalOpen(true)
  }

  const closeAddAlertModal = () => {
    setIsAddAlertModalOpen(false)
    setSelectedConcours("")
  }

  const handleAddAlert = () => {
    if (selectedConcours) {
      const selectedConcoursObj = availableConcours.find((c) => c._id === selectedConcours)
      if (selectedConcoursObj) {
        setAlerts([...alerts, { id: Date.now(), concours: selectedConcoursObj }])
        closeAddAlertModal()
      }
    }
  }

  const handleDeleteAlert = (alertId) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  return (
    <div className="user-alerts-container">
      <div className="alerts-header">
        <h1>Mes alertes pour être informé du lancement des concours</h1>
        <Bell size={32} />
      </div>

      <button className="add-alert-btn" onClick={openAddAlertModal}>
        <Plus size={20} />
        <span>Ajouter une nouvelle alerte</span>
      </button>

      {alerts.length === 0 ? (
        <div className="no-alerts">
          <p>Vous n'avez pas encore configuré d'alertes.</p>
          <p>
            Ajoutez des alertes pour être informé par email dès qu'un concours qui vous intéresse est lancé ou mis à
            jour sur Concours CI.
          </p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-item">
              <div className="alert-info">
                <h3>{alert.concours.title}</h3>
              </div>
              <button className="delete-alert-btn" onClick={() => handleDeleteAlert(alert.id)}>
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {isAddAlertModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Définir une alerte pour un concours CI</h2>
              <button className="close-modal-btn" onClick={closeAddAlertModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {loading ? (
                <p>Chargement des concours...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : (
                <div className="form-group">
                  <select
                    value={selectedConcours}
                    onChange={(e) => setSelectedConcours(e.target.value)}
                    className="concours-select"
                  >
                    <option value="">Choisir un concours...</option>
                    {availableConcours.map((concours) => (
                      <option key={concours._id} value={concours._id}>
                        {concours.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="add-btn" onClick={handleAddAlert} disabled={!selectedConcours || loading}>
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserAlerts

