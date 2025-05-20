import UserDashboardLayout from "../UserDashboardLayout"
import UserAvis from "../../components/UserDashboard/UserAvis"

const UserAvisPage = () => {
  return (
    <UserDashboardLayout>
      <div className="avis-page">
        <h1>Mes Avis</h1>
        <UserAvis />
      </div>
    </UserDashboardLayout>
  )
}

export default UserAvisPage
