/**
 * Utilitaires pour la gestion des images
 */

/**
 * Vérifie si une chaîne est une image encodée en base64
 * @param {string} str - La chaîne à vérifier
 * @returns {boolean} - True si c'est une image base64
 */
export const isBase64Image = (str) => {
    if (!str) return false
    return str.startsWith("data:image") || str.startsWith("data:application/octet-stream")
  }
  
  /**
   * Convertit une image base64 en Blob et crée une URL d'objet
   * @param {string} base64 - L'image encodée en base64
   * @returns {string} - L'URL de l'objet blob
   */
  export const base64ToObjectUrl = (base64) => {
    if (!base64 || !isBase64Image(base64)) return null
  
    try {
      // Extraire les données base64 (supprimer le préfixe data:image/...;base64,)
      const parts = base64.split(",")
      const byteString = atob(parts[1])
  
      // Déterminer le type MIME
      const mimeMatch = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64/)
      const mime = mimeMatch ? mimeMatch[1] : "image/png"
  
      // Convertir en tableau d'octets
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
  
      // Créer un blob et une URL d'objet
      const blob = new Blob([ab], { type: mime })
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error("Erreur lors de la conversion base64 en URL:", error)
      return null
    }
  }
  
  /**
   * Traite une URL d'image pour s'assurer qu'elle est valide
   * @param {string} url - L'URL de l'image
   * @returns {string} - L'URL traitée ou une image par défaut
   */
  export const processImageUrl = (url) => {
    if (!url) return "/placeholder.svg"
  
    // Si c'est une image base64, la convertir en URL d'objet
    if (isBase64Image(url)) {
      const objectUrl = base64ToObjectUrl(url)
      return objectUrl || "/placeholder.svg"
    }
  
    // Si c'est une URL relative, ajouter le préfixe du serveur
    if (!url.startsWith("http") && !url.startsWith("blob:") && !url.startsWith("data:")) {
      const serverBaseUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000"
      return url.startsWith("/") ? `${serverBaseUrl}${url}` : `${serverBaseUrl}/${url}`
    }
  
    return url
  }
  
  /**
   * Nettoie les URL d'objets pour éviter les fuites de mémoire
   * @param {string} url - L'URL de l'objet à nettoyer
   */
  export const revokeObjectUrl = (url) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url)
    }
  }
  
  