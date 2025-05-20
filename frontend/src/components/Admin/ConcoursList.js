"use client"

import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

const ConcoursList = ({ concours, onEditClick, onDeleteClick }) => {
  const getStatusBadge = (status) => {
    const statusClasses = {
      a_venir: "bg-blue-100 text-blue-800",
      en_cours: "bg-green-100 text-green-800",
      termine: "bg-red-100 text-red-800",
    }
    const statusText = {
      a_venir: "À venir",
      en_cours: "En cours",
      termine: "Terminé",
    }
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}
      >
        {statusText[status] || "Inconnu"}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Liste des Concours</h2>

      {/* Version pour écrans moyens et grands */}
      {concours && concours.length > 0 ? (
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Période d'inscription</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {concours.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.organizerName}</TableCell>
                  <TableCell>{new Date(c.dateStart).getFullYear()}</TableCell>
                  <TableCell>
                    {new Date(c.dateStart).toLocaleDateString("fr-FR")} au{" "}
                    {new Date(c.dateEnd).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>{getStatusBadge(c.status)}</TableCell>
                  <TableCell>
                    <Button onClick={() => onEditClick(c)} className="mr-2" variant="outline">
                      Modifier
                    </Button>
                    <Button onClick={() => onDeleteClick(c._id)} variant="destructive">
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-gray-600 italic">Aucun concours disponible.</p>
      )}

      {/* Version pour mobiles */}
      {concours && concours.length > 0 ? (
        <div className="md:hidden space-y-4">
          {concours.map((c) => (
            <div key={c._id} className="bg-white shadow rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">{c.title}</h3>
                {getStatusBadge(c.status)}
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Organisation:</span> {c.organizerName}
                </p>
                <p>
                  <span className="text-gray-500">Année:</span> {new Date(c.dateStart).getFullYear()}
                </p>
                <p>
                  <span className="text-gray-500">Inscription:</span>{" "}
                  {new Date(c.dateStart).toLocaleDateString("fr-FR")} au{" "}
                  {new Date(c.dateEnd).toLocaleDateString("fr-FR")}
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button onClick={() => onEditClick(c)} className="flex-1" variant="outline" size="sm">
                  Modifier
                </Button>
                <Button onClick={() => onDeleteClick(c._id)} className="flex-1" variant="destructive" size="sm">
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ConcoursList
