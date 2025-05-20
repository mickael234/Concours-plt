import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import ErrorBoundary from "./components/ErrorBoundary"
import Header from "./components/Layout/Header"
import Footer from "./components/Layout/Footer"
import BusinessHeader from "./components/Business/BusinessHeader"
import Home from "./pages/Home"
import EstablishmentDetail from "./pages/EstablishmentDetail"
import ConcoursDetail from "./pages/ConcoursDetail"
import Boutique from "./pages/Boutique"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminDashboard from "./pages/AdminDashboard"
import PrivateRoute from "./components/PrivateRoute"
import PrepSection from "./components/Preparation/PrepSection"
import StructureSearch from "./components/Preparation/StructureSearch"
import StudyGroupForm from "./components/Preparation/StudyGroupForm"
import DocumentDetails from "./components/DocumentDetails"
import ResourceDetail from "./pages/ResourceDetail"
import ConcoursManager from "./components/Admin/ConcoursManager"
import FileViewer from "./components/FileViewer"
import "./App.css"
import "./styles/globals.css"
import "./styles/responsive.css" // Importation des styles responsives

// Business pages
import BusinessHome from "./pages/Business/BusinessHome"
import BusinessLogin from "./pages/Business/BusinessLogin"
import BusinessRegister from "./pages/Business/BusinessRegister"
import BusinessDashboard from "./pages/Business/BusinessDashboard"
import BusinessResetPassword from "./pages/Business/BusinessResetPassword"
import BusinessFormations from "./pages/Business/BusinessFormations"
import BusinessFormationAdd from "./pages/Business/BusinessFormationAdd"
import BusinessFormationEdit from "./pages/Business/BusinessFormationEdit"
import BusinessFormationInscriptions from "./pages/Business/BusinessFormationInscriptions"
import BusinessInscriptions from "./pages/Business/BusinessInscriptions"
import BusinessDocuments from "./pages/Business/BusinessDocuments"
import BusinessDocumentAdd from "./pages/Business/BusinessDocumentAdd"
import BusinessDocumentEdit from "./pages/Business/BusinessDocumentEdit"
import BusinessParametres from "./pages/Business/BusinessParametres"
import BusinessAbout from "./pages/Business/BusinessAbout"


// Importez les composants du tableau de bord utilisateur
import UserDashboard from "./pages/user/Dashboard"
import UserAlerts from "./pages/user/Alerts"
import UserApplications from "./pages/user/Applications"
import UserParcours from "./pages/user/Parcours"
import UserDocuments from "./pages/user/Documents"
import UserFormations from "./pages/user/Formations"
import UserProfile from "./pages/user/Profile"
import UserSettings from "./pages/user/Settings"
import UserAvis from "./pages/user/UserAvisPage"

// Importez les nouveaux composants pour les formations
import FormationDetail from "./pages/FormationDetail"
import FormationRegister from "./pages/FormationRegister"

// Composant pour gérer l'affichage conditionnel du header et footer
const AppLayout = () => {
  const location = useLocation()
  const isBusinessRoute = location.pathname.startsWith("/business")
  const isBusinessDashboardRoute = location.pathname.startsWith("/business/dashboard")
  const isUserDashboardRoute = location.pathname.startsWith("/user")

  return (
    <div className="App flex flex-col min-h-screen">
      {isBusinessRoute ? <BusinessHeader /> : <Header />}
      <main className="flex-grow">
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<Home />} />
          <Route path="/establishment/:id" element={<EstablishmentDetail />} />
          <Route path="/concours/:id" element={<ConcoursDetail />} />
          <Route path="/boutique" element={<Boutique />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Navigate to="/login" />} />

          <Route
            path="/admin/*"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/preparation"
            element={
              <PrivateRoute>
                <PrepSection />
              </PrivateRoute>
            }
          />
          <Route
          path="/user/avis"
          element={
            <PrivateRoute>
              <UserAvis />
            </PrivateRoute>
          }
        />

          <Route
            path="/preparation/structures"
            element={
              <PrivateRoute>
                <StructureSearch />
              </PrivateRoute>
            }
          />

          <Route
            path="/preparation/groupe-etude"
            element={
              <PrivateRoute>
                <StudyGroupForm />
              </PrivateRoute>
            }
          />

          <Route path="/documents/:id" element={<DocumentDetails />} />
          <Route path="/resources/:id" element={<ResourceDetail />} />

          <Route
            path="/admin/concours"
            element={
              <PrivateRoute adminOnly={true}>
                <ConcoursManager />
              </PrivateRoute>
            }
          />

          <Route path="/file/:filename" element={<FileViewer />} />

          {/* Nouvelles routes pour les formations */}
          <Route path="/formations/:id" element={<FormationDetail />} />
          <Route
            path="/formations/:id/register"
            element={
              <PrivateRoute>
                <FormationRegister />
              </PrivateRoute>
            }
          />

          {/* Business routes */}
          <Route path="/business" element={<BusinessHome />} />
          <Route path="/business/login" element={<BusinessLogin />} />
          <Route path="/business/register" element={<BusinessRegister />} />
          <Route path="/business/reset-password" element={<BusinessResetPassword />} />

          {/* Business Dashboard routes */}
          <Route
            path="/business/dashboard"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/business/dashboard/formations"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessFormations />
              </PrivateRoute>
            }
          />

          <Route
            path="/business/dashboard/formations/add"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessFormationAdd />
              </PrivateRoute>
            }
          />

          {/* Ajout de la route pour create qui redirige vers add */}
          <Route
            path="/business/dashboard/formations/create"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessFormationAdd />
              </PrivateRoute>
            }
          />

          <Route
            path="/business/dashboard/formations/edit/:id"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessFormationEdit />
              </PrivateRoute>
            }
          />

          <Route
            path="/business/dashboard/formations/:id/inscriptions"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessFormationInscriptions />
              </PrivateRoute>
            }
          />

          <Route
            path="/business/dashboard/inscriptions"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessInscriptions />
              </PrivateRoute>
            }
          />

          <Route
            path="/business/dashboard/documents"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessDocuments />
              </PrivateRoute>
            }
          />

          <Route
            path="/business/dashboard/documents/add"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessDocumentAdd />
              </PrivateRoute>
            }
          />

          {/* Ajout de la route pour create qui redirige vers add */}
          <Route
            path="/business/dashboard/documents/create"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessDocumentAdd />
              </PrivateRoute>
            }
          />

          <Route
            path="/business/dashboard/documents/edit/:id"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessDocumentEdit />
              </PrivateRoute>
            }
          />

          <Route
            path="/business/dashboard/parametres"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessParametres />
              </PrivateRoute>
            }
          />

          <Route
            path="/business/dashboard/about"
            element={
              <PrivateRoute businessOnly={true}>
                <BusinessAbout />
              </PrivateRoute>
            }
          />

          {/* Routes du tableau de bord utilisateur */}
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/alerts"
            element={
              <PrivateRoute>
                <UserAlerts />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/applications"
            element={
              <PrivateRoute>
                <UserApplications />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/parcours"
            element={
              <PrivateRoute>
                <UserParcours />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/documents"
            element={
              <PrivateRoute>
                <UserDocuments />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/formations"
            element={
              <PrivateRoute>
                <UserFormations />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/settings"
            element={
              <PrivateRoute>
                <UserSettings />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      {!isBusinessDashboardRoute && !isUserDashboardRoute && <Footer />}
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppLayout />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
