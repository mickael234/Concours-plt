"use client"

import { useState, useEffect } from "react"
import { Upload } from "lucide-react"
import { validateConcoursData } from "../../utils/validation"
import { getAllResources } from "../../services/api"

const initialFormData = {
  title: "",
  organizerName: "",
  organizerLogo: null,
  description: "",
  category: "",
  status: "a_venir",
  dateStart: "",
  dateEnd: "",
  registrationLink: "",
  conditions: [""],
  requiredDocuments: [""],
  steps: [{ title: "", date: "", description: "" }],
  documents: [],
  year: new Date().getFullYear(),
}

const ConcoursForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [logoPreview, setLogoPreview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resources, setResources] = useState([])
  const [selectedResources, setSelectedResources] = useState([])
  const [isLoadingResources, setIsLoadingResources] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialFormData,
        ...initialData,
        dateStart: initialData.dateStart ? new Date(initialData.dateStart).toISOString().split("T")[0] : "",
        dateEnd: initialData.dateEnd ? new Date(initialData.dateEnd).toISOString().split("T")[0] : "",
      })
      setLogoPreview(initialData.organizerLogo || "")
    }
  }, [initialData])

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoadingResources(true)
      try {
        const response = await getAllResources()
        console.log("Resources response:", response)
        // Vérifier si les données sont dans la propriété data ou directement dans la réponse
        const resourcesData = response.data || response || []
        setResources(resourcesData)
      } catch (error) {
        console.error("Error fetching resources:", error)
        // En cas d'erreur, définir un tableau vide pour éviter les erreurs
        setResources([])
      } finally {
        setIsLoadingResources(false)
      }
    }

    fetchResources()
  }, [])

  const handleInputChange = (e, index, field, subfield) => {
    const { name, value, type } = e.target
    setFormData((prev) => {
      const newData = { ...prev }
      if (field) {
        if (subfield) {
          newData[field][index][subfield] = value
        } else {
          newData[field][index] = value
        }
      } else if (type === "date") {
        newData[name] = new Date(value).toISOString().split("T")[0]
      } else {
        newData[name] = value
      }
      return newData
    })
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
        setFormData((prev) => ({ ...prev, organizerLogo: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const addArrayField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        field === "steps"
          ? { title: "", date: "", description: "" }
          : field === "documents"
            ? { title: "", type: "", thumbnail: "", rating: 0, reviewCount: 0, price: 0 }
            : "",
      ],
    }))
  }

  const removeArrayField = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleResourceSelection = (resourceId) => {
    setSelectedResources((prev) => {
      // If already selected, remove it
      if (prev.includes(resourceId)) {
        return prev.filter((id) => id !== resourceId)
      }
      // Otherwise add it
      return [...prev, resourceId]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateConcoursData(formData)
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true)
      try {
        // Add selected resources to the form data
        const dataToSubmit = {
          ...formData,
          resources: selectedResources,
        }
        await onSubmit(dataToSubmit)
        setFormData(initialFormData)
        setSelectedResources([])
        setErrors({})
      } catch (error) {
        console.error("Error submitting form:", error)
        setErrors({ submit: "Une erreur est survenue lors de la soumission du formulaire." })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setErrors(validationErrors)
      const firstErrorField = Object.keys(validationErrors)[0]
      const errorElement = document.getElementById(firstErrorField)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  const handleDocumentAdd = (e) => {
    e.preventDefault()
    const newDocument = {
      title: "",
      type: "",
      url: "",
      description: "",
    }
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, newDocument],
    }))
  }

  const handleDocumentChange = (index, field, value) => {
    setFormData((prev) => {
      const newDocuments = [...prev.documents]
      newDocuments[index] = { ...newDocuments[index], [field]: value }
      return { ...prev, documents: newDocuments }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 p-6 bg-white shadow-md rounded-lg">
      {/* Basic Information */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Informations de base</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titre
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="organizerName" className="block text-sm font-medium text-gray-700">
              Nom de l'organisateur
            </label>
            <input
              id="organizerName"
              name="organizerName"
              type="text"
              value={formData.organizerName}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.organizerName && <p className="text-sm text-red-600">{errors.organizerName}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="organizerLogo" className="block text-sm font-medium text-gray-700">
            Logo de l'organisateur
          </label>
          <div className="mt-1 flex items-center">
            <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
              {logoPreview ? (
                <img
                  src={logoPreview || "/placeholder.svg"}
                  alt="Logo preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Upload className="h-full w-full text-gray-300" />
              )}
            </span>
            <button
              type="button"
              onClick={() => document.getElementById("file-upload").click()}
              className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Changer
            </button>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleLogoUpload}
              accept="image/*"
            />
          </div>
          {errors.organizerLogo && <p className="mt-2 text-sm text-red-600">{errors.organizerLogo}</p>}
        </div>
        {/* Other basic information fields */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Catégorie
          </label>
          <input
            id="category"
            name="category"
            type="text"
            value={formData.category}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Statut
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="a_venir">À venir</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
          {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
        </div>
      </div>

      {/* Dates and Registration */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Dates et inscription</h2>
        {/* Date and registration fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateStart" className="block text-sm font-medium text-gray-700">
              Date de début
            </label>
            <input
              id="dateStart"
              name="dateStart"
              type="date"
              value={formData.dateStart}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.dateStart && <p className="text-sm text-red-600">{errors.dateStart}</p>}
          </div>
          <div>
            <label htmlFor="dateEnd" className="block text-sm font-medium text-gray-700">
              Date de fin
            </label>
            <input
              id="dateEnd"
              name="dateEnd"
              type="date"
              value={formData.dateEnd}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.dateEnd && <p className="text-sm text-red-600">{errors.dateEnd}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="registrationLink" className="block text-sm font-medium text-gray-700">
            Lien d'inscription
          </label>
          <input
            id="registrationLink"
            name="registrationLink"
            type="text"
            value={formData.registrationLink}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          {errors.registrationLink && <p className="text-sm text-red-600">{errors.registrationLink}</p>}
        </div>
      </div>

      {/* Participation Conditions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Conditions de participation</h2>
        {/* Participation conditions fields */}
        {formData.conditions.map((condition, index) => (
          <div key={index} className="flex space-x-4">
            <input
              type="text"
              value={condition}
              onChange={(e) => handleInputChange(e, index, "conditions")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <button
              type="button"
              onClick={() => removeArrayField("conditions", index)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayField("conditions")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Ajouter une condition
        </button>
      </div>

      {/* Required Documents */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Documents requis</h2>
        {/* Required documents fields */}
        {formData.requiredDocuments.map((document, index) => (
          <div key={index} className="flex space-x-4">
            <input
              type="text"
              value={document}
              onChange={(e) => handleInputChange(e, index, "requiredDocuments")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <button
              type="button"
              onClick={() => removeArrayField("requiredDocuments", index)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayField("requiredDocuments")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Ajouter un document requis
        </button>
      </div>

      {/* Competition Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Étapes du concours</h2>
        {/* Competition steps fields */}
        {formData.steps.map((step, index) => (
          <div key={index} className="space-y-4 border p-4 rounded-md">
            <h3 className="text-lg font-medium">Étape {index + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`stepTitle-${index}`} className="block text-sm font-medium text-gray-700">
                  Titre de l'étape
                </label>
                <input
                  type="text"
                  id={`stepTitle-${index}`}
                  value={step.title}
                  onChange={(e) => handleInputChange(e, index, "steps", "title")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor={`stepDate-${index}`} className="block text-sm font-medium text-gray-700">
                  Date de l'étape
                </label>
                <input
                  type="date"
                  id={`stepDate-${index}`}
                  value={step.date}
                  onChange={(e) => handleInputChange(e, index, "steps", "date")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div>
              <label htmlFor={`stepDescription-${index}`} className="block text-sm font-medium text-gray-700">
                Description de l'étape
              </label>
              <textarea
                id={`stepDescription-${index}`}
                value={step.description}
                onChange={(e) => handleInputChange(e, index, "steps", "description")}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <button
              type="button"
              onClick={() => removeArrayField("steps", index)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Supprimer l'étape
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayField("steps")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Ajouter une étape
        </button>
      </div>

      {/* Documents and Training */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Documents et formations pour préparer ce concours</h2>
        {/* Documents and training fields */}
        {formData.documents.map((document, index) => (
          <div key={index} className="space-y-4 border p-4 rounded-md">
            <h3 className="text-lg font-medium">Document {index + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`documentTitle-${index}`} className="block text-sm font-medium text-gray-700">
                  Titre du document
                </label>
                <input
                  type="text"
                  id={`documentTitle-${index}`}
                  value={document.title}
                  onChange={(e) => handleDocumentChange(index, "title", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor={`documentType-${index}`} className="block text-sm font-medium text-gray-700">
                  Type de document
                </label>
                <input
                  type="text"
                  id={`documentType-${index}`}
                  value={document.type}
                  onChange={(e) => handleDocumentChange(index, "type", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div>
              <label htmlFor={`documentUrl-${index}`} className="block text-sm font-medium text-gray-700">
                URL du document
              </label>
              <input
                type="text"
                id={`documentUrl-${index}`}
                value={document.url}
                onChange={(e) => handleDocumentChange(index, "url", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor={`documentDescription-${index}`} className="block text-sm font-medium text-gray-700">
                Description du document
              </label>
              <textarea
                id={`documentDescription-${index}`}
                value={document.description}
                onChange={(e) => handleDocumentChange(index, "description", e.target.value)}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <button
              type="button"
              onClick={() => removeArrayField("documents", index)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Supprimer le document
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleDocumentAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Ajouter un document
        </button>
      </div>

      {/* Resources Selection */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Ressources existantes</h2>
        <p className="text-sm text-gray-600">Sélectionnez les ressources existantes à associer à ce concours</p>

        {isLoadingResources ? (
          <div className="text-center py-4">Chargement des ressources...</div>
        ) : resources.length === 0 ? (
          <div className="text-center py-4">
            Aucune ressource disponible.
            <span className="block mt-2 text-sm text-gray-500">
              (Vérifiez que l'API /api/resources/all fonctionne correctement)
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {resources.map((resource) => (
              <div
                key={resource._id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedResources.includes(resource._id) ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                }`}
                onClick={() => handleResourceSelection(resource._id)}
              >
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedResources.includes(resource._id)}
                    onChange={() => {}}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <h3 className="font-medium">{resource.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{resource.type}</p>
                    {resource.description && <p className="text-sm mt-2 line-clamp-2">{resource.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form submission */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Envoi en cours..." : initialData ? "Mettre à jour" : "Ajouter"}
        </button>
      </div>
    </form>
  )
}

export default ConcoursForm

