import React, { useState, useEffect } from "react"
import { getConcours, createConcours, updateConcours, deleteConcours } from "../../services/api"
import ConcoursForm from "./ConcoursForm"
import ConcoursList from "./ConcoursList"
import ErrorAlert from "../common/ErrorAlert"
import LoadingSpinner from "../common/LoadingSpinner"
import "../../styles/admin.css"

const ConcoursManager = () => {
  const [concours, setConcours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingConcours, setEditingConcours] = useState(null)

  useEffect(() => {
    fetchConcours()
  }, [])

  const fetchConcours = async () => {
    try {
      setLoading(true)
      const response = await getConcours()
      setConcours(response.data)
    } catch (err) {
      setError("Erreur lors du chargement des concours: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    try {
      setLoading(true)
      if (editingConcours) {
        await updateConcours(editingConcours._id, formData)
      } else {
        await createConcours(formData)
      }
      await fetchConcours()
      setEditingConcours(null)
    } catch (err) {
      setError("Erreur lors de la sauvegarde du concours: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (concours) => {
    setEditingConcours(concours)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce concours ?")) {
      try {
        setLoading(true)
        await deleteConcours(id)
        await fetchConcours()
      } catch (err) {
        setError("Erreur lors de la suppression du concours: " + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">{editingConcours ? "Modifier le Concours" : "Ajouter un Concours"}</h1>
      </header>
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      <ConcoursForm onSubmit={handleSubmit} initialData={editingConcours} onCancel={() => setEditingConcours(null)} />
      <ConcoursList concours={concours} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  )
}

export default ConcoursManager

