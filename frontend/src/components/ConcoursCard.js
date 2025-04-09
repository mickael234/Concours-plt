import { Link } from "react-router-dom"
import { Rocket, Star } from "lucide-react"
import { formatDate } from "../../utils/dateUtils"
import "./ConcoursCard.css"

const ConcoursCard = ({ concours }) => {
  if (!concours) {
    return null
  }

  const {
    _id,
    title,
    organizerName,
    organizerLogo,
    dateStart,
    dateEnd,
    views,
    averageRating = 0,
    numRatings = 0,
    status,
  } = concours

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star key={index} className={`h-4 w-4 ${index < rating ? "fill-current text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "a_venir":
        return "bg-blue-500"
      case "en_cours":
        return "bg-green-500"
      case "termine":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "a_venir":
        return "À venir"
      case "en_cours":
        return "En cours"
      case "termine":
        return "Terminé"
      default:
        return "Inconnu"
    }
  }

  return (
    <div className="concours-card">
      <div className="concours-header">
        <h3>{title}</h3>
        <div className={`status-badge ${getStatusColor(status)}`}>
          <Rocket className="h-4 w-4" />
          <span>{getStatusText(status)}</span>
        </div>
      </div>

      <div className="inscription-period">
        <p>Inscription</p>
        <p>
          Du {formatDate(dateStart)} au {formatDate(dateEnd)}
        </p>
      </div>

      <div className="organizer-section">
        <div className="organizer-logo">
          {organizerLogo ? (
            <img src={organizerLogo || "/placeholder.svg"} alt={organizerName} />
          ) : (
            <div className="logo-placeholder">{organizerName?.charAt(0) || "O"}</div>
          )}
        </div>
        <div className="organizer-info">
          <p className="organizer-name">{organizerName}</p>
          <div className="rating-section">
            <div className="stars">{renderStars(Math.round(averageRating))}</div>
            <span className="rating-count">({numRatings} avis)</span>
          </div>
        </div>
      </div>

      <div className="concours-footer">
        <span className="views-count">{views} vues</span>
        <Link to={`/concours/${_id}`} className="details-button">
          Voir plus
        </Link>
      </div>
    </div>
  )
}

export default ConcoursCard

