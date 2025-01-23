import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import EstablishmentDetail from './pages/EstablishmentDetail';
import ConcoursDetail from './pages/ConcoursDetail';
import Boutique from './pages/Boutique';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import PrepSection from './components/Preparation/PrepSection';
import StructureSearch from './components/Preparation/StructureSearch';
import StudyGroupForm from './components/Preparation/StudyGroupForm';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <div className="App flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/establishment/:id" element={<EstablishmentDetail />} />
                <Route path="/concours/:id" element={<ConcoursDetail />} />
                <Route path="/boutique" element={<Boutique />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/admin/*" 
                  element={
                    <PrivateRoute adminOnly={true}>
                      <AdminDashboard />
                    </PrivateRoute>
                  } 
                />
                <Route path="/preparation" element={<PrepSection />} />
                <Route path="/preparation/structures" element={<StructureSearch />} />
                <Route path="/preparation/groupe-etude" element={<StudyGroupForm />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

