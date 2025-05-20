"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle } from "lucide-react"
import "./BusinessRegister.css"
import { validateBusinessRegistration } from "../../utils/validationUtils"

const BusinessRegister = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    structureName: "",
    activities: {
      organizeCompetitions: false,
      organizeCourses: false,
      sellDocuments: false,
      manageReviews: false,
    },
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    phoneCode: "+225",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox" && name.startsWith("activities.")) {
      const activityName = name.split(".")[1]
      setFormData({
        ...formData,
        activities: {
          ...formData.activities,
          [activityName]: checked,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    const validationErrors = validateBusinessRegistration(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true)

      try {
        // Hardcoded API URL for testing
        const registerUrl = "http://localhost:5000/api/business/register"

        console.log("Sending registration request to:", registerUrl)

        // Convert activities object to array format expected by backend
        const activitiesArray = []
        if (formData.activities.organizeCompetitions) activitiesArray.push("organizeCompetitions")
        if (formData.activities.organizeCourses) activitiesArray.push("organizeCourses")
        if (formData.activities.sellDocuments) activitiesArray.push("sellDocuments")
        if (formData.activities.manageReviews) activitiesArray.push("manageReviews")

        // Prepare the request data
        const requestData = {
          structureName: formData.structureName,
          activities: activitiesArray,
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: formData.birthDate,
          email: formData.email,
          phone: `${formData.phoneCode}${formData.phoneNumber.replace(/\s/g, "")}`,
          password: formData.password,
        }

        console.log("Sending registration data:", requestData)
        setDebugInfo(requestData)

        // Make the API request
        const apiResponse = await fetch(registerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        })

        console.log("Response status:", apiResponse.status)

        // Get the response data
        let responseData
        try {
          responseData = await apiResponse.json()
          console.log("Response data:", responseData)
        } catch (error) {
          console.error("Error parsing response:", error)
          const textResponse = await apiResponse.text()
          console.error("Raw response:", textResponse)
          throw new Error("Erreur lors de la lecture de la réponse du serveur")
        }

        if (!apiResponse.ok) {
          throw new Error(responseData.message || "Erreur lors de l'inscription")
        }

        console.log("Registration successful:", responseData)

        // Redirection vers la page de connexion ou le tableau de bord
        navigate("/business/login", {
          state: {
            message: "Votre compte business a été créé avec succès. Veuillez vous connecter.",
          },
        })
      } catch (error) {
        console.error("Erreur lors de l'inscription:", error)
        setErrors({
          api: error.message || "Une erreur est survenue lors de l'inscription.",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Validation du mot de passe en temps réel
  const passwordStrength = {
    length: formData.password.length >= 8,
    hasDigit: /\d/.test(formData.password),
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasSpecial: /[^A-Za-z0-9]/.test(formData.password),
  }

  return (
    <div className="business-register-container">
      <div className="business-register-form-wrapper">
        <h1 className="business-register-title">Créer votre compte Business Concours CI</h1>

        {errors.api && <div className="error-message">{errors.api}</div>}

        {debugInfo && (
          <div className="debug-info">
            <h3>Debug Info (will be removed in production)</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        <form onSubmit={handleSubmit} className="business-register-form">
          <div className="form-section">
            <h2 className="section-title">Informations de la structure</h2>

            <div className="form-group">
              <label htmlFor="structureName">Nom de la structure</label>
              <input
                type="text"
                id="structureName"
                name="structureName"
                value={formData.structureName}
                onChange={handleChange}
                className={errors.structureName ? "error" : ""}
                required
              />
              {errors.structureName && <span className="error-text">{errors.structureName}</span>}
            </div>

            <div className="form-group">
              <label>Ce que vous comptez faire comme activité sur Concours CI:</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activities.organizeCompetitions"
                    checked={formData.activities.organizeCompetitions}
                    onChange={handleChange}
                  />
                  Organiser des concours
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activities.organizeCourses"
                    checked={formData.activities.organizeCourses}
                    onChange={handleChange}
                  />
                  Organiser des cours de préparation
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activities.sellDocuments"
                    checked={formData.activities.sellDocuments}
                    onChange={handleChange}
                  />
                  Vendre des documents
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activities.manageReviews"
                    checked={formData.activities.manageReviews}
                    onChange={handleChange}
                  />
                  Gérer les avis sur mon établissement
                </label>
              </div>
              {errors.activities && <span className="error-text">{errors.activities}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Informations personnelles</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "error" : ""}
                  required
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="firstName">Prénoms</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "error" : ""}
                  required
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">Date de naissance</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className={errors.birthDate ? "error" : ""}
                required
              />
              {errors.birthDate && <span className="error-text">{errors.birthDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                required
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Numéro</label>
              <div className="phone-input-group">
                <select
                  name="phoneCode"
                  value={formData.phoneCode}
                  onChange={handleChange}
                  className="phone-code-select"
                >
                  <option value="+225">+225</option>
                  <option value="+233">+233</option>
                  <option value="+234">+234</option>
                  <option value="+228">+228</option>
                  <option value="+229">+229</option>
                  <option value="+223">+223</option>
                </select>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="07 00 00 00 00"
                  className={`phone-number-input ${errors.phoneNumber ? "error" : ""}`}
                  required
                />
              </div>
              {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Définir un mot de passe</h2>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                required
              />

              <div className="password-requirements">
                <div className={`requirement ${passwordStrength.length ? "valid" : ""}`}>
                  <CheckCircle size={16} className="check-icon" />
                  <span>Au moins 8 caractères</span>
                </div>
                <div className={`requirement ${passwordStrength.hasDigit ? "valid" : ""}`}>
                  <CheckCircle size={16} className="check-icon" />
                  <span>Au moins un chiffre</span>
                </div>
                <div className={`requirement ${passwordStrength.hasUpper ? "valid" : ""}`}>
                  <CheckCircle size={16} className="check-icon" />
                  <span>Au moins une lettre majuscule</span>
                </div>
                <div className={`requirement ${passwordStrength.hasLower ? "valid" : ""}`}>
                  <CheckCircle size={16} className="check-icon" />
                  <span>Au moins une lettre minuscule</span>
                </div>
                <div className={`requirement ${passwordStrength.hasSpecial ? "valid" : ""}`}>
                  <CheckCircle size={16} className="check-icon" />
                  <span>Au moins un caractère spécial (@?#/-. etc.)</span>
                </div>
              </div>

              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmation du mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
                required
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Création en cours..." : "Créer mon compte Business"}
            </button>
          </div>

          <div className="login-link">
            Vous avez déjà un compte? <a href="/business/login">Se connecter</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BusinessRegister

