"use client"

import { useState, useEffect } from "react"
import { validateEstablishmentData } from "../../utils/validationUtils"
import { uploadImage, fixImageUrl } from "../../utils/fileUtils"
import { getConcours } from "../../services/api"
import "./select-fix.css"

const EstablishmentForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: null,
    website: "",
    country: "",
    contact: {
      address: "",
      phone: "",
      email: "",
    },
    socialMedia: [],
    concours: [],
  })
  const [errors, setErrors] = useState({})
  const [logoPreview, setLogoPreview] = useState("")
  const [logoError, setLogoError] = useState(false)
  const [availableConcours, setAvailableConcours] = useState([])
  const [isLogoLoading, setIsLogoLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      // Create a copy to avoid modifying the original data
      const formattedData = { ...initialData }

      // Ensure contact exists
      if (!formattedData.contact) {
        formattedData.contact = {
          address: "",
          phone: "",
          email: "",
        }
      }

      // Fix the logo URL if it exists
      if (formattedData.logo) {
        formattedData.logo = fixImageUrl(formattedData.logo)
        setLogoPreview(formattedData.logo)
        console.log("Setting logo preview to:", formattedData.logo)
      }

      setFormData(formattedData)
    }

    fetchConcours()
  }, [initialData])

  const fetchConcours = async () => {
    try {
      const response = await getConcours()
      setAvailableConcours(response.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des concours:", error)
      setAvailableConcours([])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleContactChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      contact: {
        ...prevState.contact,
        [name]: value,
      },
    }))
  }

  const handleSocialMediaChange = (index, field, value) => {
    const updatedSocialMedia = [...formData.socialMedia]
    updatedSocialMedia[index] = { ...updatedSocialMedia[index], [field]: value }
    setFormData((prevState) => ({
      ...prevState,
      socialMedia: updatedSocialMedia,
    }))
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        setIsLogoLoading(true)
        setLogoError(false)

        // Create a temporary preview URL
        const previewUrl = URL.createObjectURL(file)
        setLogoPreview(previewUrl)

        // Upload the file
        console.log("Uploading logo file:", file.name)
        const uploadedUrl = await uploadImage(file)
        console.log("Logo uploaded successfully, URL:", uploadedUrl)

        setFormData((prev) => ({ ...prev, logo: uploadedUrl }))

        // Clean up the temporary preview URL
        URL.revokeObjectURL(previewUrl)
        setLogoPreview(uploadedUrl)
      } catch (error) {
        console.error("Error uploading logo:", error)
        setErrors((prev) => ({ ...prev, logo: "Erreur lors du téléchargement du logo" }))
        setLogoError(true)
        setLogoPreview("/placeholder.svg")
      } finally {
        setIsLogoLoading(false)
      }
    }
  }

  const handleConcoursChange = (e) => {
    const selectedConcours = Array.from(e.target.selectedOptions, (option) => option.value)
    setFormData((prev) => ({
      ...prev,
      concours: selectedConcours,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateEstablishmentData(formData)
    if (Object.keys(validationErrors).length === 0) {
      try {
        // Ensure required fields are not empty
        if (!formData.name.trim() || !formData.description.trim() || !formData.country.trim()) {
          throw new Error("Les champs nom, description et pays sont obligatoires.")
        }

        // Ensure socialMedia is an array of objects
        const formDataToSubmit = {
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim(),
          country: formData.country.trim(),
          socialMedia: formData.socialMedia.filter((sm) => sm.platform && sm.url),
        }

        // Remove _id if this is a new establishment (to avoid duplicate key error)
        if (!initialData && formDataToSubmit._id) {
          delete formDataToSubmit._id
        }

        await onSubmit(formDataToSubmit)
      } catch (error) {
        console.error("Error submitting form:", error)
        setErrors({ submit: error.message || "Une erreur est survenue lors de la soumission du formulaire." })
      }
    } else {
      setErrors(validationErrors)
    }
  }

  const addSocialMedia = () => {
    setFormData((prevState) => ({
      ...prevState,
      socialMedia: [...prevState.socialMedia, { platform: "", url: "" }],
    }))
  }

  const removeSocialMedia = (index) => {
    const updatedSocialMedia = [...formData.socialMedia]
    updatedSocialMedia.splice(index, 1)
    setFormData((prevState) => ({
      ...prevState,
      socialMedia: updatedSocialMedia,
    }))
  }

  const handleImageError = (e) => {
    console.log("Image failed to load:", e.target.src)
    setLogoError(true)
    e.target.src = "/placeholder.svg"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nom de l'établissement *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
          Logo de l'établissement
        </label>
        <div className="mt-1 flex items-center">
          <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
            {isLogoLoading ? (
              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                <span className="text-xs text-gray-500">Chargement...</span>
              </div>
            ) : logoPreview && !logoError ? (
              <img
                src={logoPreview || "/placeholder.svg"}
                alt="Logo preview"
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </span>
          <button
            type="button"
            className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => document.getElementById("logo").click()}
            disabled={isLogoLoading}
          >
            {isLogoLoading ? "Chargement..." : "Changer"}
          </button>
          <input
            type="file"
            id="logo"
            name="logo"
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
            disabled={isLogoLoading}
          />
        </div>
        {errors.logo && <p className="mt-2 text-sm text-red-600">{errors.logo}</p>}
        {logoError && (
          <p className="mt-2 text-sm text-yellow-600">
            Impossible de charger l'image. Une image par défaut sera utilisée.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Site web
        </label>
        <input
          type="text"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.website && <p className="mt-2 text-sm text-red-600">{errors.website}</p>}
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
          Pays *
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.country && <p className="mt-2 text-sm text-red-600">{errors.country}</p>}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact</h3>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Adresse
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.contact.address}
            onChange={handleContactChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors["contact.address"] && <p className="mt-2 text-sm text-red-600">{errors["contact.address"]}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Téléphone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.contact.phone}
            onChange={handleContactChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors["contact.phone"] && <p className="mt-2 text-sm text-red-600">{errors["contact.phone"]}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.contact.email}
            onChange={handleContactChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors["contact.email"] && <p className="mt-2 text-sm text-red-600">{errors["contact.email"]}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Réseaux sociaux</h3>
        {formData.socialMedia.map((social, index) => (
          <div key={index} className="flex space-x-2">
            <input
              type="text"
              placeholder="Plateforme"
              value={social.platform}
              onChange={(e) => handleSocialMediaChange(index, "platform", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <input
              type="text"
              placeholder="URL"
              value={social.url}
              onChange={(e) => handleSocialMediaChange(index, "url", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => removeSocialMedia(index)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSocialMedia}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Ajouter un réseau social
        </button>
      </div>

      <div>
        <label htmlFor="concours" className="block text-sm font-medium text-gray-700">
          Concours
        </label>
        <select
          id="concours"
          name="concours"
          multiple
          style={{ color: "black" }}
          value={formData.concours}
          onChange={handleConcoursChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {availableConcours.map((concours) => (
            <option key={concours._id} value={concours._id}>
              {concours.title || concours.name}
            </option>
          ))}
        </select>
      </div>

      {errors.submit && <p className="mt-2 text-sm text-red-600">{errors.submit}</p>}

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialData ? "Mettre à jour" : "Créer l'établissement"}
        </button>
      </div>
    </form>
  )
}

export default EstablishmentForm

