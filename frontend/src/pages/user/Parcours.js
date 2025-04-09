import UserDashboardLayout from "../UserDashboardLayout"
import UserProfile from "../../components/UserDashboard/UserProfile"
import "./Parcours.css"

const Parcours = () => {
  return (
    <UserDashboardLayout>
      <div className="parcours-page">
        <UserProfile />
      </div>
    </UserDashboardLayout>
  )
}

export default Parcours

