import React, { useState, useEffect } from 'react';
import './StudyGroupForm.css';

const API_URL = 'http://localhost:5000/api';

const StudyGroupForm = () => {
  const [formData, setFormData] = useState({
    telephone: '',
    whatsapp: '',
    concours: '',
    ville: ''
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/groupe-etude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
      alert('Votre demande a été enregistrée avec succès !');
      setFormData({ telephone: '', whatsapp: '', concours: '', ville: '' });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de l\'enregistrement');
    }
  };

  return (
    <div className="study-group-form">
      <h2>Groupe d'étude</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="telephone">Téléphone <span className="required">*</span></label>
          <input
            type="tel"
            id="telephone"
            placeholder="Ex: +225 07 01 01 01 01"
            value={formData.telephone}
            onChange={(e) => setFormData({...formData, telephone: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="whatsapp">Whatsapp <span className="required">*</span></label>
          <input
            type="tel"
            id="whatsapp"
            placeholder="Ex: +225 07 01 01 01 01"
            value={formData.whatsapp}
            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="concours">Concours <span className="required">*</span></label>
          <select
            id="concours"
            value={formData.concours}
            onChange={(e) => setFormData({...formData, concours: e.target.value})}
            required
          >
            <option value="">Choisir un concours ...</option>
            {concoursList.map((concours) => (
              <option key={concours._id} value={concours._id}>
                {concours.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="ville">Ville/Commune <span className="required">*</span></label>
          <input
            type="text"
            id="ville"
            placeholder="Ex: Yopougon"
            value={formData.ville}
            onChange={(e) => setFormData({...formData, ville: e.target.value})}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Enregistrer</button>
      </form>
    </div>
  );
};

export default StudyGroupForm;

