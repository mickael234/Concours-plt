import { useNavigate } from "react-router-dom"
import EstablishmentCard from "./EstablishmentCard"

const EstablishmentList = ({ establishments }) => {
  const navigate = useNavigate()

  if (!establishments || establishments.length === 0) {
    return <p>Aucun établissement disponible pour le moment.</p>
  }

  const handleEstablishmentClick = (id) => {
    navigate(`/establishment/${id}`)
  }

  return (
    <div className="establishment-list">
      {establishments.map((establishment) => (
        <EstablishmentCard key={establishment._id} establishment={establishment} onClick={handleEstablishmentClick} />
      ))}
    </div>
  )
}

export default EstablishmentList

