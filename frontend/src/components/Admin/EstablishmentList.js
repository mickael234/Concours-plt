const EstablishmentList = ({ establishments, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Liste des Établissements</h2>
      {establishments && establishments.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nom
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Pays
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Site web
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {establishments.map((establishment) => (
              <tr key={establishment._id}>
                <td className="px-6 py-4 whitespace-nowrap">{establishment.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{establishment.country}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {establishment.website && (
                    <a
                      href={establishment.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {establishment.website}
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => onEdit(establishment)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    Modifier
                  </button>
                  <button onClick={() => onDelete(establishment._id)} className="text-red-600 hover:text-red-900">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600 italic">Aucun établissement disponible.</p>
      )}
    </div>
  )
}

export default EstablishmentList

