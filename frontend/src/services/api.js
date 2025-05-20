import axios from "axios"

// Configuration de base pour axios
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// Afficher l'URL de base pour le débogage
console.log("API_URL configuré:", API_URL)

// Créer une instance axios avec l'URL de base et un timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 secondes de timeout
  withCredentials: true, // Envoyer les cookies avec les requêtes
})

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    // Récupérer les tokens disponibles
    const userToken = localStorage.getItem("token")
    const businessToken = localStorage.getItem("businessToken")

    // Déterminer quel token utiliser
    let token = null

    // Priorité au token business pour les routes business
    if (config.url.includes("/business/") && businessToken) {
      token = businessToken
    } else if (userToken) {
      // Sinon utiliser le token utilisateur
      token = userToken
    } else if (businessToken) {
      // En dernier recours, utiliser le token business
      token = businessToken
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error("Erreur dans l'intercepteur de requête:", error)
    return Promise.reject(error)
  },
)

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Gérer les erreurs de connexion
    if (error.code === "ECONNABORTED") {
      console.error("La requête a expiré (timeout):", error)
    } else if (error.code === "ERR_NETWORK") {
      console.error("Erreur réseau - Le serveur est-il en cours d'exécution?", error)
    } else if (error.response) {
      // Gérer les erreurs d'authentification (401)
      if (error.response.status === 401) {
        console.log("Erreur d'authentification 401:", error.response.data)

        // Si l'erreur est liée à un token invalide, supprimer les tokens
        if (error.response.data.message && error.response.data.message.includes("token")) {
          localStorage.removeItem("token")
          localStorage.removeItem("userInfo")
          localStorage.removeItem("businessToken")
          localStorage.removeItem("businessInfo")

          // Rediriger vers la page de connexion
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  },
)

// Authentification
export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials)

    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("userInfo", JSON.stringify(response.data))
    }

    return response.data
  } catch (error) {
    console.error("Erreur de connexion:", error)
    throw error
  }
}

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData)

    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("userInfo", JSON.stringify(response.data))
    }

    return response.data
  } catch (error) {
    console.error("Erreur d'inscription:", error)
    throw error
  }
}

export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("userInfo")
}

// Business auth
export const loginBusiness = async (credentials) => {
  try {
    console.log("Tentative de connexion business avec:", credentials.email)
    const response = await api.post("/business/login", credentials)

    if (response.data && response.data.token) {
      // Stocker le token et les informations du business
      localStorage.setItem("businessToken", response.data.token)
      localStorage.setItem("businessInfo", JSON.stringify(response.data))

      console.log("Connexion business réussie:", response.data.name)
    } else {
      console.error("Réponse de connexion business sans token:", response.data)
    }

    return response.data
  } catch (error) {
    console.error("Erreur de connexion business:", error)

    // Afficher plus de détails sur l'erreur
    if (error.response) {
      console.error("Détails de l'erreur:", error.response.data)
    }

    throw error
  }
}

export const registerBusiness = async (businessData) => {
  try {
    const response = await api.post("/business/register", businessData)

    if (response.data && response.data.token) {
      localStorage.setItem("businessToken", response.data.token)
      localStorage.setItem("businessInfo", JSON.stringify(response.data))
    }

    return response.data
  } catch (error) {
    console.error("Erreur d'inscription business:", error)
    throw error
  }
}

export const logoutBusiness = () => {
  localStorage.removeItem("businessToken")
  localStorage.removeItem("businessInfo")
}

// Utilisateurs
export const fetchUsers = async () => {
  const response = await api.get("/users")
  return response.data
}

