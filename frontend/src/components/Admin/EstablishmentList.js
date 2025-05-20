"use client"

const EstablishmentList = ({ establishments, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Liste des Établissements</h2>

      {/* Version desktop - tableau standard */}
      {establishments && establishments.length > 0 ? (
        <div className="hidden md:block overflow-x-auto">
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
                    <button
                      onClick={() => onEdit(establishment)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
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
        </div>
      ) : (
        <p className="text-gray-600 italic">Aucun établissement disponible.</p>
      )}

      {/* Version mobile - cartes */}
      {establishments && establishments.length > 0 ? (
        <div className="md:hidden space-y-4">
          {establishments.map((establishment) => (
            <div key={establishment._id} className="bg-white shadow rounded-lg p-4">
              <div className="mb-2">
                <h3 className="font-medium text-gray-900">{establishment.name}</h3>
                <p className="text-sm text-gray-500">{establishment.country}</p>
              </div>

              {establishment.website && (
                <div className="mb-3">
                  <a
                    href={establishment.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-900 break-all"
                  >
                    {establishment.website}
                  </a>
                </div>
              )}

              <div className="flex space-x-3 mt-2">
                <button
                  onClick={() => onEdit(establishment)}
                  className="flex-1 bg-indigo-50 text-indigo-600 py-2 px-3 rounded text-sm font-medium hover:bg-indigo-100"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(establishment._id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded text-sm font-medium hover:bg-red-100"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default EstablishmentList
