"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import {
  addUserEducation,
  addUserExperience,
  getUserProfile,
  deleteUserEducation,
  deleteUserExperience,
} from "../../services/api"
import "./UserProfile.css"

const UserProfile = () => {
  const [educations, setEducations] = useState([])
  const [experiences, setExperiences] = useState([])
  const [isAddEducationModalOpen, setIsAddEducationModalOpen] = useState(false)
  const [isAddExperienceModalOpen, setIsAddExperienceModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [educationForm, setEducationForm] = useState({
    title: "",
    school: "",
    status: "completed",
    startDate: "",
    endDate: "",
    type: "",
    level: "",
  })
  const [experienceForm, setExperienceForm] = useState({
    title: "",
    company: "",
    status: "completed",
    startDate: "",
    endDate: "",
    type: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const userData = await getUserProfile()

        if (userData) {
          setEducations(userData.education || [])
          setExperiences(userData.experience || [])
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

  const openAddEducationModal = () => {
    setIsAddEducationModalOpen(true)
  }

  const closeAddEducationModal = () => {
    setIsAddEducationModalOpen(false)
    setEducationForm({
      title: "",
      school: "",
      status: "completed",
      startDate: "",
      endDate: "",
      type: "",
      level: "",
    })
  }

  const openAddExperienceModal = () => {
    setIsAddExperienceModalOpen(true)
  }

  const closeAddExperienceModal = () => {
    setIsAddExperienceModalOpen(false)
    setExperienceForm({
      title: "",
      company: "",
      status: "completed",
      startDate: "",
      endDate: "",
      type: "",
    })
  }

  const handleEducationChange = (e) => {
    const { name, value } = e.target
    setEducationForm({
      ...educationForm,
      [name]: value,
    })
  }

  const handleExperienceChange = (e) => {
    const { name, value } = e.target
    setExperienceForm({
      ...experienceForm,
      [name]: value,
    })
  }

  const handleAddEducation = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const newEducation = await addUserEducation(educationForm)
  
      // Vérifier la structure de la réponse
      console.log("Réponse d'ajout d'éducation:", newEducation)
  
      // Mettre à jour l'état avec la nouvelle éducation
      if (newEducation) {
        // Si la réponse est un tableau, l'utiliser directement
        if (Array.isArray(newEducation)) {
          setEducations(newEducation)
        }
        // Si la réponse contient un champ education, l'utiliser
        else if (newEducation.education) {
          setEducations(newEducation.education)
        }
        // Sinon, ajouter la nouvelle éducation à la liste existante
        else {
          setEducations([...educations, newEducation])
        }
      }
  
      closeAddEducationModal()
    } catch (err) {
      console.error("Erreur lors de l'ajout de la formation:", err)
      setError("Impossible d'ajouter la formation. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddExperience = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const newExperience = await addUserExperience(experienceForm)
  
      // Vérifier la structure de la réponse
      console.log("Réponse d'ajout d'expérience:", newExperience)
  
      // Mettre à jour l'état avec la nouvelle expérience
      if (newExperience) {
        // Si la réponse est un tableau, l'utiliser directement
        if (Array.isArray(newExperience)) {
          setExperiences(newExperience)
        }
        // Si la réponse contient un champ experience, l'utiliser
        else if (newExperience.experience) {
          setExperiences(newExperience.experience)
        }
        // Sinon, ajouter la nouvelle expérience à la liste existante
        else {
          setExperiences([...experiences, newExperience])
        }
      }
  
      closeAddExperienceModal()
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'expérience:", err)
      setError("Impossible d'ajouter l'expérience. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteEducation = async (educationId) => {
    try {
      setLoading(true)
      await deleteUserEducation(educationId)
      setEducations(educations.filter((edu) => edu._id !== educationId))
    } catch (err) {
      console.error("Erreur lors de la suppression de la formation:", err)
      setError("Impossible de supprimer la formation. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExperience = async (experienceId) => {
    try {
      setLoading(true)
      await deleteUserExperience(experienceId)
      setExperiences(experiences.filter((exp) => exp._id !== experienceId))
    } catch (err) {
      console.error("Erreur lors de la suppression de l'expérience:", err)
      setError("Impossible de supprimer l'expérience. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !educations.length && !experiences.length) {
    return <div className="loading-state">Chargement de votre profil...</div>
  }

  return (
    <div className="user-profile-container">
      {error && <div className="error-message">{error}</div>}

      <div className="profile-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">&#9662;</span> Mon parcours scolaire
          </h2>
          <button className="add-btn" onClick={openAddEducationModal}>
            <Plus size={20} />
          </button>
        </div>

        {educations.length === 0 ? (
          <div className="empty-section">
            <p className="empty-text">Aucune formation ajoutée</p>
            <button className="add-item-btn" onClick={openAddEducationModal}>
              <Plus size={20} />
              <span>Ajouter une formation</span>
            </button>
          </div>
        ) : (
          <div className="items-list">
            {educations.map((education) => (
              <div key={education._id} className="item-card">
                <div className="item-header">
                  <h3>{education.title}</h3>
                  <span className={`item-status ${education.status === "completed" ? "completed" : "ongoing"}`}>
                    {education.status === "completed" ? "Terminée" : "En cours"}
                  </span>
                </div>
                <div className="item-details">
                  <p className="item-location">{education.school}</p>
                  <p className="item-period">
                    {education.startDate} - {education.status === "completed" ? education.endDate : "Présent"}
                  </p>
                  <div className="item-tags">
                    <span className="item-tag">{education.type}</span>
                    <span className="item-tag">{education.level}</span>
                  </div>
                </div>
                <button
                  className="delete-btn12"
                  onClick={() => handleDeleteEducation(education._id)}
                  aria-label="Supprimer cette formation"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="profile-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">&#9662;</span> Expériences Professionnelles
          </h2>
          <button className="add-btn" onClick={openAddExperienceModal}>
            <Plus size={20} />
          </button>
        </div>

        {experiences.length === 0 ? (
          <div className="empty-section">
            <p className="empty-text">Aucune expérience</p>
            <button className="add-item-btn" onClick={openAddExperienceModal}>
              <Plus size={20} />
              <span>Ajouter une expérience</span>
            </button>
          </div>
        ) : (
          <div className="items-list">
            {experiences.map((experience) => (
              <div key={experience._id} className="item-card">
                <div className="item-header">
                  <h3>{experience.title}</h3>
                  <span className={`item-status ${experience.status === "completed" ? "completed" : "ongoing"}`}>
                    {experience.status === "completed" ? "Terminée" : "En cours"}
                  </span>
                </div>
                <div className="item-details">
                  <p className="item-location">{experience.company}</p>
                  <p className="item-period">
                    {experience.startDate} - {experience.status === "completed" ? experience.endDate : "Présent"}
                  </p>
                  <div className="item-tags">
                    <span className="item-tag">{experience.type}</span>
                  </div>
                </div>
                <button
                  className="delete-btn12"
                  onClick={() => handleDeleteExperience(experience._id)}
                  aria-label="Supprimer cette expérience"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddEducationModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Ajouter une formation</h2>
              <button className="close-modal-btn" onClick={closeAddEducationModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddEducation} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Intitulé de la formation</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Formation"
                  value={educationForm.title}
                  onChange={handleEducationChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="school">Ecole/université</label>
                <input
                  type="text"
                  id="school"
                  name="school"
                  placeholder="Ecole/Université"
                  value={educationForm.school}
                  onChange={handleEducationChange}
                  required
                />
              </div>
              <div className="form-group radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="education-completed"
                    name="status"
                    value="completed"
                    checked={educationForm.status === "completed"}
                    onChange={handleEducationChange}
                  />
                  <label htmlFor="education-completed">Terminée</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="education-ongoing"
                    name="status"
                    value="ongoing"
                    checked={educationForm.status === "ongoing"}
                    onChange={handleEducationChange}
                  />
                  <label htmlFor="education-ongoing">En cours</label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Date de début</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={educationForm.startDate}
                    onChange={handleEducationChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">Date de fin</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={educationForm.endDate}
                    onChange={handleEducationChange}
                    required={educationForm.status === "completed"}
                    disabled={educationForm.status === "ongoing"}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select id="type" name="type" value={educationForm.type} onChange={handleEducationChange} required>
                  <option value="">Sélectionner...</option>
                  <option value="Formation diplômante">Formation diplômante</option>
                  <option value="Formation certifiante">Formation certifiante</option>
                  <option value="Formation continue">Formation continue</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="level">Niveau</label>
                <select id="level" name="level" value={educationForm.level} onChange={handleEducationChange} required>
                  <option value="">Sélectionner...</option>
                  <option value="BAC/BT">BAC/BT</option>
                  <option value="BAC+2">BAC+2</option>
                  <option value="BAC+3">BAC+3</option>
                  <option value="BAC+5">BAC+5</option>
                  <option value="BAC+8">BAC+8</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddExperienceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Ajouter une expérience</h2>
              <button className="close-modal-btn" onClick={closeAddExperienceModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddExperience} className="modal-form">
              <div className="form-group">
                <label htmlFor="exp-title">Intitulé du poste</label>
                <input
                  type="text"
                  id="exp-title"
                  name="title"
                  placeholder="Poste occupé"
                  value={experienceForm.title}
                  onChange={handleExperienceChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="company">Entreprise</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  placeholder="Entreprise"
                  value={experienceForm.company}
                  onChange={handleExperienceChange}
                  required
                />
              </div>
              <div className="form-group radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="experience-completed"
                    name="status"
                    value="completed"
                    checked={experienceForm.status === "completed"}
                    onChange={handleExperienceChange}
                  />
                  <label htmlFor="experience-completed">Terminée</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="experience-ongoing"
                    name="status"
                    value="ongoing"
                    checked={experienceForm.status === "ongoing"}
                    onChange={handleExperienceChange}
                  />
                  <label htmlFor="experience-ongoing">En cours</label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="exp-startDate">Date de début</label>
                  <input
                    type="date"
                    id="exp-startDate"
                    name="startDate"
                    value={experienceForm.startDate}
                    onChange={handleExperienceChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="exp-endDate">Date de fin</label>
                  <input
                    type="date"
                    id="exp-endDate"
                    name="endDate"
                    value={experienceForm.endDate}
                    onChange={handleExperienceChange}
                    required={experienceForm.status === "completed"}
                    disabled={experienceForm.status === "ongoing"}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="exp-type">Type</label>
                <select
                  id="exp-type"
                  name="type"
                  value={experienceForm.type}
                  onChange={handleExperienceChange}
                  required
                >
                  <option value="">Type de contrat</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Alternance">Alternance</option>
                  <option value="Indépendant">Indépendant</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Bénévolat">Bénévolat</option>
                  <option value="Intérim">Intérim</option>
                  <option value="Autres">Autres</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile

