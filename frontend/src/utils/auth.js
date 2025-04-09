// Fonction pour récupérer le token d'authentification du localStorage
export const getToken = () => {
    return localStorage.getItem("token")
  }
  
  // Fonction pour définir le token d'authentification dans le localStorage
  export const setToken = (token) => {
    localStorage.setItem("token", token)
  }
  
  // Fonction pour supprimer le token d'authentification du localStorage
  export const removeToken = () => {
    localStorage.removeItem("token")
  }
  
  // Fonction pour vérifier si l'utilisateur est authentifié
  export const isAuthenticated = () => {
    return !!getToken()
  }
  
  