export const createUser = async (userData) => {
  const response = await api.post("/users", userData)
  return response.data
}

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData)
  return response.data
}

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`)
  return response.data
}

// Business
export const fetchBusinesses = async () => {
  const response = await api.get("/admin/businesses")
  return response.data
}

export const deleteBusiness = async (id) => {
  const response = await api.delete(`/admin/businesses/${id}`)
  return response.data
}

// Concours
export const getConcours = async () => {
  const response = await api.get("/concours")
  return response
}

export const getConcoursById = async (id) => {
  const response = await api.get(`/concours/${id}`)
  return response
}

export const createConcours = async (concoursData) => {
  const response = await api.post("/concours", concoursData)
  return response.data
}

export const updateConcours = async (id, concoursData) => {
  const response = await api.put(`/concours/${id}`, concoursData)
  return response.data
}

export const deleteConcours = async (id) => {
  const response = await api.delete(`/concours/${id}`)
  return response.data
}

export const rateConcours = async (id, rating) => {
  const response = await api.post(`/concours/${id}/rate`, rating)
  return response.data
}

// Modifier cette fonction pour utiliser POST au lieu de PUT
export const incrementConcoursViews = async (id) => {
  const response = await api.post(`/concours/${id}/view`)
  return response.data
}

// Établissements
export const getEstablishments = async () => {
  const response = await api.get("/establishments")
  return response
}

export const getEstablishmentById = async (id) => {
  const response = await api.get(`/establishments/${id}`)
  return response
}

export const createEstablishment = async (establishmentData) => {
  const response = await api.post("/establishments", establishmentData)
  return response.data
}

export const updateEstablishment = async (id, establishmentData) => {
  const response = await api.put(`/establishments/${id}`, establishmentData)
  return response.data
}

export const deleteEstablishment = async (id) => {
  const response = await api.delete(`/establishments/${id}`)
  return response.data
}

export const rateEstablishment = async (id, rating) => {
  const response = await api.post(`/establishments/${id}/rate`, rating)
  return response.data
}

// Ressources
export const getResources = async () => {
  const response = await api.get("/resources")
  return response.data
}

export const getAllResources = async () => {
  const response = await api.get("/resources/all")
  return response.data
}

export const getResourceById = async (id) => {
  const response = await api.get(`/resources/${id}`)
  return response.data
}

export const createResource = async (resourceData) => {
  const response = await api.post("/resources", resourceData)
  return response.data
}

export const updateResource = async (id, resourceData) => {
  const response = await api.put(`/resources/${id}`, resourceData)
  return response.data
}

export const deleteResource = async (id) => {
  const response = await api.delete(`/resources/${id}`)
  return response.data
}

export const rateResource = async (id, rating) => {
  const response = await api.post(`/resources/${id}/rate`, rating)
  return response.data
}

// Documents
export const getDocuments = async () => {
  const response = await api.get("/documents")
  return response.data
}

export const getDocumentById = async (id) => {
  const response = await api.get(`/documents/${id}`)
  return response.data
}

// Modifiez uniquement la fonction createDocument dans votre fichier api.js

// Modifions la fonction createDocument pour utiliser le bon token
export const createDocument = async (documentData) => {
  try {
    console.log("Données du document à créer:", documentData)

    // Utiliser le token business si disponible, sinon utiliser le token utilisateur
    const businessToken = localStorage.getItem("businessToken")
    const userToken = localStorage.getItem("token")
    const token = businessToken || userToken

    if (!token) {
      throw new Error("Vous devez être connecté pour créer un document")
    }

    // Créer un objet de configuration avec le bon token
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }

    // Si c'est un FormData, ajuster le Content-Type
    if (documentData instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data"
    }

    // Ajouter explicitement l'ID de l'entreprise si nous sommes connectés en tant qu'utilisateur
    // mais que nous voulons créer un document pour une entreprise
    if (userToken && !businessToken && documentData.businessId) {
      // Si c'est un FormData
      if (documentData instanceof FormData) {
        documentData.append("businessId", documentData.businessId)
      } else {
        // Si c'est un objet JSON
        documentData.businessId = documentData.businessId
      }
    }

    console.log("Configuration de la requête:", config)
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/documents`,
      documentData,
      config,
    )

    console.log("Réponse de création de document:", response.data)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la création du document:", error)
    console.log("Détails de l'erreur:", error.response?.data)
    throw error
  }
}



