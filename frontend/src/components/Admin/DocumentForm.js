"use client"

import { useState, useEffect } from "react"
import { createDocument, getConcours } from "../../services/api"
import { FileText, Upload, X } from "lucide-react"
import "./DocumentForm.css"

const DocumentForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    file: null,
    coverImage: null,
    concours: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [concoursList, setConcoursList] = useState([])
  const [filePreview, setFilePreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  useEffect(() => {
    // Charger la liste des concours
    const loadConcours = async () => {
      try {
        const data = await getConcours()
        setConcoursList(data || [])
      } catch (error) {
        console.error("Erreur lors du chargement des concours:", error)
        setError("Impossible de charger la liste des concours.")
      }
    }

    loadConcours()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked })
    } else if (name === "concours") {
      // Gestion des concours sélectionnés (select multiple)
      const options = e.target.options
      const selectedValues = []
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(options[i].value)
        }
      }
      setFormData({ ...formData, concours: selectedValues })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, file })

      // Créer une URL pour prévisualiser le fichier (si c'est une image)
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => setFilePreview(e.target.result)
        reader.readAsDataURL(file)
      } else {
        // Pour les PDF et autres documents, afficher une icône
        setFilePreview("document")
      }
    }
  }

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, coverImage: file })

      // Créer une URL pour prévisualiser l'image de couverture
      const reader = new FileReader()
      reader.onload = (e) => setCoverPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setFormData({ ...formData, file: null })
    setFilePreview(null)
  }

  const removeCoverImage = () => {
    setFormData({ ...formData, coverImage: null })
    setCoverPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validation de base
      if (!formData.title.trim()) {
        throw new Error("Le titre est requis")
      }

      if (!formData.file) {
        throw new Error("Veuillez sélectionner un fichier à télécharger")
      }

      // Créer le document
      await createDocument(formData)
      setSuccess(true)
      setLoading(false)

      // Réinitialiser le formulaire
      setFormData({
        title: "",
        description: "",
        price: 0,
        file: null,
        coverImage: null,
        concours: [],
      })
      setFilePreview(null)
      setCoverPreview(null)

      // Notifier le composant parent
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Erreur lors de la création du document:", error)
      setError(error.message || "Une erreur s'est produite lors de la création du document.")
      setLoading(false)
    }
  }

  return (
    <div className="document-form-container">
      <h2>Ajouter un nouveau document</h2>

      {success && <div className="success-message">Document créé avec succès!</div>}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="document-form">
        <div className="form-group">
          <label htmlFor="title">Titre*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Titre du document"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description du document"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Prix (FCFA)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            placeholder="0 = Gratuit"
          />
        </div>

        <div className="form-group">
          <label htmlFor="concours">Concours associés</label>
          <select id="concours" name="concours" multiple value={formData.concours} onChange={handleChange}>
            {concoursList.map((concours) => (
              <option key={concours._id} value={concours._id}>
                {concours.title || concours.name}
              </option>
            ))}
          </select>
          <small>Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs concours</small>
        </div>

        <div className="form-group file-upload">
          <label>Document PDF*</label>
          <div className="upload-container">
            {!filePreview ? (
              <>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  className="file-input"
                />
                <label htmlFor="file" className="file-label">
                  <Upload size={24} />
                  <span>Sélectionner un fichier</span>
                </label>
              </>
            ) : (
              <div className="file-preview">
                <FileText size={48} />
                <span>{formData.file?.name}</span>
                <button type="button" onClick={removeFile} className="remove-file">
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-group file-upload">
          <label>Image de couverture</label>
          <div className="upload-container">
            {!coverPreview ? (
              <>
                <input
                  type="file"
                  id="coverImage"
                  name="coverImage"
                  onChange={handleCoverImageChange}
                  accept="image/*"
                  className="file-input"
                />
                <label htmlFor="coverImage" className="file-label">
                  <Upload size={24} />
                  <span>Sélectionner une image</span>
                </label>
              </>
            ) : (
              <div className="cover-preview">
                <img src={coverPreview || "/placeholder.svg"} alt="Aperçu de la couverture" />
                <button type="button" onClick={removeCoverImage} className="remove-file">
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            Annuler
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Création en cours..." : "Créer le document"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DocumentForm

