const StarRating = ({ value, max = 5 }) => {
    return (
      <div className="rating-stars">
        {[...Array(max)].map((_, index) => (
          <span key={index} className={index < value ? "star filled" : "star"}>
            ★
          </span>
        ))}
      </div>
    )
  }
  
  const EstablishmentCard = ({ establishment, onClick }) => {
    const { _id, name, logo, country, averageRatings, numRatings = 0 } = establishment
  
    return (
      <div className="establishment-card" onClick={() => onClick(_id)}>
        <img src={logo || "/placeholder.svg"} alt={name} className="establishment-logo" />
        <h3>{name}</h3>
        <p>{country}</p>
        <div className="establishment-ratings">
          <div className="rating-item">
            <span>Réseau</span>
            <StarRating value={averageRatings?.network || 0} />
          </div>
          <div className="rating-item">
            <span>Qualité de l'enseignement</span>
            <StarRating value={averageRatings?.teaching || 0} />
          </div>
          <div className="rating-item">
            <span>Employabilité</span>
            <StarRating value={averageRatings?.employability || 0} />
          </div>
        </div>
        <p className="review-count">{numRatings} avis</p>
      </div>
    )
  }
  
  export default EstablishmentCard
  
  