"use client"

import { useState, useEffect } from "react"
import { getUserApplications, withdrawApplication } from "../../services/api"
import { FileCheck, Calendar, Building, Award, X } from "lucide-react"
import "./UserApplications.css"

const UserApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const data = await getUserApplications()
        setApplications(data || [])
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des candidatures:", err)
        setError("Impossible de charger vos candidatures. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const handleWithdraw = async (applicationId) => {
    try {
      setActionLoading(true)
      await withdrawApplication(applicationId)
      setApplications(applications.filter((app) => app._id !== applicationId))
    } catch (err) {
      console.error("Erreur lors du retrait de la candidature:", err)
      setError("Impossible de retirer la candidature. Veuillez réessayer.")
    } finally {
      setActionLoading(false)
    }
  }

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

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "approved":
        return "Acceptée"
      case "rejected":
        return "Refusée"
      case "withdrawn":
        return "Retirée"
      default:
        return "Statut inconnu"
    }
  }

  if (loading && !applications.length) {
    return <div className="loading-state">Chargement de vos candidatures...</div>
  }

  return (
    <div className="user-applications-container">
      <div className="applications-header">
        <h1>Mes Candidatures</h1>
        <p>Suivez l'état de vos candidatures aux concours</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {applications.length === 0 ? (
        <div className="empty-applications">
          <FileCheck size={48} />
          <p>Il n'est pour l'instant pas encore possible de candidater sur Concours CI.</p>
          <p className="empty-subtitle">Cela sera possible dans les prochaines versions.</p>
          <div className="info-box">
            <p>Vous pourriez gérer ici l'ensemble de vos candidatures</p>
          </div>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((application) => (
            <div key={application._id} className="application-card">
              <div className="application-header">
                <h2>{application.concours?.title || "Concours non spécifié"}</h2>
                <span className={`application-status status-${application.status}`}>
                  {getStatusLabel(application.status)}
                </span>
              </div>

              <div className="application-details">
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>Soumis le: {formatDate(application.createdAt)}</span>
                </div>

                <div className="detail-item">
                  <Building size={16} />
                  <span>Établissement: {application.concours?.establishment?.name || "Non spécifié"}</span>
                </div>

                <div className="detail-item">
                  <Award size={16} />
                  <span>Type: {application.concours?.type || "Non spécifié"}</span>
                </div>
              </div>

              {application.feedback && (
                <div className="application-feedback">
                  <h3>Retour</h3>
                  <p>{application.feedback}</p>
                </div>
              )}

              <div className="application-actions">
                <a href={`/concours/${application.concours?._id}`} className="view-btn">
                  Voir le concours
                </a>

                {application.status === "pending" && (
                  <button
                    className="withdraw-btn"
                    onClick={() => handleWithdraw(application._id)}
                    disabled={actionLoading}
                  >
                    <X size={16} />
                    <span>Retirer ma candidature</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserApplications

