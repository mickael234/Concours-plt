import React, { useState, useEffect } from "react"
import { validateConcoursData } from "../../utils/validation"

const initialFormData = {
  title: "",
  organization: "",
  description: "",
  year: new Date().getFullYear(),
  dateStart: "",
  dateEnd: "",
  registrationLink: "",
  conditions: [""],
  requiredDocuments: [""],
  steps: [{ title: "", date: "", description: "" }],
  documents: [
    {
      title: "",
      type: "",
      thumbnail: "",
      rating: 0,
      reviewCount: 0,
      price: "",
    },
  ],
}

const ConcoursForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dateStart: initialData.dateStart.split("T")[0],
        dateEnd: initialData.dateEnd.split("T")[0],
      })
    }
  }, [initialData])

  const handleInputChange = (e, index, field, subfield) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const newData = { ...prev }
      if (field) {
        if (subfield) {
          newData[field][index][subfield] = value
        } else {
          newData[field][index] = value
        }
      } else {
        newData[name] = value
      }
      return newData
    })
  }

  const addArrayField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "steps"
          ? [...prev[field], { title: "", date: "", description: "" }]
          : field === "documents"
            ? [...prev[field], { title: "", type: "", thumbnail: "", rating: 0, reviewCount: 0, price: "" }]
            : [...prev[field], ""],
    }))
  }

  const removeArrayField = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateConcoursData(formData)
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData)
    } else {
      setErrors(validationErrors)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-group">
        <label htmlFor="title">Titre</label>
        <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="organization">Organisation</label>
        <input
          type="text"
          id="organization"
          name="organization"
          value={formData.organization}
          onChange={handleInputChange}
          required
        />
        {errors.organization && <span className="error">{errors.organization}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
        {errors.description && <span className="error">{errors.description}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="year">Année</label>
        <input type="number" id="year" name="year" value={formData.year} onChange={handleInputChange} required />
        {errors.year && <span className="error">{errors.year}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="dateStart">Date de début</label>
        <input
          type="date"
          id="dateStart"
          name="dateStart"
          value={formData.dateStart}
          onChange={handleInputChange}
          required
        />
        {errors.dateStart && <span className="error">{errors.dateStart}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="dateEnd">Date de fin</label>
        <input type="date" id="dateEnd" name="dateEnd" value={formData.dateEnd} onChange={handleInputChange} required />
        {errors.dateEnd && <span className="error">{errors.dateEnd}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="registrationLink">Lien d'inscription</label>
        <input
          type="url"
          id="registrationLink"
          name="registrationLink"
          value={formData.registrationLink}
          onChange={handleInputChange}
        />
        {errors.registrationLink && <span className="error">{errors.registrationLink}</span>}
      </div>
      <div className="form-group">
        <label>Conditions</label>
        {formData.conditions.map((condition, index) => (
          <div key={index}>
            <input type="text" value={condition} onChange={(e) => handleInputChange(e, index, "conditions")} />
            <button
              type="button"
              onClick={() => removeArrayField("conditions", index)}
              className="button button-danger button-small"
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayField("conditions")}
          className="button button-secondary button-small"
        >
          Ajouter une condition
        </button>
      </div>
      <div className="form-group">
        <label>Documents requis</label>
        {formData.requiredDocuments.map((doc, index) => (
          <div key={index}>
            <input type="text" value={doc} onChange={(e) => handleInputChange(e, index, "requiredDocuments")} />
            <button
              type="button"
              onClick={() => removeArrayField("requiredDocuments", index)}
              className="button button-danger button-small"
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayField("requiredDocuments")}
          className="button button-secondary button-small"
        >
          Ajouter un document requis
        </button>
      </div>
      <div className="form-group">
        <label>Étapes</label>
        {formData.steps.map((step, index) => (
          <div key={index} className="step-item">
            <input
              type="text"
              placeholder="Titre"
              value={step.title}
              onChange={(e) => handleInputChange(e, index, "steps", "title")}
            />
            <input type="date" value={step.date} onChange={(e) => handleInputChange(e, index, "steps", "date")} />
            <textarea
              placeholder="Description"
              value={step.description}
              onChange={(e) => handleInputChange(e, index, "steps", "description")}
            />
            <button
              type="button"
              onClick={() => removeArrayField("steps", index)}
              className="button button-danger button-small"
            >
              Supprimer
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addArrayField("steps")} className="button button-secondary button-small">
          Ajouter une étape
        </button>
      </div>
      <div className="form-group">
        <label>Documents et formations pour préparer ce concours</label>
        {formData.documents.map((doc, index) => (
          <div key={index} className="document-item">
            <input
              type="text"
              placeholder="Titre"
              value={doc.title}
              onChange={(e) => handleInputChange(e, index, "documents", "title")}
            />
            <input
              type="text"
              placeholder="Type"
              value={doc.type}
              onChange={(e) => handleInputChange(e, index, "documents", "type")}
            />
            <input
              type="url"
              placeholder="URL de la vignette"
              value={doc.thumbnail}
              onChange={(e) => handleInputChange(e, index, "documents", "thumbnail")}
            />
            <input
              type="number"
              placeholder="Note"
              value={doc.rating}
              onChange={(e) => handleInputChange(e, index, "documents", "rating")}
              min="0"
              max="5"
              step="0.1"
            />
            <input
              type="number"
              placeholder="Nombre d'avis"
              value={doc.reviewCount}
              onChange={(e) => handleInputChange(e, index, "documents", "reviewCount")}
              min="0"
            />
            <input
              type="number"
              placeholder="Prix"
              value={doc.price}
              onChange={(e) => handleInputChange(e, index, "documents", "price")}
              min="0"
              step="0.01"
            />
            <button
              type="button"
              onClick={() => removeArrayField("documents", index)}
              className="button button-danger button-small"
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayField("documents")}
          className="button button-secondary button-small"
        >
          Ajouter un document ou une formation
        </button>
      </div>
      <div className="form-actions">
        <button type="submit" className="button button-primary">
          {initialData ? "Mettre à jour" : "Ajouter"}
        </button>
        {initialData && (
          <button type="button" onClick={onCancel} className="button button-secondary">
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}

export default ConcoursForm

