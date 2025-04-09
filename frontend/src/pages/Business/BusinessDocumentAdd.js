"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, AlertCircle, LinkIcon } from "lucide-react"
import { getConcours, createDocument } from "../../services/api"
import "./BusinessDocumentAdd.css"

const BusinessDocumentAdd = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    concours: [],
    type: "pdf",
    price: "0",
    fileUrl: "",
    isPublic: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [availableConcours, setAvailableConcours] = useState([])
  const [isLoadingConcours, setIsLoadingConcours] = useState(true)

  // Types de documents disponibles
  const documentTypes = [
    { id: "pdf", name: "PDF" },
    { id: "doc", name: "Document Word" },
    { id: "ppt", name: "Présentation PowerPoint" },
    { id: "xls", name: "Feuille de calcul Excel" },
    { id: "image", name: "Image" },
    { id: "video", name: "Vidéo" },
    { id: "audio", name: "Audio" },
    { id: "other", name: "Autre" },
  ]

  useEffect(() => {
    // Charger la liste des concours depuis l'API
    const fetchConcours = async () => {
      setIsLoadingConcours(true)
      try {
        const response = await getConcours()
        console.log("Concours récupérés:", response)

        // Traiter la réponse en fonction de sa structure
        if (Array.isArray(response)) {
          setAvailableConcours(response)
        } else if (response && Array.isArray(response.data)) {
          setAvailableConcours(response.data)
        } else {
          console.error("Format de réponse inattendu:", response)
          setAvailableConcours([])
        }
      } catch (error) {
        console.error("Erreur lors du chargement des concours:", error)
        setError("Impossible de charger la liste des concours. Veuillez réessayer.")
        setAvailableConcours([])
      } finally {
        setIsLoadingConcours(false)
      }
    }

    fetchConcours()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleConcoursChange = (e) => {
    const { value, checked } = e.target

    if (checked) {
      setFormData({
        ...formData,
        concours: [...formData.concours, value],
      })
    } else {
      setFormData({
        ...formData,
        concours: formData.concours.filter((c) => c !== value),
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    // Validation
    if (!formData.title) {
      setError("Le titre du document est requis")
      setIsSubmitting(false)
      return
    }

    if (formData.concours.length === 0) {
      setError("Veuillez sélectionner au moins un concours")
      setIsSubmitting(false)
      return
    }

    if (!formData.fileUrl) {
      setError("Veuillez fournir l'URL du document")
      setIsSubmitting(false)
      return
    }

    try {
      // Appel API pour enregistrer le document
      await createDocument(formData)

      // Afficher le message de succès
      setSuccess("Document ajouté avec succès! Il sera visible dans la section 'Se préparer' pour les utilisateurs.")

      // Rediriger vers la liste des documents après 2 secondes
      setTimeout(() => {
        navigate("/business/dashboard/documents")
      }, 2000)
    } catch (error) {
      console.error("Erreur lors de l'ajout du document:", error)
      setError(error.message || "Une erreur est survenue lors de l'ajout du document")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="document-add-container">
      <div className="document-add-header">
        <button className="back-button" onClick={() => navigate("/business/dashboard/documents")}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <h2 className="page-title">Ajouter un document</h2>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="document-form">
        <div className="form-group">
          <label htmlFor="title">Titre du document *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Titre du document"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description du document</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Décrivez le contenu du document..."
          ></textarea>
        </div>

        <div className="form-group">
          <label>Concours concernés *</label>
          <p className="form-hint">Vous pouvez sélectionner plusieurs concours</p>

          {isLoadingConcours ? (
            <div className="loading-concours">Chargement des concours...</div>
          ) : availableConcours.length === 0 ? (
            <div className="no-concours">Aucun concours disponible. Veuillez contacter l'administrateur.</div>
          ) : (
            <div className="concours-checkboxes">
              {availableConcours.map((concours) => (
                <div key={concours._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`concours-${concours._id}`}
                    value={concours._id}
                    checked={formData.concours.includes(concours._id)}
                    onChange={handleConcoursChange}
                  />
                  <label htmlFor={`concours-${concours._id}`}>
                    {concours.title || concours.name || `Concours #${concours._id.substring(0, 6)}...`}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Type de document</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange} className="form-select">
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Prix (FCFA)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0 pour gratuit"
              min="0"
            />
            <p className="form-hint">Laissez 0 pour un document gratuit</p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="fileUrl">URL du document *</label>
          <div className="url-input-container">
            <LinkIcon size={20} className="url-icon" />
            <input
              type="url"
              id="fileUrl"
              name="fileUrl"
              value={formData.fileUrl}
              onChange={handleChange}
              placeholder="https://example.com/document.pdf"
              required
            />
          </div>
          <p className="form-hint">
            Entrez l'URL directe du document (Google Drive, Dropbox, etc.). Les utilisateurs pourront le télécharger
            directement.
          </p>
        </div>

        <div className="form-group checkbox-group">
          <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleChange} />
          <label htmlFor="isPublic">Rendre ce document public (visible pour tous les utilisateurs)</label>
        </div>

        <div className="form-notice">
          <p>
            <strong>Note:</strong> Ce document sera visible dans la section "Se préparer" du site pour les utilisateurs.
          </p>
          <p>
            <strong>Statistiques:</strong> Vous pourrez suivre le nombre de téléchargements dans votre tableau de bord.
          </p>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/business/dashboard/documents")}>
            Annuler
          </button>
          <button type="submit" className="btn-save" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BusinessDocumentAdd

