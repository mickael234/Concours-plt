"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, Download } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getToken } from "../utils/auth"
import api from "../services/api"

const DocumentList = ({ documents }) => {
  const navigate = useNavigate()
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [authToken, setAuthToken] = useState(null)

  useEffect(() => {
    const token = getToken()
    setAuthToken(token)
  }, [])

  const handleDownload = useCallback(
    async (document) => {
      if (authToken) {
        try {
          const response = await api.get(`/download?url=${encodeURIComponent(document.url)}`, {
            responseType: "blob",
          })

          const blob = new Blob([response.data], { type: response.headers["content-type"] })
          const url = window.URL.createObjectURL(blob)

          // Ouvrir dans un nouvel onglet
          window.open(url, "_blank")
        } catch (error) {
          console.error("Erreur lors du téléchargement:", error)
          alert("Une erreur s'est produite lors du téléchargement. Veuillez réessayer plus tard.")
        }
      } else {
        navigate("/login")
      }
    },
    [authToken, navigate],
  )

  return (
    <div className="space-y-4">
      {documents.map((doc, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <FileText className="h-10 w-10 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium">{doc.title}</h3>
              <p className="text-sm text-gray-500">{doc.type}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedDocument(doc)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Voir détails
          </button>
        </div>
      ))}

      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">{selectedDocument.title}</h2>
            <p className="mb-2">
              <strong>Type:</strong> {selectedDocument.type}
            </p>
            <p className="mb-2">
              <strong>Catégorie:</strong> {selectedDocument.category || "Document"}
            </p>
            <p className="mb-2">
              <strong>Format:</strong> {selectedDocument.format || "Document numérique"}
            </p>
            <p className="mb-2">
              <strong>Livraison:</strong> {selectedDocument.delivery || "N/A"}
            </p>
            {selectedDocument.deliveryDetails && (
              <p className="mb-2">
                <strong>Détails livraison:</strong> {selectedDocument.deliveryDetails}
              </p>
            )}
            <p className="mb-2">
              <strong>Publié par:</strong> {selectedDocument.publishedBy || "N/A"}
            </p>
            {selectedDocument.relatedConcours && (
              <p className="mb-2">
                <strong>Concours associé:</strong>{" "}
                <a
                  href={`/concours/${selectedDocument.relatedConcours}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Voir le concours
                </a>
              </p>
            )}
            <h3 className="text-xl font-semibold mt-4 mb-2">À propos</h3>
            <p className="mb-4">{selectedDocument.description}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setSelectedDocument(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Fermer
              </button>
              <a
                href={selectedDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                onClick={(e) => {
                  e.preventDefault()
                  handleDownload(selectedDocument)
                }}
              >
                <Download className="w-5 h-5 mr-2" />
                Télécharger
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentList

