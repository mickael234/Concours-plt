import React, { useState, useEffect } from 'react';
import { getEstablishments, createEstablishment, updateEstablishment, deleteEstablishment } from '../../services/api';
import '../../styles/admin.css';

const EstablishmentManager = () => {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEstablishment, setEditingEstablishment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    contact: {
      address: '',
      phone: '',
      email: ''
    },
    socialMedia: []
  });

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const response = await getEstablishments();
      setEstablishments(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des établissements');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prevState => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSocialMediaChange = (index, field, value) => {
    setFormData(prevState => {
      const newSocialMedia = [...prevState.socialMedia];
      newSocialMedia[index] = { ...newSocialMedia[index], [field]: value };
      return { ...prevState, socialMedia: newSocialMedia };
    });
  };

  const addSocialMedia = () => {
    setFormData(prevState => ({
      ...prevState,
      socialMedia: [...prevState.socialMedia, { platform: '', url: '' }]
    }));
  };

  const removeSocialMedia = (index) => {
    setFormData(prevState => ({
      ...prevState,
      socialMedia: prevState.socialMedia.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEstablishment) {
        await updateEstablishment(editingEstablishment._id, formData);
      } else {
        await createEstablishment(formData);
      }
      fetchEstablishments();
      resetForm();
    } catch (err) {
      setError('Erreur lors de la sauvegarde de l\'établissement');
    }
  };

  const handleEdit = (establishment) => {
    setEditingEstablishment(establishment);
    setFormData({
      name: establishment.name,
      description: establishment.description,
      logo: establishment.logo,
      contact: establishment.contact,
      socialMedia: establishment.socialMedia
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) {
      try {
        await deleteEstablishment(id);
        fetchEstablishments();
      } catch (err) {
        setError('Erreur lors de la suppression de l\'établissement');
      }
    }
  };

  const resetForm = () => {
    setEditingEstablishment(null);
    setFormData({
      name: '',
      description: '',
      logo: '',
      contact: {
        address: '',
        phone: '',
        email: ''
      },
      socialMedia: []
    });
  };

  if (loading) return <div>Chargement des établissements...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">{editingEstablishment ? 'Modifier l\'Établissement' : 'Ajouter un Établissement'}</h1>
      </header>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Nom</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="logo" className="form-label">Logo URL</label>
          <input
            type="url"
            id="logo"
            name="logo"
            value={formData.logo}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact.address" className="form-label">Adresse</label>
          <input
            type="text"
            id="contact.address"
            name="contact.address"
            value={formData.contact.address}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact.phone" className="form-label">Téléphone</label>
          <input
            type="tel"
            id="contact.phone"
            name="contact.phone"
            value={formData.contact.phone}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact.email" className="form-label">Email</label>
          <input
            type="email"
            id="contact.email"
            name="contact.email"
            value={formData.contact.email}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Réseaux sociaux</label>
          {formData.socialMedia.map((social, index) => (
            <div key={index} className="social-media-input">
              <input
                type="text"
                placeholder="Plateforme"
                value={social.platform}
                onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                className="form-input"
              />
              <input
                type="url"
                placeholder="URL"
                value={social.url}
                onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                className="form-input"
              />
              <button type="button" onClick={() => removeSocialMedia(index)} className="button button-danger">Supprimer</button>
            </div>
          ))}
          <button type="button" onClick={addSocialMedia} className="button button-primary">Ajouter un réseau social</button>
        </div>
        <button type="submit" className="button button-primary">
          {editingEstablishment ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </form>

      <h2 className="admin-title">Liste des Établissements</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Adresse</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {establishments.map((e) => (
            <tr key={e._id}>
              <td>{e.name}</td>
              <td>{e.description.substring(0, 50)}...</td>
              <td>{e.contact.address}</td>
              <td>{e.contact.phone}</td>
              <td>{e.contact.email}</td>
              <td className="action-buttons">
                <button onClick={() => handleEdit(e)} className="button button-primary">Modifier</button>
                <button onClick={() => handleDelete(e._id)} className="button button-danger">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EstablishmentManager;



