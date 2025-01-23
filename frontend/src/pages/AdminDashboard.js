import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import ConcoursManager from '../components/Admin/ConcoursManager';
import ResourceManager from '../components/Admin/ResourceManager';
import EstablishmentManager from '../components/Admin/EstablishmentManager';
import UserManager from '../components/Admin/UserManager';
import { BookOpen, Building2, GraduationCap, Users } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const StatCard = ({ title, value, description, icon: Icon }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <h3 className="stat-card-title">{title}</h3>
      <Icon className="stat-card-icon" />
    </div>
    <div className="stat-card-value">{value}</div>
    <p className="stat-card-description">{description}</p>
  </div>
);

const Statistics = ({ stats }) => (
  <div className="stats-grid">
    <StatCard
      title="Total des Concours"
      value={stats.totalConcours}
      description="Concours actifs et archivés"
      icon={GraduationCap}
    />
    <StatCard
      title="Établissements"
      value={stats.totalEstablishments}
      description="Centres et écoles partenaires"
      icon={Building2}
    />
    <StatCard
      title="Ressources"
      value={stats.totalResources}
      description="Documents et matériels de préparation"
      icon={BookOpen}
    />
    <StatCard
      title="Utilisateurs"
      value={stats.totalUsers}
      description="Utilisateurs inscrits"
      icon={Users}
    />
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [stats, setStats] = useState({
    totalConcours: 0,
    totalEstablishments: 0,
    totalResources: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/stats`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    };

    fetchStats();

    // Mise en place de la connexion WebSocket pour les mises à jour en temps réel
    const socket = new WebSocket('ws://localhost:5000');
    socket.onmessage = (event) => {
      const updatedStats = JSON.parse(event.data);
      setStats(updatedStats);
    };

    return () => {
      socket.close();
    };
  }, []);

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
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'statistics' && <Statistics stats={stats} />}
        {activeTab === 'concours' && <ConcoursManager />}
        {activeTab === 'establishments' && <EstablishmentManager />}
        {activeTab === 'resources' && <ResourceManager />}
        {activeTab === 'users' && <UserManager />}
      </main>
    </div>
  );
};

export default Dashboard;