// Remplacer la fonction updateDocument par cette version corrigée
export const updateDocument = async (id, documentData) => {
  try {
    if (documentData instanceof FormData) {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("businessToken")}`,
        },
      }
      const response = await axios.put(`${API_URL}/documents/${id}`, documentData, config)
      return response.data
    }
    const response = await api.put(`/documents/${id}`, documentData)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la mise à jour du document:", error)
    throw error
  }
}

// Remplacer la fonction deleteDocument par cette version corrigée
export const deleteDocument = async (id) => {
  try {
    const response = await api.delete(`/documents/${id}`)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error)
    throw error
  }
}

// Ajout des fonctions manquantes pour les documents business
// Fonction pour récupérer les documents d'une entreprise
export const getBusinessDocuments = async () => {
  try {
    console.log("Appel de l'API pour récupérer les documents de l'entreprise")
    const response = await api.get("/business/documents")
    console.log("Réponse de l'API:", response.data)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération des documents de l'entreprise:", error)
    throw error
  }
}



// Ajoutez cette fonction à votre fichier api.js

export const rateDocument = async (documentId, ratingData) => {
  try {
    const response = await api.post(`/documents/${documentId}/rate`, ratingData)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la notation du document:", error)
    throw error
  }
}

export const fetchBusinessDocuments = async () => {
  const response = await api.get("/business/documents")
  return response.data
}

// Formations
export const getFormations = async () => {
  const response = await api.get("/formations")
  return response.data
}

// Récupérer une formation par ID
export const getFormationById = async (id) => {
  try {
    const response = await api.get(`/formations/${id}`)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération de la formation:", error)
    throw error
  }
}

export const createFormation = async (formationData) => {
  try {
    // Vérifier si nous avons un token business
    const businessToken = localStorage.getItem("businessToken")
    if (!businessToken) {
      console.error("Aucun token business trouvé")
      throw new Error("Vous devez être connecté en tant qu'entreprise pour ajouter une formation")
    }

    console.log("Création de formation avec token business:", businessToken.substring(0, 15) + "...")

    if (formationData instanceof FormData) {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${businessToken}`,
        },
      }

      console.log("Envoi de FormData au serveur")
      // eslint-disable-next-line no-unused-vars
      const formData = new FormData()
      const response = await axios.post(`${API_URL}/formations`, formData, config)
      return response.data
    }

    console.log("Envoi de JSON au serveur")
    const response = await api.post("/formations", formationData, {
      headers: {
        Authorization: `Bearer ${businessToken}`,
      },
    })
    return response.data
  } catch (error) {
    console.error("Erreur lors de la création de la formation:", error)

    // Afficher plus de détails sur l'erreur
    if (error.response) {
      console.error("Détails de l'erreur:", error.response.data)
    }

    throw error
  }
}

// Remplacer la fonction updateFormation par cette version corrigée
// export const updateFormation = async (id, formationData) => {
//   try {
//     if (formationData instanceof FormData) {
//       const config = {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${localStorage.getItem("businessToken")}`,
//         },
//       }
//       const response = await axios.put(`${API_URL}/formations/${id}`, formationData, config)
//       return response.data
//     }
//     const response = await api.put(`/formations/${id}`, formationData)
//     return response.data
//   } catch (error) {
//     console.error("Erreur lors de la mise à jour de la formation:", error)
//     throw error
//   }
// }

// Remplacer la fonction deleteFormation par cette version corrigée
export const deleteFormation = async (id) => {
  try {
    const response = await api.delete(`/formations/${id}`)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la suppression de la formation:", error)
    throw error
  }
}

// Ajout des fonctions manquantes pour les formations business
export const getBusinessFormations = async () => {
  const response = await api.get("/business/formations")
  return response.data
}

export const fetchBusinessFormations = async () => {
  const response = await api.get("/business/formations")
  return response.data
}

export const getAdminFormations = async () => {
  const response = await api.get("/admin/formations")
  return response.data
}

// Inscriptions
export const createInscription = async (inscriptionData) => {
  const response = await api.post("/inscriptions", inscriptionData)
  return response.data
}

export const fetchUserInscriptions = async () => {
  const response = await api.get("/inscriptions/user")
  return response.data
}

export const fetchBusinessInscriptions = async () => {
  const response = await api.get("/business/inscriptions")
  return response.data
}

