import { Star } from "lucide-react"

const RatingDisplay = ({ ratings = [], averageRatings = {} }) => {
  // Ensure averageRatings has all required properties
  const safeAverageRatings = {
    teaching: 0,
    employability: 0,
    network: 0,
    overall: 0,
    ...averageRatings,
  }

  const renderStars = (rating) => {
    // Ensure rating is a number
    const ratingValue = Number(rating) || 0

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${star <= ratingValue ? "filled" : ""}`}>
            <Star className={`h-5 w-5 ${star <= ratingValue ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="rating-display">
      <div className="average-ratings">
        <div className="rating-category">
          <h3>Qualité de l'enseignement</h3>
          <div className="rating-value">
            {renderStars(safeAverageRatings.teaching)}
            <span className="rating-number">{safeAverageRatings.teaching.toFixed(1)}</span>
          </div>
        </div>
        <div className="rating-category">
          <h3>Employabilité</h3>
          <div className="rating-value">
            {renderStars(safeAverageRatings.employability)}
            <span className="rating-number">{safeAverageRatings.employability.toFixed(1)}</span>
          </div>
        </div>
        <div className="rating-category">
          <h3>Réseau</h3>
          <div className="rating-value">
            {renderStars(safeAverageRatings.network)}
            <span className="rating-number">{safeAverageRatings.network.toFixed(1)}</span>
          </div>
        </div>
        <div className="rating-category overall">
          <h3>Note globale</h3>
          <div className="rating-value">
            {renderStars(safeAverageRatings.overall)}
            <span className="rating-number">{safeAverageRatings.overall.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {ratings.length > 0 && (
        <div className="user-ratings">
          <h3>Commentaires des utilisateurs</h3>
          {ratings.map((rating, index) => (
            <div key={index} className="user-rating">
              <div className="rating-header">
                <span className="user-name">
                  {rating.user?.firstName && rating.user?.lastName
                    ? `${rating.user.firstName} ${rating.user.lastName}`
                    : rating.user?.name || "Utilisateur anonyme"}
                </span>
                <span className="rating-date">
                  {rating.createdAt ? new Date(rating.createdAt).toLocaleDateString() : "Date inconnue"}
                </span>
              </div>
              <div className="rating-categories">
                <div className="category">
                  <span>Enseignement:</span>
                  {renderStars(rating.teaching)}
                </div>
                <div className="category">
                  <span>Employabilité:</span>
                  {renderStars(rating.employability)}
                </div>
                <div className="category">
                  <span>Réseau:</span>
                  {renderStars(rating.network)}
                </div>
              </div>
              {rating.comment && <p className="comment">{rating.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RatingDisplay
