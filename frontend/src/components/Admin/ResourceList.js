"use client"
import "./ResourceList.css"

const ResourceList = ({ resources, onEdit, onDelete }) => {
  console.log("Resources received in ResourceList:", resources)

  if (!resources || resources.length === 0) {
    return <p className="empty-message">Aucune ressource disponible.</p>
  }

  // Helper function to get concours name
  const getConcoursName = (concoursId) => {
    if (!concoursId) return "Non spécifié"

    // If concoursId is an object with title or name property
    if (typeof concoursId === "object") {
      return concoursId.title || concoursId.name || "Concours sans nom"
    }

    // If it's just an ID without the populated data
    return "Concours #" + concoursId.toString().substring(0, 6) + "..."
  }

  return (
    <div className="resource-container">
      <h2 className="resource-title">Liste des Ressources</h2>
      <div className="resource-list">
        <table className="resource-table">
          <thead>
            <tr>
              <th>TITRE</th>
              <th>TYPE</th>
              <th>MATIÈRE</th>
              <th>ANNÉE</th>
              <th>CONCOURS ASSOCIÉS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource._id}>
                <td>{resource.title || "Sans titre"}</td>
                <td>{resource.type === "past_paper" ? "Ancien sujet" : "Cours"}</td>
                <td>{resource.subject || "Non spécifié"}</td>
                <td>{resource.year || "Non spécifié"}</td>
                <td>{getConcoursName(resource.concoursId)}</td>
                <td className="action-cell">
                  <button onClick={() => onEdit(resource)} className="btn-edit1">
                    Modifier
                  </button>
                  <button onClick={() => onDelete(resource._id)} className="btn-delete1">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResourceList

