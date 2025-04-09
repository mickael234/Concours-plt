"use client"

import { useState, useEffect } from "react"
import { Edit } from "lucide-react"
import { getBusinessProfile, updateUserPassword } from "../../services/api"
import "./BusinessParametres.css"

const BusinessParametres = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    status: "Actif",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        // Appel API pour récupérer les données business
        const data = await getBusinessProfile()
        console.log("Données du profil business récupérées:", data)

        setUserData({
          structureName: data.structureName || data.name || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          birthDate: data.birthDate || "",
          status: data.isActive ? "Actif" : "Inactif",
        })
      } catch (error) {
        console.error("Erreur lors de la récupération des données business:", error)
        setError("Impossible de charger les données business. Veuillez réessayer.")

        // Fallback sur les données du localStorage
        getUserDataFromLocalStorage()
      } finally {
        setIsLoading(false)
      }
    }

    // Get user data from localStorage as fallback
    const getUserDataFromLocalStorage = () => {
      try {
        const businessInfo = localStorage.getItem("businessInfo")
        const businessToken = localStorage.getItem("businessToken")

        console.log("Business info in localStorage:", businessInfo)
        console.log("Business token exists:", !!businessToken)

        if (businessInfo) {
          const parsedInfo = JSON.parse(businessInfo)
          console.log("Parsed business info:", parsedInfo)

          setUserData({
            structureName: parsedInfo.structureName || parsedInfo.name || "",
            firstName: parsedInfo.firstName || "",
            lastName: parsedInfo.lastName || "",
            email: parsedInfo.email || "",
            birthDate: parsedInfo.birthDate || "",
            status: "Actif",
          })
        } else {
          // Try to get data from login response
          const loginResponse = localStorage.getItem("businessLoginResponse")
          if (loginResponse) {
            const parsedResponse = JSON.parse(loginResponse)
            console.log("Login response data:", parsedResponse)

            setUserData({
              structureName: parsedResponse.structureName || parsedResponse.name || "",
              firstName: parsedResponse.firstName || "",
              lastName: parsedResponse.lastName || "",
              email: parsedResponse.email || "",
              birthDate: parsedResponse.birthDate || "",
              status: "Actif",
            })
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données depuis localStorage:", error)
      }
      setIsLoading(false)
    }

    // Tenter d'abord de récupérer les données via l'API
    fetchBusinessData()
  }, [])

  const handleChangePassword = () => {
    setShowPasswordModal(true)
  }

  const handleCloseModal = () => {
    setShowPasswordModal(false)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setPasswordError("")
    setPasswordSuccess("")
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    try {
      // Appel API pour changer le mot de passe
      await updateUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      // Success message
      setPasswordSuccess("Mot de passe modifié avec succès")

      // Reset form after 2 seconds
      setTimeout(() => {
        handleCloseModal()
      }, 2000)
    } catch (error) {
      console.error("Erreur lors de la modification du mot de passe:", error)
      setPasswordError(error.response?.data?.message || "Erreur lors de la modification du mot de passe")
    }
  }

  if (isLoading) {
    return <div className="loading-container">Chargement des données...</div>
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  return (
    <div className="business-parametres">
      <div className="parametres-section">
        <h2>Informations générales</h2>
        <div className="info-card1">
          <div className="info-row">
            <div className="info-label">Structure:</div>
            <div className="info-value">{userData.structureName || "Non renseigné"}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Nom:</div>
            <div className="info-value">{userData.lastName || "Non renseigné"}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Prénoms:</div>
            <div className="info-value">{userData.firstName || "Non renseigné"}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Date de naissance:</div>
            <div className="info-value">
              {userData.birthDate ? new Date(userData.birthDate).toLocaleDateString("fr-FR") : "Non renseigné"}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Email:</div>
            <div className="info-value">{userData.email}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Statut:</div>
            <div className="info-value">{userData.status}</div>
          </div>
        </div>
      </div>

      <div className="parametres-section">
        <h2>Informations de connexion</h2>
        <div className="info-card">
          <div className="info-row">
            <div className="info-label">Login:</div>
            <div className="info-value">{userData.email}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Mot de passe:</div>
            <div className="info-value">********</div>
            <button className="edit-password-btn" onClick={handleChangePassword}>
              <Edit size={16} />
              <span>Modifier mon mot de passe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <h3>Modifier mon mot de passe</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Mot de passe actuel</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Nouveau mot de passe</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="save-btn">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessParametres

