import React from "react"

const ConcoursList = ({ concours, onEdit, onDelete }) => {
  return (
    <div>
      <h2 className="admin-title">Liste des Concours</h2>
      {concours.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Organisation</th>
              <th>Année</th>
              <th>Période d'inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {concours.map((c) => (
              <tr key={c._id}>
                <td>{c.title}</td>
                <td>{c.organization}</td>
                <td>{c.year}</td>
                <td>
                  {new Date(c.dateStart).toLocaleDateString("fr-FR")} au{" "}
                  {new Date(c.dateEnd).toLocaleDateString("fr-FR")}
                </td>
                <td className="action-buttons">
                  <button onClick={() => onEdit(c)} className="button button-primary">
                    Modifier
                  </button>
                  <button onClick={() => onDelete(c._id)} className="button button-danger">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aucun concours disponible.</p>
      )}
    </div>
  )
}

export default ConcoursList

