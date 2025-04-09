"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import BusinessDashboardLayout from "../../components/Business/BusinessDashboardLayout"
import BusinessDocuments from "./BusinessDocuments"
import BusinessFormations from "./BusinessFormations"
import BusinessDocumentAdd from "./BusinessDocumentAdd"
import BusinessFormationAdd from "./BusinessFormationAdd"
import BusinessAvis from "./BusinessAvis"
import BusinessParametres from "./BusinessParametres"
import BusinessAbout from "./BusinessAbout"
import "./BusinessDashboard.css"

const BusinessDashboard = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("about")
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    // Déterminer l'onglet actif en fonction de l'URL
    const path = location.pathname
    if (path.includes("/about")) setActiveTab("about")
    else if (path.includes("/documents/add")) {
      setActiveTab("documents")
      setShowAddForm(true)
    } else if (path.includes("/documents")) setActiveTab("documents")
    else if (path.includes("/formations/add")) {
      setActiveTab("formations")
      setShowAddForm(true)
    } else if (path.includes("/formations")) setActiveTab("formations")
    else if (path.includes("/avis")) setActiveTab("avis")
    else if (path.includes("/parametres")) setActiveTab("parametres")
    else setActiveTab("about") // Par défaut
  }, [location])

  return (
    <BusinessDashboardLayout>
      <div className="business-dashboard">
        {/* Tabs navigation */}
        <div className="dashboard-tabs">
          <a
            href="/business/dashboard/about"
            className={`tab ${activeTab === "about" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault()
              setActiveTab("about")
              setShowAddForm(false)
              window.history.pushState({}, "", "/business/dashboard/about")
            }}
          >
            A propos
          </a>
          <a
            href="/business/dashboard/documents"
            className={`tab ${activeTab === "documents" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault()
              setActiveTab("documents")
              setShowAddForm(false)
              window.history.pushState({}, "", "/business/dashboard/documents")
            }}
          >
            Documents
          </a>
          <a
            href="/business/dashboard/formations"
            className={`tab ${activeTab === "formations" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault()
              setActiveTab("formations")
              setShowAddForm(false)
              window.history.pushState({}, "", "/business/dashboard/formations")
            }}
          >
            Formations
          </a>

          <a
            href="/business/dashboard/avis"
            className={`tab ${activeTab === "avis" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault()
              setActiveTab("avis")
              setShowAddForm(false)
              window.history.pushState({}, "", "/business/dashboard/avis")
            }}
          >
            Avis
          </a>

          <a
            href="/business/dashboard/parametres"
            className={`tab ${activeTab === "parametres" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault()
              setActiveTab("parametres")
              setShowAddForm(false)
              window.history.pushState({}, "", "/business/dashboard/parametres")
            }}
          >
            Paramètres
          </a>
        </div>

        {/* Tab content */}
        <div className="dashboard-content">
          {activeTab === "about" && <BusinessAbout />}
          {activeTab === "documents" && !showAddForm && <BusinessDocuments />}
          {activeTab === "documents" && showAddForm && <BusinessDocumentAdd />}
          {activeTab === "formations" && !showAddForm && <BusinessFormations />}
          {activeTab === "formations" && showAddForm && <BusinessFormationAdd />}
          {activeTab === "avis" && <BusinessAvis />}
          {activeTab === "parametres" && <BusinessParametres />}
        </div>
      </div>
    </BusinessDashboardLayout>
  )
}

export default BusinessDashboard

