"use client"

import { useState, useEffect } from "react"
import "./BusinessAbout.css"
import { getBusinessProfile, updateBusinessProfile } from "../../services/api"

const BusinessAbout = () => {
  const [formData, setFormData] = useState({
    structureName: "",
    logo: "",
    presentation: "",
    website: "",
    phone: "",
    email: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    socialMedia: {
      facebook: "",
      instagram: "",
      linkedin: "",
      whatsapp: "",
    },
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState("")

  const fetchBusinessProfile = async () => {
    try {
      setIsLoading(true)
      // Récupérer les données du serveur
      const profileData = await getBusinessProfile()

      // Mettre à jour le state avec les données du serveur
      setFormData({
        structureName: profileData.structureName || "",
        logo: profileData.logo || "",
        presentation: profileData.presentation || "",
        website: profileData.website || "",
        phone: profileData.phone || "",
        email: profileData.email || "",
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        birthDate: profileData.birthDate ? new Date(profileData.birthDate).toISOString().split("T")[0] : "",
        socialMedia: {
          facebook: profileData.socialMedia?.facebook || "",
          instagram: profileData.socialMedia?.instagram || "",
          linkedin: profileData.socialMedia?.linkedin || "",
          whatsapp: profileData.socialMedia?.whatsapp || "",
        },
      })

      // Sauvegarder également dans localStorage pour accès hors ligne
      localStorage.setItem("businessInfo", JSON.stringify(profileData))

      setError(null)
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error)
      setError("Impossible de charger les données du profil")

      // Fallback sur localStorage si le serveur n'est pas disponible
      try {
        const businessInfo = localStorage.getItem("businessInfo")
        if (businessInfo) {
          const parsedInfo = JSON.parse(businessInfo)
          setFormData({
            structureName: parsedInfo.structureName || "",
            logo: parsedInfo.logo || "",
            presentation: parsedInfo.presentation || "",
            website: parsedInfo.website || "",
            phone: parsedInfo.phone || "",
            email: parsedInfo.email || "",
            firstName: parsedInfo.firstName || "",
            lastName: parsedInfo.lastName || "",
            birthDate: parsedInfo.birthDate ? new Date(parsedInfo.birthDate).toISOString().split("T")[0] : "",
            socialMedia: {
              facebook: parsedInfo.socialMedia?.facebook || "",
              instagram: parsedInfo.socialMedia?.instagram || "",
              linkedin: parsedInfo.socialMedia?.linkedin || "",
              whatsapp: parsedInfo.socialMedia?.whatsapp || "",
            },
          })
        }
      } catch (localError) {
        console.error("Erreur lors de la récupération des données locales:", localError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinessProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      socialMedia: {
        ...formData.socialMedia,
        [name]: value,
      },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Créer une copie des données pour éviter de modifier l'état directement
      const dataToSubmit = { ...formData }

      // Supprimer les champs vides ou undefined
      Object.keys(dataToSubmit).forEach((key) => {
        if (dataToSubmit[key] === "" || dataToSubmit[key] === undefined || dataToSubmit[key] === null) {
          delete dataToSubmit[key]
        }
      })

      console.log("Données à soumettre:", dataToSubmit)

      // Envoyer uniquement les données qui ont été modifiées
      await updateBusinessProfile(dataToSubmit)

      setSuccess("Profil mis à jour avec succès!")

      // Recharger les données après la mise à jour
      fetchBusinessProfile()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      setError(error.message || "Une erreur est survenue lors de la mise à jour du profil")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          logo: reader.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return <div className="loading-container">Chargement des données...</div>
  }

  return (
    <div className="business-about-container">
      <h2 className="section-title">À propos de votre structure</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!isEditing ? (
        <div className="about-display">
          <div className="about-header">
            <div className="logo-container">
              {formData.logo ? (
                <img src={formData.logo || "/placeholder.svg"} alt="Logo" className="business-logo" />
              ) : (
                <div className="logo-placeholder">{formData.structureName.charAt(0) || "?"}</div>
              )}
            </div>

            <div className="business-info">
              <h3 className="business-name">{formData.structureName || "Nom de votre structure"}</h3>
              {formData.website && (
                <a
                  href={formData.website.startsWith("http") ? formData.website : `https://${formData.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="business-website"
                >
                  {formData.website}
                </a>
              )}
            </div>

            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              Modifier
            </button>
          </div>

          <div className="about-section">
            <h4 className="section-subtitle">Présentation</h4>
            {formData.presentation ? (
              <p className="presentation-text">{formData.presentation}</p>
            ) : (
              <p className="empty-text">Aucune présentation disponible</p>
            )}
          </div>

          <div className="about-section">
            <h4 className="section-subtitle">Informations personnelles</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">👤</span>
                <span className="contact-label">Prénom:</span>
                <span className="contact-value">{formData.firstName || "Non renseigné"}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">👤</span>
                <span className="contact-label">Nom:</span>
                <span className="contact-value">{formData.lastName || "Non renseigné"}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🎂</span>
                <span className="contact-label">Date de naissance:</span>
                <span className="contact-value">{formData.birthDate || "Non renseigné"}</span>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h4 className="section-subtitle">Contacts</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">🌐</span>
                <span className="contact-label">Site web:</span>
                <span className="contact-value">
                  {formData.website ? (
                    <a
                      href={formData.website.startsWith("http") ? formData.website : `https://${formData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formData.website}
                    </a>
                  ) : (
                    "Aucun site"
                  )}
                </span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span className="contact-label">Email:</span>
                <span className="contact-value">{formData.email || "Non renseigné"}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span className="contact-label">Téléphone:</span>
                <span className="contact-value">{formData.phone || "Non renseigné"}</span>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h4 className="section-subtitle">Réseaux sociaux</h4>
            <div className="social-links">
              <div className="social-item">
                <span className="social-icon">📱</span>
                <span className="social-label">WhatsApp:</span>
                <span className="social-value">{formData.socialMedia.whatsapp || "Aucune compte WhatsApp"}</span>
              </div>
              <div className="social-item">
                <span className="social-icon">🔗</span>
                <span className="social-label">LinkedIn:</span>
                <span className="social-value">
                  {formData.socialMedia.linkedin ? (
                    <a
                      href={`https://linkedin.com/in/${formData.socialMedia.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formData.socialMedia.linkedin}
                    </a>
                  ) : (
                    "Aucune page LinkedIn"
                  )}
                </span>
              </div>
              <div className="social-item">
                <span className="social-icon">👍</span>
                <span className="social-label">Facebook:</span>
                <span className="social-value">
                  {formData.socialMedia.facebook ? (
                    <a
                      href={`https://facebook.com/${formData.socialMedia.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formData.socialMedia.facebook}
                    </a>
                  ) : (
                    "Aucune page Facebook"
                  )}
                </span>
              </div>
              <div className="social-item">
                <span className="social-icon">📸</span>
                <span className="social-label">Instagram:</span>
                <span className="social-value">
                  {formData.socialMedia.instagram ? (
                    <a
                      href={`https://instagram.com/${formData.socialMedia.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formData.socialMedia.instagram}
                    </a>
                  ) : (
                    "Aucune page Instagram"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="about-form">
          <div className="form-section">
            <h4 className="section-subtitle">Informations générales</h4>

            <div className="form-group">
              <label htmlFor="structureName">Nom de la structure</label>
              <input
                type="text"
                id="structureName"
                name="structureName"
                value={formData.structureName}
                onChange={handleChange}
                placeholder="Nom de votre structure"
              />
            </div>

            <div className="form-group">
              <label htmlFor="logo">Logo</label>
              <div className="logo-upload">
                {formData.logo && <img src={formData.logo || "/placeholder.svg"} alt="Logo" className="logo-preview" />}
                <input type="file" id="logo" accept="image/*" onChange={handleLogoChange} />
                <p className="file-hint">Format recommandé: JPG, PNG (max 2MB)</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="website">Site web</label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="www.votresite.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+225 07 00 00 00 00"
              />
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-subtitle">Informations personnelles</h4>

            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Votre prénom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Votre nom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">Date de naissance</label>
              <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} />
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-subtitle">Présentation</h4>
            <div className="form-group">
              <textarea
                id="presentation"
                name="presentation"
                value={formData.presentation}
                onChange={handleChange}
                rows="5"
                placeholder="Décrivez votre structure..."
              ></textarea>
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-subtitle">Réseaux sociaux</h4>

            <div className="form-group">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                type="text"
                id="whatsapp"
                name="whatsapp"
                value={formData.socialMedia.whatsapp}
                onChange={handleSocialMediaChange}
                placeholder="+225 07 00 00 00 00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="facebook">Facebook</label>
              <input
                type="text"
                id="facebook"
                name="facebook"
                value={formData.socialMedia.facebook}
                onChange={handleSocialMediaChange}
                placeholder="Nom d'utilisateur Facebook"
              />
            </div>

            <div className="form-group">
              <label htmlFor="instagram">Instagram</label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.socialMedia.instagram}
                onChange={handleSocialMediaChange}
                placeholder="Nom d'utilisateur Instagram"
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedin">LinkedIn</label>
              <input
                type="text"
                id="linkedin"
                name="linkedin"
                value={formData.socialMedia.linkedin}
                onChange={handleSocialMediaChange}
                placeholder="Nom d'utilisateur LinkedIn"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
              Annuler
            </button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default BusinessAbout

