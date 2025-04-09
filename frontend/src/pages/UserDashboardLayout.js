import UserSidebar from "../components/UserDashboard/UserSidebar"
import "./UserDashboardLayout.css"

const UserDashboardLayout = ({ children }) => {
  return (
    <div className="user-dashboard-layout">
      <UserSidebar />
      <div className="user-dashboard-content">{children}</div>
    </div>
  )
}

export default UserDashboardLayout

