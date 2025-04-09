"use client"

import { useState, useEffect } from "react"
import SearchSection from "../components/Search/SearchSection"
import ConcoursList from "../components/Concours/ConcoursList"
import EstablishmentList from "../components/Establishment/EstablishmentList"
import PrepSection from "../components/Preparation/PrepSection"
import { getConcours, getEstablishments } from "../services/api"
import "./Home.css"

const Home = () => {
  const [featuredConcours, setFeaturedConcours] = useState([])
  const [establishments, setEstablishments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Ajouter des logs pour déboguer
        console.log("Fetching concours and establishments...")

        const concoursResponse = await getConcours()
        const establishmentsResponse = await getEstablishments()

        console.log("Données concours reçues du backend:", concoursResponse?.data)
        console.log("Données établissements reçues du backend:", establishmentsResponse?.data)

        // Vérifier si les données sont dans la propriété data ou directement dans la réponse
        const concoursData = concoursResponse?.data || []
        const establishmentsData = establishmentsResponse?.data || []

        setFeaturedConcours(concoursData)
        setEstablishments(establishmentsData)
        setLoading(false)
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError("Erreur lors du chargement des données. Veuillez réessayer plus tard.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Chargement des données...</div>
    }

    if (error) {
      return <div className="error-message">{error}</div>
    }

    switch (activeTab) {
      case "all":
      case "launched":
        return (
          <section id="concours" className="featured-concours">
            <h2>Concours en Vedette</h2>
            {featuredConcours && featuredConcours.length > 0 ? (
              <ConcoursList concoursList={featuredConcours} />
            ) : (
              <div className="empty-state">Aucun concours disponible pour le moment.</div>
            )}
          </section>
        )
      case "prepare":
        return <PrepSection />
      case "establishments":
        return (
          <section id="establishments" className="featured-establishments">
            <h2>Établissements</h2>
            {establishments && establishments.length > 0 ? (
              <EstablishmentList establishments={establishments} />
            ) : (
              <div className="empty-state">Aucun établissement disponible pour le moment.</div>
            )}
          </section>
        )
      default:
        return null
    }
  }

  return (
    <div className="home-page">
      <SearchSection onTabChange={handleTabChange} />
      <main>{renderContent()}</main>
    </div>
  )
}

export default Home

