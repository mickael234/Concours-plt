"use client"

import { useState, useEffect } from "react"
import { getConcours, deleteConcours, createConcours, updateConcours } from "../../services/api"
import ConcoursForm from "./ConcoursForm"
import ConcoursList from "./ConcoursList"

const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Erreur!</strong>
      <span className="block sm:inline"> {message}</span>
      <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={onClose}>
        <svg
          className="fill-current h-6 w-6 text-red-500"
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </span>
    </div>
  )
}

const ConcoursManager = () => {
  const [concours, setConcours] = useState([])
  const [isAdding, setIsAdding] = useState(false)
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
      if (Array.isArray(response)) {
        setConcours(response)
      } else if (response && typeof response === "object" && response.data) {
        setConcours(Array.isArray(response.data) ? response.data : [])
      } else {
        setConcours([])
        console.error("Format de réponse inattendu:", response)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des concours:", err)
      setError("Erreur lors du chargement des concours: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setEditingConcours(null)
    setIsAdding(true)
  }

  const handleDeleteClick = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce concours ?")) {
      try {
        await deleteConcours(id)
        await fetchConcours()
      } catch (err) {
        setError("Erreur lors de la suppression du concours: " + err.message)
      }
    }
  }

  const handleEditClick = (concours) => {
    setEditingConcours(concours)
    setIsAdding(true)
  }

  const handleSubmit = async (formData) => {
    try {
      setLoading(true)
      console.log("Submitting form data:", formData)
      let response
      if (editingConcours) {
        console.log("Updating concours with ID:", editingConcours._id)
        response = await updateConcours(editingConcours._id, formData)
        console.log("Update response:", response)
      } else {
        console.log("Creating new concours")
        response = await createConcours(formData)
        console.log("Create response:", response)
      }
      await fetchConcours()
      setEditingConcours(null)
      setIsAdding(false)
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      setError("Erreur lors de la sauvegarde du concours: " + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des Concours</h1>
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      <button onClick={handleAddClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Ajouter un concours
      </button>
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {isAdding && (
            <ConcoursForm
              onSubmit={handleSubmit}
              initialData={editingConcours}
              onCancel={() => {
                setIsAdding(false)
                setEditingConcours(null)
              }}
            />
          )}
          <ConcoursList concours={concours} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />
        </>
      )}
    </div>
  )
}

export default ConcoursManager

