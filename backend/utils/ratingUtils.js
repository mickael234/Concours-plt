/**
 * Calcule la note moyenne à partir d'un tableau de notes
 * @param {Array} ratings - Tableau d'objets contenant des notes
 * @returns {Number} - La note moyenne arrondie à une décimale
 */
export const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) {
      return 0
    }
  
    const sum = ratings.reduce((total, item) => total + item.rating, 0)
    const average = sum / ratings.length
  
    // Arrondir à une décimale
    return Math.round(average * 10) / 10
  }
  
  /**
   * Vérifie si un utilisateur a déjà noté un élément
   * @param {Array} ratings - Tableau d'objets contenant des notes
   * @param {String} userId - ID de l'utilisateur
   * @returns {Boolean} - True si l'utilisateur a déjà noté, sinon False
   */
  export const hasUserRated = (ratings, userId) => {
    if (!ratings || ratings.length === 0 || !userId) {
      return false
    }
  
    return ratings.some((rating) => rating.user.toString() === userId.toString())
  }
  
  /**
   * Obtient la note d'un utilisateur spécifique
   * @param {Array} ratings - Tableau d'objets contenant des notes
   * @param {String} userId - ID de l'utilisateur
   * @returns {Object|null} - L'objet de notation ou null si non trouvé
   */
  export const getUserRating = (ratings, userId) => {
    if (!ratings || ratings.length === 0 || !userId) {
      return null
    }
  
    return ratings.find((rating) => rating.user.toString() === userId.toString()) || null
  }
  
  