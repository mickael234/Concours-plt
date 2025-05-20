"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import "./SearchSection.css"

const SearchSection = ({ onTabChange, onSearch }) => {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: "all", // all, concours, formation, document, resource, establishment
    status: "all", // all, active, upcoming, past
    category: "all", // Catégorie spécifique (dépend du type)
    location: "all", // Lieu (pour les concours et établissements)
    date: {
      from: "",
      to: "",
    },
  })

  // Liste des catégories pour chaque type
  const categories = {
    concours: ["Administration", "Santé", "Éducation", "Finance", "Technique", "Autre"],
    formation: ["Préparation concours", "Développement professionnel", "Technique", "Management", "Autre"],
    document: ["Sujet d'examen", "Corrigé", "Cours", "Guide", "Autre"],
    resource: ["Vidéo", "Audio", "PDF", "Article", "Autre"],
    establishment: ["Université", "École", "Institut", "Centre de formation", "Autre"],
  }

  const handleTabClick = (tab, event) => {
    // Update active tab
    setActiveTab(tab)

    // Reset filters when changing tabs
    setFilters({
      ...filters,
      type: tab === "all" ? "all" : tab === "launched" ? "concours" : tab === "prepare" ? "formation" : "establishment",
    })

    // Call the onTabChange prop to update the parent component
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()

    // Préparer les données de recherche
    const searchData = {
      term: searchTerm,
      tab: activeTab,
      filters: filters,
    }

    // Appeler la fonction de recherche du parent
    if (onSearch) {
      onSearch(searchData)
    }

    console.log("Recherche:", searchData)
  }

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    })
  }

  const handleDateChange = (field, value) => {
    setFilters({
      ...filters,
      date: {
        ...filters.date,
        [field]: value,
      },
    })
  }

  const resetFilters = () => {
    setFilters({
      type: "all",
      status: "all",
      category: "all",
      location: "all",
      date: {
        from: "",
        to: "",
      },
    })
  }

  // Déterminer les catégories à afficher en fonction du type sélectionné
  const getCategories = () => {
    if (filters.type === "all") {
      return []
    }
    return categories[filters.type] || []
  }

  return (
    <div className="search-section">
      <h1>
        Trouver un <span className="highlight">concours</span>
      </h1>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher des concours, formations, documents..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="button" className="filter-button4" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={20} />
          </button>
          <button type="submit" className="search-button">
            <Search size={20} />
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filters-header">
              <h3>Filtres</h3>
              <button type="button" className="reset-filters" onClick={resetFilters}>
                Réinitialiser
              </button>
              <button type="button" className="close-filters" onClick={() => setShowFilters(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="filters-grid">
              <div className="filter-group">
                <label>Type</label>
                <select value={filters.type} onChange={(e) => handleFilterChange("type", e.target.value)}>
                  <option value="all">Tous</option>
                  <option value="concours">Concours</option>
                  <option value="formation">Formation</option>
                  <option value="document">Document</option>
                  <option value="resource">Ressource</option>
                  <option value="establishment">Établissement</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Statut</label>
                <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
                  <option value="all">Tous</option>
                  <option value="active">En cours</option>
                  <option value="upcoming">À venir</option>
                  <option value="past">Terminé</option>
                </select>
              </div>

              {getCategories().length > 0 && (
                <div className="filter-group">
                  <label>Catégorie</label>
                  <select value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)}>
                    <option value="all">Toutes</option>
                    {getCategories().map((category) => (
                      <option key={category} value={category.toLowerCase()}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(filters.type === "all" || filters.type === "concours" || filters.type === "establishment") && (
                <div className="filter-group">
                  <label>Lieu</label>
                  <select value={filters.location} onChange={(e) => handleFilterChange("location", e.target.value)}>
                    <option value="all">Tous</option>
                    <option value="abidjan">Abidjan</option>
                    <option value="yamoussoukro">Yamoussoukro</option>
                    <option value="bouake">Bouaké</option>
                    <option value="korhogo">Korhogo</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              )}

              <div className="filter-group date-range">
                <label>Période</label>
                <div className="date-inputs">
                  <input
                    type="date"
                    value={filters.date.from}
                    onChange={(e) => handleDateChange("from", e.target.value)}
                    placeholder="De"
                  />
                  <span>à</span>
                  <input
                    type="date"
                    value={filters.date.to}
                    onChange={(e) => handleDateChange("to", e.target.value)}
                    placeholder="À"
                  />
                </div>
              </div>
            </div>

            <div className="filters-actions">
              <button type="submit" className="apply-filters">
                Appliquer les filtres
              </button>
            </div>
          </div>
        )}
      </form>

      <nav className="nav-tabs">
        <button
          className={`tab-button ${activeTab === "all" ? "active" : ""}`}
          onClick={(e) => handleTabClick("all", e)}
        >
          Tous les concours
        </button>
        <button
          className={`tab-button ${activeTab === "launched" ? "active" : ""}`}
          onClick={(e) => handleTabClick("launched", e)}
        >
          Concours lancés
        </button>
        <button
          className={`tab-button ${activeTab === "prepare" ? "active" : ""}`}
          onClick={(e) => handleTabClick("prepare", e)}
        >
          Se préparer
        </button>
        <button
          className={`tab-button ${activeTab === "establishments" ? "active" : ""}`}
          onClick={(e) => handleTabClick("establishments", e)}
        >
          Etablissements
        </button>
      </nav>
    </div>
  )
}

export default SearchSection
