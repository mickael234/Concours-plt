import UserDashboardLayout from "../UserDashboardLayout"
import UserDocuments from "../../components/UserDashboard/UserDocuments"
import "./Documents.css"

const Documents = () => {
  return (
    <UserDashboardLayout>
      <div className="documents-page">
        <h1>Mes Documents</h1>
        <UserDocuments />
      </div>
    </UserDashboardLayout>
  )
}

export default Documents

