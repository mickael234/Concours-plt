"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { login } from "../services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [businessUser, setBusinessUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkLoggedIn = () => {
      try {
        // Vérifier d'abord le business user
        const businessInfoFromStorage = localStorage.getItem("businessInfo")
        if (businessInfoFromStorage) {
          const businessInfo = JSON.parse(businessInfoFromStorage)
          setBusinessUser(businessInfo)
        }

        // Puis vérifier l'utilisateur normal
        const userInfoFromStorage = localStorage.getItem("userInfo")
        if (userInfoFromStorage) {
          const userInfo = JSON.parse(userInfoFromStorage)
          setUser(userInfo)
        }
      } catch (error) {
        console.error("Error checking login status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  // Fonction pour connecter un utilisateur normal
  const loginUser = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await login({ email, password })
      console.log("Login response:", response)

      // Si la réponse est un succès, sauvegarder les informations de l'utilisateur
      setUser(response)
      localStorage.setItem("userInfo", JSON.stringify(response))
      localStorage.setItem("token", response.token)

      return response
    } catch (error) {
      console.error("Login error:", error)
      setError(error.message || "Une erreur s'est produite lors de la connexion")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour connecter un utilisateur business
  const loginBusinessUser = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const response = userData

      // Si userData n'est pas fourni, on suppose que email et password sont fournis
      if (!userData) {
        throw new Error("Données utilisateur requises")
      }

      console.log("Business login response:", response)

      // Si la réponse est un succès, sauvegarder les informations de l'utilisateur business
      setBusinessUser(response)
      localStorage.setItem("businessInfo", JSON.stringify(response))

      if (response.token) {
        localStorage.setItem("businessToken", response.token)
      }

      return response
    } catch (error) {
      console.error("Business login error:", error)
      setError(error.message || "Une erreur s'est produite lors de la connexion")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour déconnecter un utilisateur (normal ou business)
  const logout = () => {
    // Supprimer les informations de l'utilisateur du state et du localStorage
    setUser(null)
    setBusinessUser(null)
    localStorage.removeItem("userInfo")
    localStorage.removeItem("token")
    localStorage.removeItem("businessInfo")
    localStorage.removeItem("businessToken")
    // Redirection gérée par les composants qui appellent cette fonction
  }

  // Fournir le contexte à tous les composants enfants
  return (
    <AuthContext.Provider
      value={{
        user,
        businessUser,
        loading,
        error,
        loginUser,
        loginBusiness: loginBusinessUser,
        logout,
        isAuthenticated: !!user || !!businessUser,
        isBusinessUser: !!businessUser,
        isUser: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext)

export default AuthContext