// Fonction pour récupérer les inscriptions (admin)
export const getAdminInscriptions = async () => {
  try {
    // Corriger l'URL en supprimant le préfixe /api supplémentaire
    const response = await fetch(`${API_URL}/inscriptions/admin`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
    return handleApiResponse(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// Fonction pour récupérer les inscriptions (superadmin)
export const getSuperAdminInscriptions = async () => {
  try {
    // Corriger l'URL en supprimant le préfixe /api supplémentaire
    const response = await fetch(`${API_URL}/superadmin/inscriptions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
    return handleApiResponse(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// Remplacer la fonction updateInscriptionStatus par cette version corrigée
export const updateInscriptionStatus = async (id, data) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    const isSuperAdmin = userInfo && userInfo.role === "superadmin"

    // Corriger l'URL en supprimant le préfixe /api supplémentaire
    const endpoint = isSuperAdmin
      ? `${API_URL}/superadmin/inscriptions/${id}/status`
      : `${API_URL}/inscriptions/${id}/status`

    console.log(`Mise à jour du statut de l'inscription ${id} via ${endpoint}`)
    console.log("Données envoyées:", data)

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    })
    return handleApiResponse(response)
  } catch (error) {
    return handleApiError(error)
  }
}

export const deleteInscription = async (id) => {
  const response = await api.delete(`/admin/inscriptions/${id}`)
  return response.data
}


// Mettre à jour la méthode de paiement d'une inscription
export const updateInscriptionPaymentMethod = async (id, data) => {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/inscriptions/${id}/payment-method`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    return handleApiResponse(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// Statistiques
export const fetchStats = async () => {
  const response = await api.get("/stats")
  return response.data
}

export const getStats = async () => {
  const response = await api.get("/stats")
  return response.data
}

// Site
export const incrementSiteViews = async () => {
  const response = await api.post("/site/view")
  return response.data
}

// Upload de fichiers
export const uploadFile = async (file, type = "file") => {
  const formData = new FormData()
  formData.append(type, file)

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }

  try {
    console.log(`Uploading ${type} to: ${API_URL}/upload`)
    const response = await axios.post(`${API_URL}/upload`, formData, config)
    return response.data.url
  } catch (error) {
    console.error(`Error uploading ${type}:`, error)
    throw new Error(
      `${type.charAt(0).toUpperCase() + type.slice(1)} upload failed: ${error.response?.status} ${error.response?.statusText}`,
    )
  }
}


// User Dashboard - Documents
export const getUserDocuments = async () => {
  try {
    console.log("Appel de l'API pour récupérer les documents de l'utilisateur")
    const response = await api.get("/user/documents")
    console.log("Réponse de l'API:", response.data)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération des documents de l'utilisateur:", error)
    throw error
  }
}
export const uploadUserDocument = async (documentData) => {
  let formData
  if (documentData instanceof FormData) {
    formData = documentData
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
    const response = await axios.post(`${API_URL}/user/documents`, formData, config)
    return response.data
  }
  const response = await api.post("/user/documents", documentData)
  return response.data
}

export const deleteUserDocument = async (documentId) => {
  try {
    const response = await api.delete(`/user/documents/${documentId}`)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error)
    throw error
  }
}


// User Dashboard - Formations
export const getUserFormations = async () => {
  try {
    const response = await api.get("/user/formations")
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error)
    throw error
  }
}

// S'inscrire à une formation
// export const registerForFormation = async (formationId, formData) => {
//   try {
//     const config = {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//     }
//     const response = await axios.post(`${API_URL}/formations/${formationId}/register`, formData, config)
//     return response.data
//   } catch (error) {
//     console.error("Erreur lors de l'inscription à la formation:", error)
//     throw error
//   }
// }

export const cancelFormationRegistration = async (formationId) => {
  const response = await api.delete(`/user/formations/${formationId}/register`)
  return response.data
}

// User Dashboard - Profile
export const getUserEducation = async () => {
  const response = await api.get("/user/profile/education")
  return response.data
}

export const updateUserEducation = async (educationId, educationData) => {
  const response = await api.put(`/user/profile/education/${educationId}`, educationData)
  return response.data
}

export const getUserExperience = async () => {
  const response = await api.get("/user/profile/experience")
  return response.data
}

export const updateUserExperience = async (experienceId, experienceData) => {
  const response = await api.put(`/user/profile/experience/${experienceId}`, experienceData)
  return response.data
}

// User Dashboard - Applications
export const getUserApplications = async () => {
  const response = await api.get("/user/applications")
  return response.data
}

export const getApplicationById = async (applicationId) => {
  const response = await api.get(`/user/applications/${applicationId}`)
  return response.data
}

export const applyForConcours = async (applicationData) => {
  let formData
  if (applicationData instanceof FormData) {
    // eslint-disable-next-line no-unused-vars
    formData = applicationData
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
    const response = await axios.post(`${API_URL}/user/applications`, applicationData, config)
    return response.data
  }
  const response = await api.post("/user/applications", applicationData)
  return response.data
}

export const updateApplication = async (applicationId, applicationData) => {
  let formData
  if (applicationData instanceof FormData) {
    // eslint-disable-next-line no-unused-vars
    formData = applicationData
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
    const response = await axios.put(`${API_URL}/user/applications/${applicationId}`, applicationData, config)
    return response.data
  }
  const response = await api.put(`/user/applications/${applicationId}`, applicationData)
  return response.data
}

export const withdrawApplication = async (applicationId) => {
  const response = await api.delete(`/user/applications/${applicationId}`)
  return response.data
}

// User Dashboard - Settings

// Profil utilisateur
export const getUserProfile = async () => {
  try {
    const response = await api.get("/user/profile")
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    throw error
  }
}
// Fonction pour répondre à un avis
// Modifiez ces fonctions dans api.js
export const respondToRating = async (ratingId, data) => {
  try {
    console.log("Appel API respondToRating avec ID:", ratingId, "et données:", data);

    // Utiliser l'URL complète avec API_URL au lieu d'une URL relative
    const response = await fetch(`${API_URL}/ratings/${ratingId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("businessToken")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur ${response.status}: ${errorText}`);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur API respondToRating:", error);
    throw error;
  }
};

export const deleteRatingResponse = async (ratingId) => {
  try {
    console.log("Appel API deleteRatingResponse avec ID:", ratingId);

    // Utiliser l'URL complète avec API_URL au lieu d'une URL relative
    const response = await fetch(`${API_URL}/ratings/${ratingId}/respond`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("businessToken")}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur ${response.status}: ${errorText}`);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur API deleteRatingResponse:", error);
    throw error;
  }
}

// Fonction pour récupérer la liste des entreprises
export const getBusinesses = async () => {
  try {
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/businesses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
}

export const addUserDocument = async (documentData) => {
  try {
    const response = await api.post("/user/documents", documentData)
    return response.data
  } catch (error) {
    console.error("Erreur lors de l'ajout du document:", error)
    throw error
  }
}

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put("/user/profile", profileData)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    throw error
  }
}

// Formations
export const addUserEducation = async (educationData) => {
  try {
    const response = await api.post("/user/profile/education", educationData)
    return response.data
  } catch (error) {
    console.error("addUserEducation error:", error)
    throw error
  }
}

export const deleteUserEducation = async (educationId) => {
  try {
    const response = await api.delete(`/user/profile/education/${educationId}`)
    return response.data
  } catch (error) {
    console.error("deleteUserEducation error:", error)
    throw error
  }
}

// Expériences
export const addUserExperience = async (experienceData) => {
  try {
    const response = await api.post("/user/profile/experience", experienceData)
    return response.data
  } catch (error) {
    console.error("addUserExperience error:", error)
    throw error
  }
}

export const deleteUserExperience = async (experienceId) => {
  try {
    const response = await api.delete(`/user/profile/experience/${experienceId}`)
    return response.data
  } catch (error) {
    console.error("deleteUserExperience error:", error)
    throw error
  }
}

// Paramètres utilisateur
export const updateUserSettings = async (settingsData) => {
  try {
    const response = await api.put("/user/profile/notifications", settingsData)
    return response.data
  } catch (error) {
    console.error("updateUserSettings error:", error)
    throw error
  }
}

// Mot de passe
// Fonction pour mettre à jour le mot de passe de l'utilisateur
export const updateUserPassword = async (passwordData) => {
  try {
    console.log("Mise à jour du mot de passe avec les données:", passwordData)
    const response = await api.put("/user/profile/password", passwordData)
    return response.data
  } catch (error) {
    console.error("updateUserPassword error:", error)
    throw error
  }
}


// Ajouter ces fonctions pour le profil business

// Business Profile
export const getBusinessProfile = async () => {
  const response = await api.get("/business/profile")
  return response.data
}
// Fonction pour répondre à une réponse d'entreprise

export const replyToBusinessResponse = async (ratingId, data) => {
  try {
    console.log("Tentative de réponse à l'avis ID:", ratingId);
    console.log("Données envoyées:", data);
    
    // Utiliser l'instance api configurée avec la bonne URL de base
    const response = await api.post(`/ratings/${ratingId}/user-reply`, data);
    
    console.log("Réponse reçue:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur API replyToBusinessResponse:", error);
    
    // Afficher plus de détails sur l'erreur
    if (error.response) {
      console.error("Statut:", error.response.status);
      console.error("Données:", error.response.data);
    }
    
    throw error;
  }
}

export const getUserRatings = async () => {
  try {
    const response = await api.get("/user/ratings", {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // utile si tu utilises des cookies/session
    })

    return response.data
  } catch (error) {
    console.error("Erreur API getUserRatings:", error)

    // Optionnel : afficher le message précis de l'erreur
    if (error.response) {
      console.error("Statut:", error.response.status)
      console.error("Données:", error.response.data)
    }

    throw error
  }
}


// Remplacer la fonction updateBusinessProfile par cette version corrigée
export const updateBusinessProfile = async (businessData) => {
  try {
    // Vérifier si businessData est vide
    if (!businessData || Object.keys(businessData).length === 0) {
      throw new Error("Aucune donnée fournie pour la mise à jour")
    }

    // Ajouter des logs pour déboguer
    console.log("Données envoyées pour la mise à jour du profil business:", businessData)

    // Si le nom n'est pas fourni mais que nous avons d'autres données, ne pas exiger le nom
    // Cela permet des mises à jour partielles
    const requireName = businessData.hasOwnProperty("name")

    if (requireName && !businessData.name) {
      throw new Error("Le nom de l'entreprise est requis")
    }

    // Vérifier si businessData contient un fichier logo
    if (businessData.logo && businessData.logo instanceof File) {
      // Si c'est un fichier, créer un FormData
      const formData = new FormData()

      // Ajouter le logo au FormData
      formData.append("logo", businessData.logo)

      // Ajouter les autres données au FormData
      Object.keys(businessData).forEach((key) => {
        if (key !== "logo" && key !== "socialMedia") {
          formData.append(key, businessData[key])
        }
      })

      // Ajouter les réseaux sociaux si présents
      if (businessData.socialMedia) {
        formData.append("socialMedia", JSON.stringify(businessData.socialMedia))
      }

      // Utiliser axios directement avec le bon Content-Type
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("businessToken")}`,
        },
      }

      const response = await axios.put(`${API_URL}/business/profile`, formData, config)
      return response.data
    } else {
      // Si pas de fichier, utiliser l'API normale
      // Assurez-vous que les données sont bien formatées
      const cleanedData = { ...businessData }

      // Supprimer les propriétés undefined ou null
      Object.keys(cleanedData).forEach((key) => {
        if (cleanedData[key] === undefined || cleanedData[key] === null) {
          delete cleanedData[key]
        }
      })

      console.log("Données nettoyées:", cleanedData)

      const response = await api.put("/business/profile", cleanedData)
      return response.data
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil business:", error)
    throw error
  }
}


// Vérifions comment les requêtes sont configurées
// import axios from 'axios';

// Créer une instance axios avec l'URL de base
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: API_URL,
// });

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem("token") || localStorage.getItem("businessToken")

    // Si un token existe, l'ajouter aux headers
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)


// Fonction pour mettre à jour une formation
export const updateFormationData = async (formationId, formationData) => {
  try {
    // Vérifier si nous avons un token avant d'envoyer la requête
    const token = localStorage.getItem("businessToken") || localStorage.getItem("token")
    if (!token) {
      throw new Error("Vous devez être connecté pour effectuer cette action")
    }

    console.log("Données de mise à jour de formation:", formationData)

    // Créer un FormData si des fichiers sont inclus
    let data
    if (formationData.image instanceof File) {
      const formData = new FormData()
      // Ajouter tous les champs au FormData
      Object.keys(formationData).forEach((key) => {
        if (key === "image" && formationData[key] instanceof File) {
          formData.append(key, formationData[key])
        } else if (key === "concours" && Array.isArray(formationData[key])) {
          // Pour les tableaux, nous devons les ajouter un par un
          formationData[key].forEach((item) => {
            formData.append("concours", item)
          })
        } else if (formationData[key] !== undefined && formationData[key] !== null) {
          // Ne pas ajouter les valeurs undefined ou null
          formData.append(key, formationData[key])
        }
      })

      console.log("FormData créé pour la mise à jour de formation")
    } else {
      // Nettoyer les données avant envoi
      data = { ...formationData }

      // Supprimer les propriétés undefined ou null
      Object.keys(data).forEach((key) => {
        if (data[key] === undefined || data[key] === null) {
          delete data[key]
        }
      })

      console.log("Données nettoyées pour la mise à jour de formation:", data)
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        // Si nous utilisons FormData, ne pas définir Content-Type
        ...(!(data instanceof FormData) && { "Content-Type": "application/json" }),
      },
    }

    console.log(`Envoi de la requête PUT à ${API_URL}/formations/${formationId}`)
    const response = await axios.put(`${API_URL}/formations/${formationId}`, data, config)

    console.log("Réponse de mise à jour de formation:", response.data)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la formation:", error)
    throw error
  }
}

// Fonction pour s'inscrire à une formation
export const registerForFormationUser = async (formationId, userData) => {
  try {
    console.log("Tentative d'inscription à la formation:", formationId)
    console.log("Données utilisateur:", userData)

    // Récupérer le token correct (token utilisateur, pas businessToken)
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("Vous devez être connecté pour vous inscrire à une formation")
    }

    console.log("Token trouvé:", token.substring(0, 15) + "...")

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }

    // Utiliser l'URL complète pour éviter les problèmes de chemin relatif
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"
    const { data } = await axios.post(`${API_URL}/formations/${formationId}/inscriptions`, userData, config)

    return data
  } catch (error) {
    console.error("Erreur lors de l'inscription à la formation:", error)
    throw error
  }
}

// Alias pour la compatibilité avec le code existant
export const registerForFormation = registerForFormationUser

export default api

// Ajouter ces lignes à la fin du fichier pour réexporter les fonctions avec les noms attendus
export const updateFormation = updateFormationData
// export const registerForFormation = registerForFormationUser

// S'inscrire à une formation
// export const registerForFormation = async (formationId, userData) => {
//   try {
//     // Vérifier si nous avons un token avant d'envoyer la requête
//     const token = localStorage.getItem("token")
//     if (!token) {
//       throw new Error("Vous devez être connecté pour vous inscrire à une formation")
//     }

//     console.log(`Envoi de la demande d'inscription à: ${API_URL}/formations/${formationId}/inscriptions`);
//     console.log("Données envoyées:", userData);

//     const response = await api.post(`/formations/${formationId}/inscriptions`, userData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     })

//     return response.data
//   } catch (error) {
//     console.error("Erreur lors de l'inscription à la formation:", error)
//     throw error
//   }
// }

// Déclaration de getToken et handleApiError
const getToken = () => localStorage.getItem("token") || localStorage.getItem("businessToken")

const handleApiError = (error) => {
  console.error("API Error:", error)
  if (error.response) {
    console.error("Response data:", error.response.data)
    console.error("Response status:", error.response.status)
    console.error("Response headers:", error.response.headers)
  } else if (error.request) {
    console.error("No response received. Request:", error.request)
  } else {
    console.error("Error setting up the request:", error.message)
  }
}

const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorBody = await response.json()
    console.error("API Response Error:", errorBody)
    throw new Error(`API request failed with status ${response.status}: ${errorBody.message || "No message"}`)
  }
  return response.json()
}

export const rateFormation = async (formationId, ratingData) => {
  try {
    const response = await api.post(`/formations/${formationId}/rate`, ratingData)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la notation de la formation:", error)
    throw error
  }
}
