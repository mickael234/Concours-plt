"use client"

import { useState } from "react"
import "./SearchSection.css"

const SearchSection = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("all")

  const handleTabClick = (tab, event) => {
    // Remove 'active' class from all buttons
    const buttons = document.querySelectorAll(".tab-button")
    buttons.forEach((button) => button.classList.remove("active"))

    // Add 'active' class to clicked button
    event.target.classList.add("active")

    // Update active tab
    setActiveTab(tab)

    // Call the onTabChange prop to update the parent component
    onTabChange(tab)
  }

  return (
    <div className="search-section">
      <h1>
        Trouver un <span className="highlight">concours</span>
      </h1>
      <div className="search-container">
        <input type="text" placeholder="Taper le nom d'un concours ..." className="search-input" />
        <button className="search-button">
          <i className="search-icon">🔍</i>
        </button>
      </div>
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

