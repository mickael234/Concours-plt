import React, { useState, useEffect } from 'react';
import './Admin.css';
import ConcoursManager from './ConcoursManager';
import ResourceManager from './ResourceManager';
import EstablishmentManager from './EstablishmentManager';
import Statistics from './Statistics';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [stats, setStats] = useState({
    totalConcours: 0,
    totalUsers: 0,
    totalEstablishments: 0,
    totalResources: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats from backend
    // This is a placeholder. Replace with actual API call
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Replace this with an actual API call
    setStats({
      totalConcours: 150,
      totalUsers: 5000,
      totalEstablishments: 75,
      totalResources: 200,
    });
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Tableau de Bord Administrateur</h1>
        <div className="user-info">
          <img src="/admin-avatar.png" alt="Admin" className="admin-avatar" />
          <span>Admin Name</span>
        </div>
      </header>
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'statistics' ? 'active' : ''} 
          onClick={() => setActiveTab('statistics')}
        >
          Statistiques
        </button>
        <button 
          className={activeTab === 'concours' ? 'active' : ''} 
          onClick={() => setActiveTab('concours')}
        >
          Gestion des Concours
        </button>
        <button 
          className={activeTab === 'establishments' ? 'active' : ''} 
          onClick={() => setActiveTab('establishments')}
        >
          Établissements
        </button>
        <button 
          className={activeTab === 'resources' ? 'active' : ''} 
          onClick={() => setActiveTab('resources')}
        >
          Ressources
        </button>
      </nav>
      <main className="dashboard-content">
        {activeTab === 'statistics' && <Statistics stats={stats} />}
        {activeTab === 'concours' && <ConcoursManager />}
        {activeTab === 'establishments' && <EstablishmentManager />}
        {activeTab === 'resources' && <ResourceManager />}
      </main>
    </div>
  );
};

export default Dashboard;

