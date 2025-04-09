"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { getFormationById, updateFormation, getConcours } from "../../services/api"
import "./BusinessFormationAdd.css" // Réutiliser le même CSS

const BusinessFormationEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    concours: [],
    type: "online",
    places: "",
    image: null,
    hasMultipleMonths: false,
    price: "",
    startDate: "",
    endDate: "",
    level: "debutant",
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
  const [loading, setLoading] = useState(true)

  // Types de formation disponibles
  const formationTypes = [
    { id: "online", name: "Formation en ligne" },
    { id: "inperson", name: "Formation en présentiel" },
    { id: "hybrid", name: "Formation en ligne et en présentiel" },
  ]

  // Niveaux de formation disponibles
  const formationLevels = [
    { id: "debutant", name: "Débutant" },
    { id: "intermediaire", name: "Intermédiaire" },
    { id: "avance", name: "Avancé" },
  ]

  useEffect(() => {
    // Charger les détails de la formation
    const fetchFormation = async () => {
      try {
        const formation = await getFormationById(id)

        // Formater les dates pour l'input date
        const formatDate = (dateString) => {
          const date = new Date(dateString)
          return date.toISOString().split("T")[0]
        }

        setFormData({
          ...formation,
          startDate: formatDate(formation.startDate),
          endDate: formatDate(formation.endDate),
          concours: Array.isArray(formation.concours)
            ? formation.concours.map((c) => (typeof c === "object" ? c._id : c))
            : [],
        })

        if (formation.imageUrl) {
          setImagePreview(formation.imageUrl)
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la formation:", error)
        setError("Impossible de charger les détails de la formation.")
      } finally {
        setLoading(false)
      }
    }

    // Charger la liste des concours
    const fetchConcours = async () => {
      setIsLoadingConcours(true)
      try {
        const response = await getConcours()

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

    fetchFormation()
    fetchConcours()
  }, [id])

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
      // Vérifier si le token est présent
      const token = localStorage.getItem("businessToken")
      if (!token) {
        setError("Vous devez être connecté pour effectuer cette action")
        setIsSubmitting(false)
        return
      }

      // Appel API pour mettre à jour la formation
      await updateFormation(id, formData)

      // Afficher le message de succès
      setSuccess("Formation mise à jour avec succès!")

      // Rediriger vers la liste des formations après 2 secondes
      setTimeout(() => {
        navigate("/business/dashboard/formations")
      }, 2000)
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la formation:", error)
      setError(error.message || "Une erreur est survenue lors de la mise à jour de la formation")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Déterminer quels champs conditionnels afficher en fonction du type de formation
  const showOnlinePlatformField = formData.type === "online" || formData.type === "hybrid"
  const showLocationField = formData.type === "inperson" || formData.type === "hybrid"

  if (loading) {
    return <div className="loading">Chargement des détails de la formation...</div>
  }

  return (
    <div className="formation-add-container">
      <div className="formation-add-header">
        <button className="back-button" onClick={() => navigate("/business/dashboard/formations")}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <h2 className="page-title">Modifier la formation</h2>
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
        {/* Le reste du formulaire reste identique à BusinessFormationAdd */}
        {/* ... */}

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

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/business/dashboard/formations")}>
            Annuler
          </button>
          <button type="submit" className="btn-save" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Mettre à jour"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BusinessFormationEdit

