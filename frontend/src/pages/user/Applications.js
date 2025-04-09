import UserDashboardLayout from "../UserDashboardLayout"
import UserApplications from "../../components/UserDashboard/UserApplications"
import "./Applications.css"

const Applications = () => {
  return (
    <UserDashboardLayout>
      <div className="applications-page">
        <h1>Mes Candidatures</h1>
        <UserApplications />
      </div>
    </UserDashboardLayout>
  )
}

export default Applications

