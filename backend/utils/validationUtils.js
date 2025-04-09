export const validateEstablishmentData = (data) => {
    const errors = {}
  
    if (!data.name || data.name.trim() === "") {
      errors.name = "Le nom de l'établissement est requis"
    }
  
    if (!data.description || data.description.trim() === "") {
      errors.description = "La description de l'établissement est requise"
    }
  
    if (!data.country || data.country.trim() === "") {
      errors.country = "Le pays est requis"
    }
  
    if (data.website && !isValidUrl(data.website)) {
      errors.website = "Veuillez entrer une URL valide pour le site web"
    }
  
    if (data.contact && data.contact.email && !isValidEmail(data.contact.email)) {
      errors.email = "Veuillez entrer une adresse email valide"
    }
  
    if (data.socialMedia && Array.isArray(data.socialMedia)) {
      data.socialMedia.forEach((social, index) => {
        if (social.url && !isValidUrl(social.url)) {
          errors[`socialMedia[${index}].url`] = "Veuillez entrer une URL valide pour le réseau social"
        }
      })
    }
  
    return errors
  }
  
  const isValidUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch (error) {
      return false
    }
  }
  
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  