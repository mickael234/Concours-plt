//frontend/src/components/Concours/ConcourDetail.js
import React from "react"
import "./ConcoursDetail.css"

const ConcoursDetail = ({ concours }) => {
  if (!concours) {
    return null
  }

  const {
    title,
    organizerName,
    organizerLogo,
    dateStart,
    dateEnd,
    description,
    conditions,
    requiredDocuments,
    steps,
    documents,
  } = concours

  return (
    <div className="concours-detail">
      {/* Header */}
      <div className="detail-header">
        <h1>{title}</h1>
        <div className="organizer">
          {organizerLogo && <img src={organizerLogo || "/placeholder.svg"} alt={organizerName} />}
          <span>{organizerName}</span>
        </div>
      </div>

      {/* Session */}
      <section className="detail-section">
        <h2 className="section-title">SESSION: {new Date(dateStart).getFullYear()}</h2>
        <div className="session-info">
          <p>Début inscription: {new Date(dateStart).toLocaleDateString("fr-FR")}</p>
          <p>Fin inscription: {new Date(dateEnd).toLocaleDateString("fr-FR")}</p>
        </div>
      </section>

      {/* Présentation générale */}
      <section className="detail-section">
        <h2 className="section-title">Présentation générale</h2>
        <div className="section-content">
          <p>{description}</p>
        </div>
      </section>

      {/* Conditions de participation */}
      <section className="detail-section">
        <h2 className="section-title">Conditions de participation</h2>
        <div className="section-content">
          <ul className="conditions-list">
            {conditions?.map((condition, index) => (
              <li key={index}>{condition}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Documents Requis */}
      <section className="detail-section">
        <h2 className="section-title">Documents Requis</h2>
        <div className="section-content">
          <ul className="documents-list">
            {requiredDocuments?.map((doc, index) => (
              <li key={index}>{doc}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Les étapes */}
      <section className="detail-section">
        <h2 className="section-title">Les étapes</h2>
        <div className="section-content">
          <div className="timeline">
            {steps?.map((step, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>{step.title}</h3>
                  <p className="timeline-date">{new Date(step.date).toLocaleDateString("fr-FR")}</p>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents et formations */}
      <section className="detail-section">
        <h2 className="section-title">Documents et formations pour préparer ce concours</h2>
        <div className="section-content">
          <div className="documents-grid">
            {documents?.map((doc, index) => (
              <div key={index} className="document-card">
                <h3>{doc.title}</h3>
                <p>{doc.description}</p>
                {doc.price && <p className="price">{doc.price} FCFA</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ConcoursDetail

