import React, { useState, useEffect } from 'react';
import { getResources, createResource, updateResource, deleteResource } from '../../services/api';
import '../../styles/admin.css';

const ResourceManager = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'past_paper',
    description: '',
    fileUrl: '',
    subject: '',
    year: new Date().getFullYear(),
    price: 0,
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await getResources();
      setResources(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des ressources');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'price' || name === 'year' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await updateResource(editingResource._id, formData);
      } else {
        await createResource(formData);
      }
      fetchResources();
      resetForm();
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la ressource');
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      type: resource.type,
      description: resource.description,
      fileUrl: resource.fileUrl,
      subject: resource.subject,
      year: resource.year,
      price: resource.price,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      try {
        await deleteResource(id);
        fetchResources();
      } catch (err) {
        setError('Erreur lors de la suppression de la ressource');
      }
    }
  };

  const resetForm = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      type: 'past_paper',
      description: '',
      fileUrl: '',
      subject: '',
      year: new Date().getFullYear(),
      price: 0,
    });
  };

  if (loading) return <div>Chargement des ressources...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">{editingResource ? 'Modifier la Ressource' : 'Ajouter une Ressource'}</h1>
      </header>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Titre</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="type" className="form-label">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value="past_paper">Ancien sujet</option>
            <option value="course">Cours</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="fileUrl" className="form-label">URL du fichier</label>
          <input
            type="text"
            id="fileUrl"
            name="fileUrl"
            value={formData.fileUrl}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="subject" className="form-label">Matière</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="year" className="form-label">Année</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="price" className="form-label">Prix (FCFA)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
        <button type="submit" className="button button-primary">
          {editingResource ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </form>

      <h2 className="admin-title">Liste des Ressources</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Type</th>
            <th>Matière</th>
            <th>Année</th>
            <th>Prix</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r._id}>
              <td>{r.title}</td>
              <td>{r.type === 'past_paper' ? 'Ancien sujet' : 'Cours'}</td>
              <td>{r.subject}</td>
              <td>{r.year}</td>
              <td>{r.price} FCFA</td>
              <td className="action-buttons">
                <button onClick={() => handleEdit(r)} className="button button-primary">Modifier</button>
                <button onClick={() => handleDelete(r._id)} className="button button-danger">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResourceManager;
