"use client"

import { useState, useEffect } from "react"
import { getUserProfile, updateUserProfile, updateUserPassword } from "../../services/api"
import { Eye, EyeOff, Lock, User, Save } from "lucide-react"
import "./UserSettings.css"

const UserSettings = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")

  // État pour afficher/masquer les mots de passe
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const userData = await getUserProfile()

        if (userData) {
          setProfileForm({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            city: userData.city || "",
            country: userData.country || "",
          })
        }

        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement du profil:", err)
        setError("Impossible de charger vos données. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm({
      ...profileForm,
      [name]: value,
    })
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await updateUserProfile(profileForm)

      setSuccess("Profil mis à jour avec succès")
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err)
      setError("Impossible de mettre à jour votre profil. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await updateUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setSuccess("Mot de passe mis à jour avec succès")
    } catch (err) {
      console.error("Erreur lors de la mise à jour du mot de passe:", err)
      setError("Impossible de mettre à jour votre mot de passe. Veuillez vérifier votre mot de passe actuel.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profileForm.email) {
    return <div className="loading-state">Chargement de vos paramètres...</div>
  }

  return (
    <div className="user-settings-container">
      <div className="settings-header">
        <h1>Paramètres</h1>
        <p>Gérez vos informations personnelles et vos préférences</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <User size={18} />
          <span>Profil</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          <Lock size={18} />
          <span>Mot de passe</span>
        </button>
      </div>

      <div className="settings-content">
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                  placeholder="Votre prénom"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                placeholder="Votre email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                placeholder="Votre numéro de téléphone"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Adresse</label>
              <input
                type="text"
                id="address"
                name="address"
                value={profileForm.address}
                onChange={handleProfileChange}
                placeholder="Votre adresse"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Ville</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={profileForm.city}
                  onChange={handleProfileChange}
                  placeholder="Votre ville"
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Pays</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={profileForm.country}
                  onChange={handleProfileChange}
                  placeholder="Votre pays"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                <Save size={18} />
                <span>{loading ? "Enregistrement..." : "Enregistrer les modifications"}</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="form-group password-input-group">
              <label htmlFor="currentPassword">Mot de passe actuel</label>
              <div className="password-input-container">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Votre mot de passe actuel"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group password-input-group">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <div className="password-input-container">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Votre nouveau mot de passe"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group password-input-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                <Save size={18} />
                <span>{loading ? "Enregistrement..." : "Mettre à jour le mot de passe"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default UserSettings
