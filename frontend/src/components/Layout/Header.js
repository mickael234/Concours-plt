import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">Concours Hub</Link>
        </div>
        <div className="header-right">
          <Link to="/boutique" className="boutique-link">
            <span>Boutique</span>
            <i className="shop-icon">🏪</i>
          </Link>
          <div className="site-type">
            <span>Changer de site : </span>
            <select className="site-select">
              <option>Particuliers</option>
              <option>Professionnels</option>
            </select>
          </div>
          {userInfo ? (
            <>
              <span className="user-name">Bonjour, {userInfo.name}</span>
              {userInfo.role === 'admin' && (
                <Link to="/admin" className="btn-admin">Tableau de bord Admin</Link>
              )}
              <button onClick={handleLogout} className="btn-logout">Se déconnecter</button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-connect">Se connecter</Link>
              <Link to="/register" className="btn-register">S'inscrire</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

