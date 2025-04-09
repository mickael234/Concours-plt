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

export const validateBusinessRegistration = (data) => {
  const errors = {}

  // Validation du nom de la structure
  if (!data.structureName || data.structureName.trim() === "") {
    errors.structureName = "Le nom de la structure est requis"
  }

  // Validation des activités
  const hasSelectedActivity = Object.values(data.activities).some((value) => value === true)
  if (!hasSelectedActivity) {
    errors.activities = "Veuillez sélectionner au moins une activité"
  }

  // Validation du nom
  if (!data.lastName || data.lastName.trim() === "") {
    errors.lastName = "Le nom est requis"
  }

  // Validation du prénom
  if (!data.firstName || data.firstName.trim() === "") {
    errors.firstName = "Le prénom est requis"
  }

  // Validation de la date de naissance
  if (!data.birthDate) {
    errors.birthDate = "La date de naissance est requise"
  } else {
    const birthDate = new Date(data.birthDate)
    const today = new Date()
    const minAge = 18
    const maxAge = 100

    // Calcul de l'âge
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < minAge) {
      errors.birthDate = "Vous devez avoir au moins 18 ans"
    } else if (age > maxAge) {
      errors.birthDate = "Veuillez vérifier la date de naissance"
    }
  }

  // Validation de l'email
  if (!data.email || data.email.trim() === "") {
    errors.email = "L'email est requis"
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)) {
    errors.email = "L'adresse email n'est pas valide"
  }

  // Validation du numéro de téléphone
  if (!data.phoneNumber || data.phoneNumber.trim() === "") {
    errors.phoneNumber = "Le numéro de téléphone est requis"
  } else if (!/^[0-9\s]{8,15}$/.test(data.phoneNumber.replace(/\s/g, ""))) {
    errors.phoneNumber = "Le numéro de téléphone n'est pas valide"
  }

  // Validation du mot de passe
  if (!data.password) {
    errors.password = "Le mot de passe est requis"
  } else if (data.password.length < 8) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères"
  } else if (!/\d/.test(data.password)) {
    errors.password = "Le mot de passe doit contenir au moins un chiffre"
  } else if (!/[A-Z]/.test(data.password)) {
    errors.password = "Le mot de passe doit contenir au moins une lettre majuscule"
  } else if (!/[a-z]/.test(data.password)) {
    errors.password = "Le mot de passe doit contenir au moins une lettre minuscule"
  } else if (!/[^A-Za-z0-9]/.test(data.password)) {
    errors.password = "Le mot de passe doit contenir au moins un caractère spécial"
  }

  // Validation de la confirmation du mot de passe
  if (!data.confirmPassword) {
    errors.confirmPassword = "Veuillez confirmer votre mot de passe"
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas"
  }

  return errors
}



