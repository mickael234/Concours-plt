"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { getConcours } from "../../services/api"
import axios from "axios"
import "./BusinessFormationAdd.css"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const BusinessFormationAdd = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    concours: [],
    type: "online",
    places: "",

    hasMultipleMonths: false,
    price: "",
    startDate: "",
    endDate: "",
    level: "beginner",
    onlinePlatform: "",
    location: "",
    additionalComment: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [availableConcours, setAvailableConcours] = useState([])
  const [isLoadingConcours, setIsLoadingConcours] = useState(true)
  const [imagePreview, setImagePreview] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  // Types de formation disponibles
  const formationTypes = [
    { id: "online", name: "Formation en ligne" },
    { id: "inperson", name: "Formation en présentiel" },
    { id: "hybrid", name: "Formation en ligne et en présentiel" },
  ]

  // Niveaux de formation disponibles
  const formationLevels = [
    { id: "beginner", name: "Débutant" },
    { id: "intermediate", name: "Intermédiaire" },
    { id: "advanced", name: "Avancé" },
    { id: "all", name: "Tous niveaux" },
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData({
          ...formData,
          image: file,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")
    setDebugInfo(null)

    // Validation
    if (!formData.title) {
      setError("Le libellé de la formation est requis")
      setIsSubmitting(false)
      return
    }

    if (formData.concours.length === 0) {
      setError("Veuillez sélectionner au moins un concours")
      setIsSubmitting(false)
      return
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Les dates de début et de fin sont requises")
      setIsSubmitting(false)
      return
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("La date de début doit être antérieure à la date de fin")
      setIsSubmitting(false)
      return
    }

    // Validation spécifique au type de formation
    if ((formData.type === "online" || formData.type === "hybrid") && !formData.onlinePlatform) {
      setError("Veuillez indiquer la plateforme en ligne pour la formation")
      setIsSubmitting(false)
      return
    }

    if ((formData.type === "inperson" || formData.type === "hybrid") && !formData.location) {
      setError("Veuillez indiquer le lieu pour la formation en présentiel")
      setIsSubmitting(false)
      return
    }

    try {
      // Récupérer le token business
      const businessToken = localStorage.getItem("businessToken")
      if (!businessToken) {
        throw new Error("Vous devez être connecté en tant qu'entreprise pour créer une formation")
      }

      // Créer un FormData pour l'envoi des données
      const formDataToSend = new FormData()

      // Ajouter les champs obligatoires
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description || "Aucune description fournie")
      formDataToSend.append("type", formData.type)

      // Ajouter les dates
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      formDataToSend.append("startDate", startDate.toISOString())
      formDataToSend.append("endDate", endDate.toISOString())

      // Ajouter les autres champs
      formDataToSend.append("price", formData.price || 0)
      formDataToSend.append("level", formData.level)

      if (formData.places) {
        formDataToSend.append("places", formData.places)
      }

      if (formData.location) {
        formDataToSend.append("location", formData.location)
      }

      if (formData.onlinePlatform) {
        formDataToSend.append("onlinePlatform", formData.onlinePlatform)
      }

      if (formData.additionalComment) {
        formDataToSend.append("additionalComment", formData.additionalComment)
      }

      formDataToSend.append("hasMultipleMonths", formData.hasMultipleMonths)

      // Ajouter les concours (convertir en JSON)
      if (formData.concours.length > 0) {
        formDataToSend.append("concours", JSON.stringify(formData.concours))
      }

      // Ajouter l'image si elle existe
      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }

      // Afficher les données qui seront envoyées pour le débogage
      const formDataEntries = {}
      for (const [key, value] of formDataToSend.entries()) {
        formDataEntries[key] = value
      }
      setDebugInfo({
        formDataEntries,
        token: businessToken ? "Token présent" : "Token manquant",
      })

      console.log("Envoi des données de formation:", formDataEntries)

      // Appel API direct avec axios
      const response = await axios.post(`${API_URL}/formations`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${businessToken}`,
        },
      })

      console.log("Réponse de création de formation:", response.data)

      // Afficher le message de succès
      setSuccess(
        "Formation ajoutée avec succès! Elle sera visible dans la section 'Se préparer' pour les utilisateurs.",
      )

      // Rediriger vers la liste des formations après 2 secondes
      setTimeout(() => {
        navigate("/business/dashboard/formations")
      }, 2000)
    } catch (error) {
      console.error("Erreur lors de l'ajout de la formation:", error)

      let errorMessage = "Une erreur est survenue lors de l'ajout de la formation"

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)

      // Ajouter des informations de débogage supplémentaires
      setDebugInfo((prev) => ({
        ...prev,
        error: {
          message: error.message,
          response: error.response
            ? {
                status: error.response.status,
                data: error.response.data,
              }
            : "Pas de réponse",
          request: error.request ? "Requête envoyée mais pas de réponse" : "Erreur avant l'envoi de la requête",
        },
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Déterminer quels champs conditionnels afficher en fonction du type de formation
  const showOnlinePlatformField = formData.type === "online" || formData.type === "hybrid"
  const showLocationField = formData.type === "inperson" || formData.type === "hybrid"

  return (
    <div className="formation-add-container">
      <div className="formation-add-header">
        <button className="back-button" onClick={() => navigate("/business/dashboard/formations")}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <h2 className="page-title">Ajouter une formation</h2>
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

      <form onSubmit={handleSubmit} className="formation-form">
        <div className="form-group">
          <label htmlFor="title">Libellé de la formation *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Libellé de la formation"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Présentation de la formation</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            placeholder="Décrivez votre formation..."
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

        <div className="form-group">
          <label htmlFor="type">Catégorie de formation</label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} className="form-select">
            {formationTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Champs conditionnels basés sur le type de formation */}
        {showOnlinePlatformField && (
          <div className="form-group">
            <label htmlFor="onlinePlatform">Sur quelle plateforme la formation en ligne se fera ? *</label>
            <input
              type="text"
              id="onlinePlatform"
              name="onlinePlatform"
              value={formData.onlinePlatform}
              onChange={handleChange}
              placeholder="Ex: Zoom, Google Meet, Microsoft Teams, etc."
              required={showOnlinePlatformField}
            />
          </div>
        )}

        {showLocationField && (
          <div className="form-group">
            <label htmlFor="location">Le lieu où la formation en présentiel se fera ? *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Adresse complète du lieu de formation"
              required={showLocationField}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="additionalComment">Voulez-vous rajouter un commentaire ?</label>
          <textarea
            id="additionalComment"
            name="additionalComment"
            value={formData.additionalComment}
            onChange={handleChange}
            rows="3"
            placeholder="Informations supplémentaires sur la formation..."
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Date de début *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">Date de fin *</label>
            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="places">Nombre de places</label>
            <input
              type="number"
              id="places"
              name="places"
              value={formData.places}
              onChange={handleChange}
              placeholder="Nombre de places disponibles"
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Prix (FCFA) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Prix de la formation"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="level">Niveau</label>
          <select id="level" name="level" value={formData.level} onChange={handleChange} className="form-select">
            {formationLevels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Charger une affiche pour capter l'attention des clients</label>
          <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview || "/placeholder.svg"} alt="Aperçu de l'affiche" />
            </div>
          )}
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="hasMultipleMonths"
            name="hasMultipleMonths"
            checked={formData.hasMultipleMonths}
            onChange={handleChange}
          />
          <label htmlFor="hasMultipleMonths">
            Cette formation comporte plusieurs mois. Les candidats peuvent décider de s'inscrire à un ou plusieurs mois
            de leur choix.
          </label>
        </div>

        <div className="form-notice">
          <p>
            <strong>Note:</strong> Cette formation sera visible dans la section "Se préparer" du site pour les
            utilisateurs.
          </p>
          <p>
            <strong>Inscriptions:</strong> Les utilisateurs pourront s'inscrire en fournissant leurs informations (nom,
            prénom, date de naissance, numéro, email).
          </p>
          <p>
            <strong>Gestion:</strong> Vous pourrez voir la liste des inscrits dans votre tableau de bord et les
            contacter directement.
          </p>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/business/dashboard/formations")}>
            Annuler
          </button>
          <button type="submit" className="btn-save" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>

      {/* Section de débogage - à supprimer en production */}
      {debugInfo && (
        <div
          className="debug-section"
          style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "5px" }}
        >
          <h3>Informations de débogage</h3>
          <pre style={{ whiteSpace: "pre-wrap", overflow: "auto" }}>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default BusinessFormationAdd

