import React, { useState, useEffect } from 'react';
import { getResources } from '../services/api';
import './Boutique.css';

const Boutique = () => {
  const [activeTab, setActiveTab] = useState('exams');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await getResources();
        setResources(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des ressources');
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) return <div>Chargement des ressources...</div>;
  if (error) return <div>{error}</div>;

  const exams = resources.filter(resource => resource.type === 'past_paper');
  const courses = resources.filter(resource => resource.type === 'course');

  return (
    <div className="boutique">
      <div className="boutique-header">
        <h1>Boutique</h1>
        <div className="boutique-tabs">
          <button 
            className={`tab-button ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('exams')}
          >
            Anciens sujets
          </button>
          <button 
            className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Cours
          </button>
        </div>
      </div>

      <div className="boutique-content">
        {activeTab === 'exams' ? (
          <div className="exams-grid">
            {exams.map(exam => (
              <div key={exam._id} className="exam-item">
                <div className="exam-header">
                  <h3>{exam.title}</h3>
                  <span className="exam-type">Sujet + Corrigé</span>
                </div>
                <div className="exam-info">
                  <p>Session: {exam.year}</p>
                  <p>Matière: {exam.subject}</p>
                </div>
                <div className="exam-footer">
                  <span className="price">{exam.price} FCFA</span>
                  <button className="btn-download">Télécharger</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course._id} className="course-item">
                <img 
                  src={course.imageUrl || "/course-thumbnail.jpg"}
                  alt={course.title} 
                  className="course-thumbnail"
                />
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span>{course.duration} heures de cours</span>
                    <span>•</span>
                    <span>{course.exerciseCount} exercices</span>
                  </div>
                  <div className="course-footer">
                    <span className="price">{course.price} FCFA</span>
                    <button className="btn-access">Accéder</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Boutique;

