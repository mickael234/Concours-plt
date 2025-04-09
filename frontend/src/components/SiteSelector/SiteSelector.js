"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import "./SiteSelector.css"

const SiteSelector = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Déterminer le site actuel en fonction de l'URL
  const currentSite = location.pathname.startsWith("/business") ? "business" : "particuliers"

  const sites = [
    {
      id: "particuliers",
      name: "Particuliers",
      description: "Concours CI pour les Particuliers",
      color: "#e0f7f1",
      path: "/",
    },
    {
      id: "business",
      name: "Business",
      description: "Concours CI pour les Business",
      color: "#6c757d",
      path: "/business",
    },
  ]

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleSiteChange = (siteId) => {
    if (siteId !== currentSite) {
      const site = sites.find((s) => s.id === siteId)
      if (site) {
        navigate(site.path)
      }
    }
    setIsOpen(false)
  }

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const currentSiteObj = sites.find((s) => s.id === currentSite) || sites[0]

  return (
    <div className="site-selector" ref={dropdownRef}>
      <button className="site-selector-toggle" onClick={toggleDropdown}>
        <span>Changer de site : </span>
        <span className="current-site">{currentSiteObj.name}</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="site-selector-dropdown">
          {sites.map((site) => (
            <div
              key={site.id}
              className={`site-option ${site.id === currentSite ? "active" : ""}`}
              style={{ backgroundColor: site.id === currentSite ? site.color : "transparent" }}
              onClick={() => handleSiteChange(site.id)}
            >
              <div className="site-option-radio">
                <div className={`radio-outer ${site.id === currentSite ? "active" : ""}`}>
                  {site.id === currentSite && <div className="radio-inner"></div>}
                </div>
              </div>
              <div className="site-option-content">
                <div className="site-name">{site.description}</div>
                <div className="site-type">{site.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SiteSelector

