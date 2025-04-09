"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Rocket, Star } from "lucide-react"
import { formatDate } from "../../utils/dateUtils"
import "./ConcoursCard.css"

const ConcoursCard = ({ concours: initialConcours }) => {
  // Utilisons un état local pour stocker les données du concours
  const [concours, setConcours] = useState(initialConcours)

  useEffect(() => {
    // Mettre à jour l'état local lorsque les props changent
    setConcours(initialConcours)
  }, [initialConcours])

  useEffect(() => {
    // Écouter l'événement de mise à jour des concours
    const handleConcoursUpdate = (event) => {
      if (event.detail.id === concours._id) {
        setConcours(event.detail.data)
      }
    }

    window.addEventListener("concoursUpdated", handleConcoursUpdate)

    return () => {
      window.removeEventListener("concoursUpdated", handleConcoursUpdate)
    }
  }, [concours._id])

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
        return "bg-blue-500 text-white"
      case "en_cours":
        return "bg-green-500 text-white"
      case "termine":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
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
    <div className="concours-card bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="concours-header p-4 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className={`status-badge px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
          <Rocket className="h-4 w-4 inline-block mr-1" />
          <span>{getStatusText(status)}</span>
        </div>
      </div>

      <div className="inscription-period p-4 bg-gray-100">
        <p className="text-sm text-gray-600">Inscription</p>
        <p className="text-sm font-medium">
          Du {formatDate(dateStart)} au {formatDate(dateEnd)}
        </p>
      </div>

      <div className="organizer-section">
        <div className="organizer-logo ">
          {organizerLogo ? (
            <img
              src={ organizerLogo || "/placeholder.svg"}
              alt={organizerName}
              className=" rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
              {organizerName?.charAt(0) || "O"}
            </div>
          )}
        </div>
        <div className="organizer-info">
          <p className="organizer-name text-sm font-medium">{organizerName}</p>
          <div className="rating-section flex items-center">
            <div className="stars flex mr-1">{renderStars(Math.round(averageRating))}</div>
            <span className="rating-count text-xs text-gray-500">({numRatings} avis)</span>
          </div>
        </div>
      </div>

      <div className="concours-footer p-4 bg-gray-50 flex justify-between items-center">
        <span className="views-count text-sm text-gray-500">{views || 0} vues</span>
        <Link
          to={`/concours/${_id}`}
          className="details-button px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Voir plus
        </Link>
      </div>
    </div>
  )
}

export default ConcoursCard

