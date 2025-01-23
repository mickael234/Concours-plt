export const validateConcoursData = (data) => {
    const errors = {}
  
    if (!data.title) errors.title = "Le titre est requis"
    if (!data.organization) errors.organization = "L'organisation est requise"
    if (!data.description) errors.description = "La description est requise"
    if (!data.year) errors.year = "L'année est requise"
    if (!data.dateStart) errors.dateStart = "La date de début est requise"
    if (!data.dateEnd) errors.dateEnd = "La date de fin est requise"
    if (new Date(data.dateEnd) <= new Date(data.dateStart)) {
      errors.dateEnd = "La date de fin doit être postérieure à la date de début"
    }
  
    // Ajoutez d'autres validations si nécessaire
  
    return errors
  }
  
  