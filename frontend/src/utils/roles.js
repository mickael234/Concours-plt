// Définition des rôles dans le système
export const ROLES = {
    USER: "user", // Utilisateur standard
    BUSINESS: "business", // Entreprise/Organisation
    SUPERADMIN: "superadmin", // Super Administrateur (accès à tout)
  }
  
  // Permissions par rôle
  export const PERMISSIONS = {
    // Utilisateur standard
    [ROLES.USER]: {
      viewPublicContent: true,
      enrollInFormations: true,
      downloadDocuments: true,
      rateContent: true,
      manageOwnProfile: true,
    },
  
    // Entreprise
    [ROLES.BUSINESS]: {
      viewPublicContent: true,
      manageOwnProfile: true,
      manageOwnFormations: true,
      manageOwnDocuments: true,
      viewOwnEnrollments: true,
      viewOwnStatistics: true,
    },
  
    // Super Administrateur (accès à tout)
    [ROLES.SUPERADMIN]: {
      viewPublicContent: true,
      manageOwnProfile: true,
      manageAllConcours: true,
      manageAllEstablishments: true,
      manageAllResources: true,
      manageAllUsers: true,
      manageAllBusinesses: true,
      manageAllFormations: true,
      manageAllDocuments: true,
      manageAllEnrollments: true,
      manageAllStatistics: true,
    },
  }
  
  // Vérifier si un utilisateur a une permission spécifique
  export const hasPermission = (userRole, permission) => {
    if (!userRole || !PERMISSIONS[userRole]) return false
    return PERMISSIONS[userRole][permission] === true
  }
  
  