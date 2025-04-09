import UserDashboardLayout from "../UserDashboardLayout"
import UserSettings from "../../components/UserDashboard/UserSettings"
import "./Settings.css"

const Settings = () => {
  return (
    <UserDashboardLayout>
      <div className="settings-page">
        <h1>Paramètres</h1>
        <UserSettings />
      </div>
    </UserDashboardLayout>
  )
}

export default Settings

