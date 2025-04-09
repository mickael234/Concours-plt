export const validateResource = (data) => {
    const errors = {}
  
    if (!data.title || data.title.trim() === "") {
      errors.title = "Le titre est requis"
    }
  
    if (!data.type || !["past_paper", "course"].includes(data.type)) {
      errors.type = "Le type doit être 'past_paper' ou 'course'"
    }
  
    if (!data.description || data.description.trim() === "") {
      errors.description = "La description est requise"
    }
  
    if (!data.fileUrl || data.fileUrl.trim() === "") {
      errors.fileUrl = "L'URL du fichier est requise"
    }
  
    if (!data.subject || data.subject.trim() === "") {
      errors.subject = "La matière est requise"
    }
  
    if (!data.year || isNaN(data.year) || data.year < 1900 || data.year > new Date().getFullYear()) {
      errors.year = "L'année doit être valide"
    }
  
    if (data.price === undefined || isNaN(data.price) || data.price < 0) {
      errors.price = "Le prix doit être un nombre positif ou zéro"
    }
  
    return errors
  }
  
  