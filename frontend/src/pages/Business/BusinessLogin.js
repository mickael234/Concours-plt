"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./BusinessLogin.css"
import axios from "axios"

const BusinessLogin = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginBusiness } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    // Check if there's a message from a redirect
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
    }
  }, [location])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email est invalide"
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateForm()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true)
      setDebugInfo(null)

      try {
        // Hardcoded API URL for testing
        const loginUrl = "http://localhost:5000/api/business/login"

        console.log("Sending login request to:", loginUrl)
        console.log("Login data:", { email: formData.email, password: "***" })

        const response = await axios.post(loginUrl, {
          email: formData.email,
          password: formData.password,
        })

        console.log("Login successful:", response.data)

        // Use the loginBusiness function from AuthContext
        await loginBusiness(response.data)

        // Set debug info
        setDebugInfo({
          status: "Success",
          message: "Login successful, attempting navigation...",
          data: {
            token: response.data.token ? "Token received" : "No token",
            user: response.data._id ? "User ID received" : "No user ID",
          },
        })

        // Add a small delay before navigation to ensure state updates
        setTimeout(() => {
          console.log("Navigating to dashboard...")
          navigate("/business/dashboard")
        }, 1000)
      } catch (error) {
        console.error("Login error:", error)

        let errorMessage = "Erreur lors de la connexion. Veuillez réessayer."

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = error.response.data.message || "Erreur lors de la connexion. Vérifiez vos identifiants."

          setDebugInfo({
            status: "Error",
            message: errorMessage,
            response: {
              status: error.response.status,
              data: error.response.data,
            },
          })
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = "Aucune réponse du serveur. Veuillez réessayer plus tard."

          setDebugInfo({
            status: "Error",
            message: errorMessage,
            error: "No response received",
          })
        } else {
          // Something happened in setting up the request that triggered an Error
          setDebugInfo({
            status: "Error",
            message: errorMessage,
            error: error.message,
          })
        }

        setErrors({ api: errorMessage })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Function to manually navigate to dashboard (for debugging)
  const goToDashboard = () => {
    console.log("Manual navigation to dashboard")
    navigate("/business/dashboard")
  }

  return (
    <div className="business-login-container">
      <div className="business-login-form-wrapper">
        <h1 className="business-login-title">Connexion Business</h1>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errors.api && <div className="error-message">{errors.api}</div>}

        <form onSubmit={handleSubmit} className="business-login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Connexion en cours..." : "Se connecter"}
            </button>
          </div>

          <div className="forgot-password">
            <a href="/business/reset-password">Mot de passe oublié?</a>
          </div>

          <div className="register-link">
            Vous n'avez pas de compte? <a href="/business/register">Créer un compte</a>
          </div>
        </form>

        {/* Debug section */}
        {debugInfo && (
          <div className="debug-section">
            <h3>Debug Information</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            <button
              onClick={goToDashboard}
              className="debug-button"
              style={{
                padding: "8px 16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Force Navigate to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessLogin

