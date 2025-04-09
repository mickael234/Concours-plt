import React from "react"
import ConcoursCard from "./ConcoursCard"

const ConcoursList = ({ concoursList }) => {
  if (!concoursList || concoursList.length === 0) {
    return <p>Aucun concours disponible pour le moment.</p>
  }

  return (
    <div className="concours-grid">
      {concoursList.map((concours) => (
        <ConcoursCard key={concours._id} concours={concours} />
      ))}
    </div>
  )
}

export default ConcoursList

