import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getConcoursById } from '../services/api';
import './ConcoursDetail.css';

const ConcoursDetail = () => {
  const [concours, setConcours] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const { id } = useParams();

  useEffect(() => {
    const fetchConcours = async () => {
      try {
        const response = await getConcoursById(id);
        setConcours(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du concours:', error);
      }
    };
    fetchConcours();
  }, [id]);

  if (!concours) return <div>Chargement...</div>;

  return (
    <div className="concours-detail">
      <div className="concours-header" style={{ backgroundImage: `url(${concours.backgroundImage || '/placeholder.svg?height=400&width=1200'})` }}>
        <h1>{concours.title}</h1>
        <h2>{concours.organization}</h2>
      </div>

      <div className="concours-nav">
        <button 
          className={`nav-button ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          À propos
        </button>
        <button 
          className={`nav-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Avis
        </button>
      </div>

      <div className="concours-content">
        <div className="session-info">
          <h3>SESSION: {concours.year}</h3>
          <div className="inscription-dates">
            <p>Début inscription: {new Date(concours.dateStart).toLocaleDateString('fr-FR')}</p>
            <p>Fin inscription: {new Date(concours.dateEnd).toLocaleDateString('fr-FR')}</p>
            {concours.registrationLink && (
              <a href={concours.registrationLink} className="inscription-link">
                Lien inscription
              </a>
            )}
          </div>
        </div>

        <section className="presentation">
          <h2>Présentation générale</h2>
          <div dangerouslySetInnerHTML={{ __html: concours.description }} />
        </section>

        <section className="documents">
          <h2>Documents et formations pour préparer ce concours</h2>
          <div className="documents-grid">
            {concours.documents?.map((doc, index) => (
              <div key={index} className="document-card">
                <img src={doc.thumbnail} alt={doc.title} />
                <div className="document-info">
                  <h4>{doc.title}</h4>
                  <p>{doc.type}</p>
                  <div className="rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`star ${i < doc.rating ? 'filled' : ''}`}>★</span>
                    ))}
                    <span>({doc.reviewCount} avis)</span>
                  </div>
                  <p className="price">{doc.price ? `${doc.price} FCFA` : 'Gratuit'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="conditions">
          <h2>Conditions de participation</h2>
          <ul>
            {concours.conditions?.map((condition, index) => (
              <li key={index}>{condition}</li>
            ))}
          </ul>
        </section>

        <section className="required-documents">
          <h2>Documents Requis</h2>
          <ul>
            {concours.requiredDocuments?.map((doc, index) => (
              <li key={index}>{doc}</li>
            ))}
          </ul>
        </section>

        <section className="timeline">
          <h2>Les étapes</h2>
          <div className="timeline-steps">
            {concours.steps?.map((step, index) => (
              <div key={index} className="timeline-step">
                <div className="step-marker"></div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p className="step-date">{step.date}</p>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ConcoursDetail;

