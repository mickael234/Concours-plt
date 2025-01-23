import React from 'react';
import './ConcoursCard.css';

const ConcoursCard = ({ title, status, dateStart, dateEnd, rating, reviews, organizer, id }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star ${i <= rating ? 'filled' : ''}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="concours-card">
      <h3>{title}</h3>
      {status === 'en_cours' && (
        <div className="status-badge">
          <span className="rocket-icon">🚀</span>
          En cours
        </div>
      )}
      <div className="inscription-dates">
        <span>Inscription</span>
        <p>Du {dateStart} au {dateEnd}</p>
      </div>
      <div className="rating">
        <div className="stars">
          {renderStars(rating)}
        </div>
        <span className="reviews">
          Note: {rating} ({reviews} avis)
        </span>
      </div>
      <div className="organizer">
        <span>Organisé par:</span>
        <img src={organizer.logo} alt={organizer.name} className="organizer-logo" />
      </div>
      <button className="avis-button">
        Donner votre avis
      </button>
      <div className="card-id">#{id}</div>
    </div>
  );
};

export default ConcoursCard;

