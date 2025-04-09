import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText, Calendar, User } from 'lucide-react';
import "./DocumentDetails.css";

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch(`/api/documents/${id}`);
        
        if (!response.ok) {
          throw new Error("Document non trouvé");
        }
        
        const data = await response.json();
        setDocument(data);
      } catch (error) {
        console.error("Error fetching document:", error);
        setError("Impossible de charger les détails du document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleDownload = async () => {
    try {
      // You might want to track downloads
      window.open(document.fileUrl, "_blank");
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  if (loading) {
    return <div className="loading-container">Chargement des détails du document...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Retour</button>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="not-found-container">
        <p>Document non trouvé</p>
        <button onClick={() => navigate(-1)}>Retour</button>
      </div>
    );
  }

  return (
    <div className="document-details-container">
      <div className="document-details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
      </div>

      <div className="document-details-content">
        <div className="document-details-main">
          <div className="document-icon">
            <FileText size={24} />
          </div>

          <div className="document-info">
            <h1 className="document-title">{document.title}</h1>
            
            <div className="document-meta">
              <div className="meta-item">
                <Calendar size={16} />
                <span>Ajouté le {new Date(document.createdAt).toLocaleDateString()}</span>
              </div>
              
              {document.business && (
                <div className="meta-item">
                  <User size={16} />
                  <span>Par {document.business.structureName}</span>
                </div>
              )}
              
              <div className="meta-item">
                <FileText size={16} />
                <span>{document.fileSize ? formatFileSize(document.fileSize) : "Taille inconnue"}</span>
              </div>
            </div>

            <div className="document-description">
              {document.description ? (
                <p>{document.description}</p>
              ) : (
                <p>Aucune description disponible pour ce document.</p>
              )}
            </div>

            <div className="document-price">
              {document.price > 0 ? (
                <span className="price">{document.price.toLocaleString()} FCFA</span>
              ) : (
                <span className="free">Gratuit</span>
              )}
            </div>

            <div className="document-actions">
              <button className="download-button" onClick={handleDownload}>
                <Download size={20} />
                <span>Télécharger</span>
              </button>
            </div>
          </div>
        </div>

        {document.concours && document.concours.length > 0 && (
          <div className="document-concours">
            <h2>Concours concernés</h2>
            <ul className="concours-list">
              {document.concours.map((concours) => (
                <li key={concours._id} className="concours-item">
                  {concours.title || concours.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetails;