import UserDashboardLayout from "../UserDashboardLayout"
import UserFormations from "../../components/UserDashboard/UserFormations"
import "./Formations.css"

const Formations = () => {
  return (
    <UserDashboardLayout>
      <div className="formations-page">
        <h1>Mes Formations</h1>
        <UserFormations />
      </div>
    </UserDashboardLayout>
  )
}

export default Formations

