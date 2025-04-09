import React, { useState, useEffect } from 'react';
import './StructureSearch.css';

const API_URL = 'http://localhost:5000/api';

const StructureSearch = () => {
  const [selectedConcours, setSelectedConcours] = useState('');
  const [structures, setStructures] = useState([]);
  const [concoursList, setConcoursList] = useState([]);

  useEffect(() => {
    const fetchConcours = async () => {
      try {
        const response = await fetch(`${API_URL}/concours`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des concours');
        const data = await response.json();
        setConcoursList(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchConcours();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/structures?concours=${selectedConcours}`);
      if (!response.ok) throw new Error('Erreur lors de la recherche');
      const data = await response.json();
      setStructures(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="structure-search">
      <h2>Structure de formation pour me préparer</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="concours">Pour quel concours cherchez-vous une structure ?</label>
          <select
            id="concours"
            value={selectedConcours}
            onChange={(e) => setSelectedConcours(e.target.value)}
          >
            <option value="">Tous les concours</option>
            {concoursList.map((concours) => (
              <option key={concours._id} value={concours._id}>
                {concours.title}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Rechercher</button>
      </form>

      <div className="search-results">
        <p className="filters">Filtres appliqués : {selectedConcours ? concoursList.find(c => c._id === selectedConcours)?.title : 'Aucun'}</p>
        
        {structures.length === 0 ? (
          <div className="no-results">
            <p>Nous préparons l'arrivée des structures de préparation aux concours sur Concours CI.</p>
          </div>
        ) : (
          <div className="structures-list">
            {structures.map((structure) => (
              <div key={structure._id} className="structure-card">
                <h3>{structure.name}</h3>
                <p>{structure.description}</p>
                <div className="structure-details">
                  <p><strong>Adresse:</strong> {structure.address}</p>
                  <p><strong>Contact:</strong> {structure.contact}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StructureSearch;

