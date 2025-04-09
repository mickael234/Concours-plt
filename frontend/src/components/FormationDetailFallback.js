import { Link } from "react-router-dom"
import { Calendar, Clock, User, MapPin } from "lucide-react"
import "../pages/FormationDetail.css"

const FormationDetailFallback = () => {
  // Données fictives pour le fallback
  const formation = {
    _id: "fallback-id",
    title: "Formation temporairement indisponible",
    type: "Formation",
    isActive: true,
    description:
      "Les détails de cette formation ne sont pas disponibles pour le moment. Veuillez réessayer ultérieurement ou contacter notre support.",
    startDate: new Date().toISOString(),
    duration: "À déterminer",
    places: "À déterminer",
    location: "À déterminer",
    price: 0,
  }

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Date non spécifiée"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="formation-detail-container">
      <div className="formation-detail-header">
        <h1>{formation.title}</h1>
        <div className="formation-detail-meta">
          <span className="formation-detail-category">{formation.type}</span>
          <span className="formation-detail-status">{formation.isActive ? "Active" : "Inactive"}</span>
        </div>
      </div>

      <div className="formation-detail-content">
        <div className="formation-detail-main">
          <div className="formation-detail-image">
            <img src="/placeholder.svg?height=300&width=600" alt={formation.title} />
          </div>

          <div className="formation-detail-info-cards">
            <div className="info-card">
              <Calendar size={20} />
              <div>
                <h3>Date de début</h3>
                <p>{formatDate(formation.startDate)}</p>
              </div>
            </div>

            <div className="info-card">
              <Clock size={20} />
              <div>
                <h3>Durée</h3>
                <p>{formation.duration}</p>
              </div>
            </div>

            <div className="info-card">
              <User size={20} />
              <div>
                <h3>Places disponibles</h3>
                <p>{formation.places}</p>
              </div>
            </div>

            <div className="info-card">
              <MapPin size={20} />
              <div>
                <h3>Lieu</h3>
                <p>{formation.location}</p>
              </div>
            </div>
          </div>

          <div className="formation-detail-description">
            <h2>Description</h2>
            <p>{formation.description}</p>
            <div className="error-notice">
              <p>
                Nous rencontrons actuellement des difficultés techniques pour afficher les détails complets de cette
                formation.
              </p>
              <p>Veuillez réessayer plus tard ou contacter notre équipe de support.</p>
            </div>
          </div>
        </div>

        <div className="formation-detail-sidebar">
          <div className="formation-detail-price-card">
            <h2>Prix</h2>
            <div className="formation-price">
              <span className="free-price">Information indisponible</span>
            </div>
            <Link to="/formations" className="register-button">
              Retour aux formations
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormationDetailFallback

