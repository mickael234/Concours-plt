import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PrepSection.css';

const API_URL = 'http://localhost:5000/api';

const PrepSection = () => {
  const [stats, setStats] = useState({
    totalResources: 0,
    totalStructures: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/stats/prep`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchStats();

    // Mise en place WebSocket pour les mises à jour en temps réel
    const socket = new WebSocket('ws://localhost:5000');
    socket.onmessage = (event) => {
      const updatedStats = JSON.parse(event.data);
      setStats(updatedStats);
    };

    return () => socket.close();
  }, []);

  const prepOptions = [
    {
      title: "Je recherche des anciens sujets et fascicules pour me préparer",
      count: `${stats.totalResources} anciens sujets et fascicules disponibles`,
      image: "/images/study-alone.jpg",
      link: "/boutique"
    },
    {
      title: "Je recherche une structure de formation pour me préparer",
      count: `${stats.totalStructures} structures de formation disponibles`,
      image: "/images/study-class.jpg",
      link: "/preparation/structures"
    },
    {
      title: "Je veux intégrer un groupe d'étude pour me préparer",
      image: "/images/study-group.jpg",
      link: "/preparation/groupe-etude"
    }
  ];

  return (
    <section className="prep-section">
      <h2>Se préparer pour présenter un concours</h2>
      <div className="prep-options">
        {prepOptions.map((option, index) => (
          <Link to={option.link} key={index} className="prep-card">
            <img src={option.image || "/placeholder.svg"} alt={option.title} />
            <div className="prep-card-content">
              <h3>{option.title}</h3>
              {option.count && <p>{option.count}</p>}
            </div>
          </Link>
        ))}
      </div>
      <div className="academy-section">
        <div className="academy-card">
          <img src="/images/academy-logo.png" alt="Concours Hub Academy" />
          <h3>CONCOURS HUB ACADEMY</h3>
        </div>
        <div className="pagination">
          <button className="prev-btn">←</button>
          <span>Page: 1/1</span>
          <button className="next-btn">→</button>
        </div>
      </div>
    </section>
  );
};

export default PrepSection;

