export const validateConcoursData = (data) => {
  const errors = {}

  if (!data.title || data.title.trim() === "") {
    errors.title = "Le titre est requis"
  }

  if (!data.organizerName || data.organizerName.trim() === "") {
    errors.organizerName = "Le nom de l'organisateur est requis"
  }

  if (!data.description || data.description.trim() === "") {
    errors.description = "La description est requise"
  }

  if (!data.dateStart) {
    errors.dateStart = "La date de début est requise"
  }

  if (!data.dateEnd) {
    errors.dateEnd = "La date de fin est requise"
  }

  if (data.dateStart && data.dateEnd && new Date(data.dateStart) > new Date(data.dateEnd)) {
    errors.dateEnd = "La date de fin doit être postérieure à la date de début"
  }

  if (!data.registrationLink || data.registrationLink.trim() === "") {
    errors.registrationLink = "Le lien d'inscription est requis"
  } else if (!isValidUrl(data.registrationLink)) {
    errors.registrationLink = "Le lien d'inscription doit être une URL valide"
  }

  if (!data.category || data.category.trim() === "") {
    errors.category = "La catégorie est requise"
  }

  // Vérifiez que les conditions et les documents requis ne sont pas vides
  if (!data.conditions || data.conditions.length === 0 || data.conditions.every((c) => c.trim() === "")) {
    errors.conditions = "Au moins une condition de participation est requise"
  }

  if (
    !data.requiredDocuments ||
    data.requiredDocuments.length === 0 ||
    data.requiredDocuments.every((d) => d.trim() === "")
  ) {
    errors.requiredDocuments = "Au moins un document requis est nécessaire"
  }

  return errors
}

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

