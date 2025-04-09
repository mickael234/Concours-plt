import UserDashboardLayout from "../UserDashboardLayout"
import UserProfile from "../../components/UserDashboard/UserProfile"
import "./Profile.css"

const Profile = () => {
  return (
    <UserDashboardLayout>
      <div className="profile-page">
        <h1>Mon Profil</h1>
        <UserProfile />
      </div>
    </UserDashboardLayout>
  )
}

export default Profile

