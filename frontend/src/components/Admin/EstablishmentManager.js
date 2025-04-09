"use client"

import { useState, useEffect } from "react"
import {
  getEstablishments,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
  getConcours,
} from "../../services/api"
import EstablishmentForm from "./EstablishmentForm"
import EstablishmentList from "./EstablishmentList"
import { Alert, AlertDescription } from "../ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

const EstablishmentManager = () => {
  const [establishments, setEstablishments] = useState([])
  const [concoursList, setConcoursList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingEstablishment, setEditingEstablishment] = useState(null)

  useEffect(() => {
    fetchEstablishments()
    fetchConcours()
  }, [])

  const fetchEstablishments = async () => {
    try {
      setLoading(true)
      const response = await getEstablishments()
      setEstablishments(response.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching establishments:", err)
      setError("Erreur lors du chargement des établissements")
      setLoading(false)
    }
  }

  const fetchConcours = async () => {
    try {
      const response = await getConcours()
      setConcoursList(response.data)
    } catch (err) {
      console.error("Error fetching concours:", err)
      setError("Erreur lors du chargement des concours")
    }
  }

  const handleSubmit = async (formData) => {
    try {
      setLoading(true)
      console.log("Submitting form data:", formData)
      let response
      if (editingEstablishment) {
        console.log("Updating establishment with ID:", editingEstablishment._id)
        response = await updateEstablishment(editingEstablishment._id, formData)
        console.log("Update response:", response)
      } else {
        console.log("Creating new establishment")
        response = await createEstablishment(formData)
        console.log("Create response:", response)
      }
      await fetchEstablishments()
      setEditingEstablishment(null)
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      setError("Erreur lors de la sauvegarde de l'établissement: " + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (establishment) => {
    console.log("Editing establishment:", establishment)
    setEditingEstablishment(establishment)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce concours ?")) {
      try {
        setLoading(true)
        console.log("Deleting concours with ID:", id)
        await deleteEstablishment(id)
        console.log("Concours deleted successfully")
        await fetchConcours()
      } catch (err) {
        console.error("Error in handleDelete:", err)
        setError("Erreur lors de la suppression du concours: " + (err.response?.data?.message || err.message))
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingEstablishment ? "Modifier l'établissement" : "Ajouter un établissement"}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <EstablishmentForm
            onSubmit={handleSubmit}
            initialData={editingEstablishment}
            onCancel={() => setEditingEstablishment(null)}
            concoursList={concoursList}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des établissements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <EstablishmentList establishments={establishments} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EstablishmentManager

