"use client"

import { useState, useEffect } from "react"
import { getResources, getFormations } from "../services/api"
import { Link } from "react-router-dom"
import "./Boutique.css"

const Boutique = () => {
  const [activeTab, setActiveTab] = useState("exams")
  const [resources, setResources] = useState([])
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les ressources
        const resourcesResponse = await getResources()
        console.log("Resources response:", resourcesResponse)
        const resourcesData = Array.isArray(resourcesResponse) ? resourcesResponse : resourcesResponse.data
        setResources(resourcesData || [])

        // Charger les formations
        try {
          const formationsData = await getFormations()
          console.log("Formations response:", formationsData)
          setFormations(formationsData || [])
        } catch (formationErr) {
          console.error("Erreur lors du chargement des formations:", formationErr)
          // Ne pas échouer complètement si les formations ne se chargent pas
          setFormations([])
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Erreur lors du chargement des données: " + err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="loading-container">Chargement des ressources...</div>
  if (error) return <div className="error-container">{error}</div>

  // Make sure resources is an array before filtering
  const resourcesArray = Array.isArray(resources) ? resources : []
  const formationsArray = Array.isArray(formations) ? formations : []

  const exams = resourcesArray.filter((resource) => resource.type === "past_paper")
  const courses = [...resourcesArray.filter((resource) => resource.type === "course"), ...formationsArray]

  return (
    <div className="boutique">
      <div className="boutique-header">
        <h1>Boutique</h1>
        <div className="boutique-tabs">
          <button
            className={`tab-button ${activeTab === "exams" ? "active" : ""}`}
            onClick={() => setActiveTab("exams")}
          >
            Anciens sujets
          </button>
          <button
            className={`tab-button ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            Formations
          </button>
        </div>
      </div>

      <div className="boutique-content">
        {activeTab === "exams" ? (
          <div className="exams-grid">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <div key={exam._id} className="exam-item">
                  <div className="exam-header">
                    <h3>{exam.title}</h3>
                    <span className="exam-type">Sujet + Corrigé</span>
                  </div>
                  <div className="exam-info">
                    <p>Session: {exam.year || "Non spécifié"}</p>
                    <p>Matière: {exam.subject || "Non spécifié"}</p>
                  </div>
                  <div className="exam-footer">
                    <span className="price">{exam.price ? `${exam.price} FCFA` : "Gratuit"}</span>
                    <button className="btn-download" onClick={() => window.open(exam.fileUrl, "_blank")}>
                      Télécharger
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items">Aucun ancien sujet disponible pour le moment.</div>
            )}
          </div>
        ) : (
          <div className="courses-grid">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id} className="course-item">
                  <img
                    src={course.imageUrl || "/placeholder.svg?height=200&width=300"}
                    alt={course.title}
                    className="course-thumbnail"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=200&width=300"
                    }}
                  />
                  <div className="course-content">
                    <h3>{course.title}</h3>
                    <p>{course.description || "Aucune description disponible."}</p>
                    <div className="course-meta">
                      <span>{course.duration || "0"} heures de cours</span>
                      <span>•</span>
                      <span>{course.exerciseCount || "0"} exercices</span>
                    </div>
                    <div className="course-footer">
                      <span className="price">{course.price ? `${course.price} FCFA` : "Gratuit"}</span>
                      {course.fileUrl ? (
                        <button className="btn-access" onClick={() => window.open(course.fileUrl, "_blank")}>
                          Accéder
                        </button>
                      ) : (
                        <Link to={`/formations/${course._id}`} className="btn-access">
                          Voir détails
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items">Aucune formation disponible pour le moment.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Boutique

