"use client"

import { useState, useEffect } from "react"
import { getConcours } from "../../services/api"
import { uploadFile } from "../../utils/fileUtils"
import "./ResourceForm.css"
import "./select-fix.css"

const ResourceForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "past_paper",
    description: "",
    fileUrl: "",
    imageUrl: "",
    subject: "",
    year: new Date().getFullYear(),
    price: 0,
    concoursId: "",
  })

  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [concoursList, setConcoursList] = useState([])
  const [loadingConcours, setLoadingConcours] = useState(true)
  // eslint-disable-next-line no-unused-vars
  const [filePreview, setFilePreview] = useState(null) // This variable is intentionally unused

  useEffect(() => {
    if (initialData) {
      // Handle concoursId if it's an object
      const concoursId =
        initialData.concoursId && typeof initialData.concoursId === "object"
          ? initialData.concoursId._id
          : initialData.concoursId

      setFormData({
        ...initialData,
        concoursId: concoursId || "",
      })
    }

    // Charger la liste des concours
    const fetchConcours = async () => {
      try {
        setLoadingConcours(true)
        const response = await getConcours()
        console.log("Concours response:", response)

        if (Array.isArray(response)) {
          setConcoursList(response)
        } else if (response && Array.isArray(response.data)) {
          setConcoursList(response.data)
        } else {
          console.error("Format de réponse invalide pour les concours:", response)
          setConcoursList([])
        }
      } catch (err) {
        console.error("Erreur lors du chargement des concours:", err)
      } finally {
        setLoadingConcours(false)
      }
    }

    fetchConcours()
  }, [initialData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log(`Input changed: ${name} = ${value}`)
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validation de l'URL du document
      if (!formData.fileUrl) {
        throw new Error("L'URL du document est requise")
      }

      let imageUrl = formData.imageUrl

      // Upload de l'image si une nouvelle image est sélectionnée
      if (image) {
        imageUrl = await uploadFile(image, "image")
      }

      const resourceData = {
        ...formData,
        imageUrl,
      }

      console.log("Submitting resource with data:", resourceData)
      await onSubmit(resourceData)

      // Réinitialiser le formulaire après une soumission réussie
      if (!initialData) {
        setFormData({
          title: "",
          type: "past_paper",
          description: "",
          fileUrl: "",
          imageUrl: "",
          subject: "",
          year: new Date().getFullYear(),
          price: 0,
          concoursId: "",
        })
        setImage(null)
      }
    } catch (err) {
      console.error("Erreur lors de la soumission de la ressource:", err)
      setError(err.message || "Une erreur est survenue lors de la soumission")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="resource-form">
      <div className="form-group">
        <label htmlFor="title">Titre</label>
        <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="type">Type</label>
        <select id="type" name="type" value={formData.type} onChange={handleInputChange} required>
          <option value="past_paper">Ancien sujet</option>
          <option value="course">Cours</option>
        </select>
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
      </div>

      <div className="form-group">
        <label htmlFor="fileUrl">URL du document (PDF)</label>
        <input
          type="url"
          id="fileUrl"
          name="fileUrl"
          value={formData.fileUrl}
          onChange={handleInputChange}
          placeholder="https://example.com/document.pdf"
          required
        />
        <small className="form-help">Entrez l'URL directe du document PDF</small>
      </div>

      <div className="form-group">
        <label htmlFor="image">Image de prévisualisation</label>
        <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
        {formData.imageUrl && (
          <div className="image-preview">
            <img src={formData.imageUrl || "/placeholder.svg"} alt="Prévisualisation" />
          </div>
        )}
        <small className="form-help">Téléchargez une image de la première page du document</small>
      </div>

      <div className="form-group">
        <label htmlFor="subject">Matière</label>
        <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="year">Année</label>
        <input type="number" id="year" name="year" value={formData.year} onChange={handleInputChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="price">Prix (FCFA)</label>
        <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="concoursId">Concours associé</label>
        <select
          id="concoursId"
          name="concoursId"
          value={formData.concoursId}
          onChange={handleInputChange}
          style={{ color: "black" }}
        >
          <option value="">Sélectionner un concours</option>
          {loadingConcours ? (
            <option disabled>Chargement des concours...</option>
          ) : (
            concoursList.map((concours) => (
              <option key={concours._id} value={concours._id}>
                {concours.title || concours.name || `Concours #${concours._id.substring(0, 6)}...`}
              </option>
            ))
          )}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="cancel-button">
            Annuler
          </button>
        )}
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Envoi en cours..." : initialData ? "Mettre à jour" : "Créer"}
        </button>
      </div>
    </form>
  )
}

export default ResourceForm

