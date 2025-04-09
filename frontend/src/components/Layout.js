import { useLocation } from "react-router-dom"
import Header from "./Layout/Header"
import BusinessHeader from "./Business/BusinessHeader"
import Footer from "./Layout/Footer"

const Layout = ({ children }) => {
  const location = useLocation()
  const isBusiness = location.pathname.startsWith("/business")

  return (
    <div className="app-container">
      {isBusiness ? <BusinessHeader /> : <Header />}
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout

