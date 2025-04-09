"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getFormationById, registerForFormationUser as registerForFormation } from "../services/api"
import "./FormationRegister.css"

const FormationRegister = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formation, setFormation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    comments: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const data = await getFormationById(id)
        setFormation(data)
      } catch (err) {
        console.error("Erreur lors du chargement de la formation:", err)
        setError("Impossible de charger les détails de la formation.")
      } finally {
        setLoading(false)
      }
    }

    fetchFormation()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Vérifier si l'utilisateur est connecté
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté pour vous inscrire à cette formation");
        return;
      }
      
      console.log("Données d'inscription:", formData);
      
      // Utiliser la fonction registerForFormation avec le bon endpoint
      const response = await registerForFormation(id, formData);
      
      setSuccess("Inscription réussie! Vous recevrez bientôt une confirmation.");
      console.log("Réponse d'inscription:", response);
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate("/user/formations");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setError(error.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="loading">Chargement des détails de la formation...</div>
  }

  if (error && !formation) {
    return <div className="error-message">{error}</div>
  }

  if (!formation) {
    return <div className="error-message">Formation non trouvée.</div>
  }

  return (
    <div className="formation-register-container">
      <h2>Inscription à la formation</h2>
      <div className="formation-info">
        <h3>{formation.title}</h3>
        <p className="formation-dates">
          Du {new Date(formation.startDate).toLocaleDateString()} au {new Date(formation.endDate).toLocaleDateString()}
        </p>
        <p className="formation-price">Prix: {formation.price} FCFA</p>
      </div>

      {success ? (
        <div className="success-message">
          <h3>Inscription réussie!</h3>
          <p>
            Votre inscription à la formation "{formation.title}" a été enregistrée avec succès. Vous allez être redirigé
            vers la page de la formation.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Prénom *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Nom *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Téléphone *</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="birthDate">Date de naissance *</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="comments">Commentaires (optionnel)</label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(`/formations/${id}`)}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default FormationRegister

