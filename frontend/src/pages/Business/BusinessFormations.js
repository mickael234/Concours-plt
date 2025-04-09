"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Search, Calendar, Users, Edit, Trash, Eye } from "lucide-react"
import { getBusinessFormations, deleteFormation } from "../../services/api"
import "./BusinessFormations.css"

const BusinessFormations = () => {
  const [formations, setFormations] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchFormations()
  }, [])

  const fetchFormations = async () => {
    try {
      const data = await getBusinessFormations()
      setFormations(data)
    } catch (error) {
      console.error("Error fetching formations:", error)
    }
  }

  const filteredFormations = formations.filter((formation) => {
    const searchMatch =
      formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.description.toLowerCase().includes(searchTerm.toLowerCase())

    const startDateMatch = startDate ? new Date(formation.startDate) >= new Date(startDate) : true

    const endDateMatch = endDate ? new Date(formation.endDate) <= new Date(endDate) : true

    return searchMatch && startDateMatch && endDateMatch
  })

  const handleEdit = (formationId) => {
    navigate(`/business/dashboard/formations/edit/${formationId}`)
  }

  const handleDelete = async (formationId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      try {
        await deleteFormation(formationId)
        // Rafraîchir la liste après suppression
        fetchFormations()
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
        setError("Impossible de supprimer la formation. Veuillez réessayer.")
      }
    }
  }

  return (
    <div className="business-formations">
     <div className="formations-top-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Retour
        </button>
        <h2>Mes Formations</h2>
        </div>
        
      
      {error && <div className="error-message">{error}</div>}
      <div className="formations-header3">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="date-filters3">
          <div className="date-input">
            <Calendar size={20} />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="date-input">
            <Calendar size={20} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <Link to="/business/dashboard/formations/add" className="create-formation-btn">
          <Plus size={20} />
          Créer une formation
        </Link>
      </div>
      <div className="formations-list3">
        {filteredFormations.map((formation) => (
          <div className="formation-card3" key={formation._id}>
            <h3>{formation.title}</h3>
            <p>{formation.description}</p>
            <div className="formation-details3">
              <p>Date de début: {new Date(formation.startDate).toLocaleDateString()}</p>
              <p>Date de fin: {new Date(formation.endDate).toLocaleDateString()}</p>
            </div>
            <div className="formation-actions3">
              <Link
                to={`/business/dashboard/formations/${formation._id}/inscriptions`}
                className="action-btn view-btn"
                title="Voir les inscrits"
              >
                <Users size={20} />
              </Link>

              <button
                className="action-btn edit-btn"
                title="Modifier la formation"
                onClick={() => handleEdit(formation._id)}
              >
                <Edit size={20} />
              </button>

              <button
                className="action-btn delete-btnf"
                title="Supprimer la formation"
                onClick={() => handleDelete(formation._id)}
              >
                <Trash size={20} />
              </button>

              <Link
                to={`/formations/${formation._id}`}
                className="action-btn preview-btn"
                title="Prévisualiser"
                target="_blank"
              >
                <Eye size={20} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BusinessFormations

