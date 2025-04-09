"use client"

import { useState, useEffect } from "react"
import ResourceForm from "./ResourceForm"
import ResourceList from "./ResourceList"
import { getResources, createResource, updateResource, deleteResource, } from "../../services/api"
import "./ResourcesManager.css"

const ResourcesManager = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingResource, setEditingResource] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const data = await getResources()
      console.log("Resources fetched:", data)

      if (Array.isArray(data)) {
        setResources(data)
      } else if (data && Array.isArray(data.data)) {
        // Fallback au cas où l'API renvoie { data: [...] }
        setResources(data.data)
      } else {
        console.error("Invalid response format:", data)
        setResources([])
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching resources:", err)
      setError("Erreur lors du chargement des ressources")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (resourceData) => {
    try {
      if (editingResource) {
        await updateResource(editingResource._id, resourceData)
        setSuccessMessage("Ressource mise à jour avec succès!")
      } else {
        const response = await createResource(resourceData)
        console.log("Resource submitted:", response)
        setSuccessMessage("Ressource créée avec succès!")
      }

      // Rafraîchir la liste des ressources
      await fetchResources()

      // Réinitialiser le formulaire
      setEditingResource(null)

      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error submitting resource:", err)
      setError("Erreur lors de la sauvegarde de la ressource")
    }
  }

  const handleEdit = (resource) => {
    console.log("Editing resource:", resource)
    setEditingResource(resource)
    // Faire défiler jusqu'au formulaire
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) {
      try {
        await deleteResource(id)
        setSuccessMessage("Ressource supprimée avec succès!")
        await fetchResources()

        // Effacer le message de succès après 3 secondes
        setTimeout(() => {
          setSuccessMessage("")
        }, 3000)
      } catch (err) {
        console.error("Error deleting resource:", err)
        setError("Erreur lors de la suppression de la ressource")
      }
    }
  }

  return (
    <div className="resources-manager">
      <h1 className="manager-title">Gestion des Ressources</h1>

      {successMessage && <div className="success-message">{successMessage}</div>}

      {error && <div className="error-message">{error}</div>}

      <div className="form-section">
        <h2 className="section-title">
          {editingResource ? "Modifier la ressource" : "Ajouter une nouvelle ressource"}
        </h2>
        <ResourceForm onSubmit={handleSubmit} initialData={editingResource} onCancel={() => setEditingResource(null)} />
      </div>

      <div className="list-section">
        <h2 className="section-title">Liste des ressources</h2>
        {loading ? (
          <div className="loading-message">Chargement des ressources...</div>
        ) : (
          <ResourceList resources={resources} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>
    </div>
  )
}

export default ResourcesManager

