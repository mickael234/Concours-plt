"use client"

import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import "./BusinessResetPassword.css"

const BusinessResetPassword = () => {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  // Check if we have a token in the URL (for direct reset links)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get("token")
    if (token) {
      setResetCode(token)
      setStep(2)
    }
  }, [location])

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email) {
      setError("Veuillez saisir votre adresse email")
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, you would call your API here
      // const response = await api.post('/auth/business/request-reset', { email })

      setSuccess("Un code de réinitialisation a été envoyé à votre adresse email")
      setTimeout(() => {
        setStep(2)
        setSuccess("")
      }, 2000)
    } catch (error) {
      setError("Une erreur est survenue. Veuillez réessayer.")
      console.error("Erreur lors de la demande de réinitialisation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!resetCode) {
      setError("Veuillez saisir le code de réinitialisation")
      return
    }

    if (!newPassword) {
      setError("Veuillez saisir un nouveau mot de passe")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, you would call your API here
      // const response = await api.post('/auth/business/reset-password', {
      //   email,
      //   resetCode,
      //   newPassword
      // })

      setSuccess("Votre mot de passe a été réinitialisé avec succès")
      setTimeout(() => {
        navigate("/business/login")
      }, 2000)
    } catch (error) {
      setError("Une erreur est survenue. Veuillez réessayer.")
      console.error("Erreur lors de la réinitialisation du mot de passe:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="business-reset-password-container">
      <div className="business-reset-password-card">
        <div className="business-reset-password-header">
          <h2>Réinitialisation du mot de passe</h2>
          <p>Compte Business</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {success && <div className="success-message">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestReset} className="business-reset-password-form">
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre adresse email"
                required
              />
            </div>

            <button type="submit" className="btn-reset-request" disabled={isLoading}>
              {isLoading ? "Envoi en cours..." : "Envoyer le code de réinitialisation"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="business-reset-password-form">
            <div className="form-group">
              <label htmlFor="resetCode">Code de réinitialisation</label>
              <input
                type="text"
                id="resetCode"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="Entrez le code reçu par email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Entrez votre nouveau mot de passe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                required
              />
            </div>

            <button type="submit" className="btn-reset-password" disabled={isLoading}>
              {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
            </button>
          </form>
        )}

        <div className="business-reset-password-footer">
          <Link to="/business/login" className="back-to-login">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BusinessResetPassword

