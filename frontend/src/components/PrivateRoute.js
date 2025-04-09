"use client"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const PrivateRoute = ({ children, adminOnly = false, businessOnly = false, superAdminOnly = false }) => {
  const { user, businessUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div>Chargement...</div>
  }

  // For superadmin routes
  if (superAdminOnly) {
    if (!user) {
      console.log("Not authenticated for superadmin route, redirecting to login")
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Allow only superadmin role
    if (user.role !== "superadmin") {
      console.log("Not a superadmin, redirecting to home")
      return <Navigate to="/" replace />
    }

    return children
  }

  // For business routes
  if (businessOnly) {
    console.log("Business route check:", { businessUser })

    // Check if businessToken exists in localStorage as a fallback
    const businessToken = localStorage.getItem("businessToken")
    const businessInfoStr = localStorage.getItem("businessInfo")

    if (businessUser || (businessToken && businessInfoStr)) {
      // If we have a business user in context or in localStorage, allow access
      return children
    }

    // Otherwise redirect to business login
    console.log("Not authenticated for business, redirecting to business login")
    return <Navigate to="/business/login" state={{ from: location }} replace />
  }

  // For admin routes
  if (adminOnly) {
    if (!user) {
      console.log("Not authenticated for admin route, redirecting to login")
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Allow both admin and superadmin roles
    if (user.role !== "admin" && user.role !== "superadmin" && !user.isAdmin) {
      console.log("Not an admin, redirecting to home")
      return <Navigate to="/" replace />
    }

    return children
  }

  // For regular protected routes
  if (!user) {
    console.log("Not authenticated for protected route, redirecting to login")
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute

