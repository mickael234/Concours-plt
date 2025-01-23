import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEstablishmentById } from '../services/api';
import './EstablishmentDetail.css';

const EstablishmentDetail = () => {
  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({
    network: 0,
    teaching: 0,
    employability: 0
  });

  const { id } = useParams();

  useEffect(() => {
    const fetchEstablishment = async () => {
      try {
        const response = await getEstablishmentById(id);
        setEstablishment(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des informations de l\'établissement');
        setLoading(false);
      }
    };

    fetchEstablishment();
  }, [id]);

  const handleRating = (category, value) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const renderStars = (category, currentRating) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star ${star <= currentRating ? 'filled' : ''}`}
            onClick={() => handleRating(category, star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) return <div>Chargement des informations de l'établissement...</div>;
  if (error) return <div>{error}</div>;
  if (!establishment) return <div>Aucun établissement trouvé</div>;

  return (
    <div className="establishment-detail">
      <div className="establishment-header">
        <img 
          src={establishment.logo} 
          alt={establishment.name} 
          className="establishment-logo"
        />
        <h1>{establishment.name}</h1>
      </div>

      <div className="establishment-content">
        <div className="establishment-info">
          <section className="about-section">
            <h2>À propos de l'établissement</h2>
            <p>{establishment.description}</p>
          </section>

          <section className="contact-section">
            <h2>Contact</h2>
            <div className="contact-info">
              <p><strong>Adresse:</strong> {establishment.contact.address}</p>
              <p><strong>Téléphone:</strong> {establishment.contact.phone}</p>
              <p><strong>Email:</strong> {establishment.contact.email}</p>
            </div>
            <div className="social-links">
              {establishment.socialMedia.map(social => (
                <a 
                  key={social.platform} 
                  href={social.url}
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="rating-section">
          <h2>Noter l'établissement</h2>
          
          <div className="rating-category">
            <h3>Réseau</h3>
            {renderStars('network', ratings.network)}
          </div>

          <div className="rating-category">
            <h3>Qualité d'enseignement</h3>
            {renderStars('teaching', ratings.teaching)}
          </div>

          <div className="rating-category">
            <h3>Employabilité</h3>
            {renderStars('employability', ratings.employability)}
          </div>

          <button className="submit-rating">
            Soumettre l'évaluation
          </button>
        </div>

        <div className="reviews-section">
          <h2>Avis globaux</h2>
          <div className="global-ratings">
            <div className="rating-item">
              <span>Réseau</span>
              <div className="rating-bar">
                <div 
                  className="rating-fill"
                  style={{ width: `${establishment.averageRatings.network * 20}%` }}
                ></div>
              </div>
              <span>{establishment.averageRatings.network.toFixed(1)}/5</span>
            </div>
            <div className="rating-item">
              <span>Enseignement</span>
              <div className="rating-bar">
                <div 
                  className="rating-fill"
                  style={{ width: `${establishment.averageRatings.teaching * 20}%` }}
                ></div>
              </div>
              <span>{establishment.averageRatings.teaching.toFixed(1)}/5</span>
            </div>
            <div className="rating-item">
              <span>Employabilité</span>
              <div className="rating-bar">
                <div 
                  className="rating-fill"
                  style={{ width: `${establishment.averageRatings.employability * 20}%` }}
                ></div>
              </div>
              <span>{establishment.averageRatings.employability.toFixed(1)}/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentDetail;

