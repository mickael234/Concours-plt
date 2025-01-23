import React, { useState, useEffect } from 'react';
import SearchSection from '../components/Search/SearchSection';
import ConcoursCard from '../components/Concours/ConcoursCard';
import PrepSection from '../components/Preparation/PrepSection';
import { getConcours } from '../services/api';
import './Home.css';

const Home = () => {
  const [featuredConcours, setFeaturedConcours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcours = async () => {
      try {
        setLoading(true);
        const response = await getConcours();
        setFeaturedConcours(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des concours:', err);
        setError('Erreur lors du chargement des concours. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchConcours();
  }, []);

  if (loading) return <div className="loading">Chargement des concours...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-page">
      <SearchSection />
      <main>
        <section id="concours" className="featured-concours">
          <h2>Concours en Vedette</h2>
          {featuredConcours.length > 0 ? (
            <div className="concours-grid">
              {featuredConcours.map((concours) => (
                <ConcoursCard key={concours._id} {...concours} />
              ))}
            </div>
          ) : (
            <p>Aucun concours disponible pour le moment.</p>
          )}
        </section>
        <PrepSection />
      </main>
    </div>
  );
};

export default Home;

