import asyncHandler from 'express-async-handler';
import Resource from '../models/Resource.js';

// @desc    Fetch all resources
// @route   GET /api/resources
// @access  Public
const getResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({});
  res.json(resources);
});

// @desc    Fetch single resource
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (resource) {
    res.json(resource);
  } else {
    res.status(404);
    throw new Error('Ressource non trouvée');
  }
});

// @desc    Create a resource
// @route   POST /api/resources
// @access  Private/Admin
const createResource = asyncHandler(async (req, res) => {
  const resource = new Resource({
    title: 'Titre de la ressource',
    type: 'past_paper',
    description: 'Description de la ressource',
    fileUrl: 'url_du_fichier',
    subject: 'Matière',
    year: new Date().getFullYear(),
  });

  const createdResource = await resource.save();
  res.status(201).json(createdResource);
});

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
const updateResource = asyncHandler(async (req, res) => {
  const {
    title,
    type,
    description,
    fileUrl,
    subject,
    year,
  } = req.body;

  const resource = await Resource.findById(req.params.id);

  if (resource) {
    resource.title = title;
    resource.type = type;
    resource.description = description;
    resource.fileUrl = fileUrl;
    resource.subject = subject;
    resource.year = year;

    const updatedResource = await resource.save();
    res.json(updatedResource);
  } else {
    res.status(404);
    throw new Error('Ressource non trouvée');
  }
});

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (resource) {
    await resource.remove();
    res.json({ message: 'Ressource supprimée' });
  } else {
    res.status(404);
    throw new Error('Ressource non trouvée');
  }
});

// @desc    Increment download count for a resource
// @route   PUT /api/resources/:id/download
// @access  Public
const incrementDownload = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (resource) {
    resource.downloads += 1;
    await resource.save();
    res.json({ message: 'Téléchargement comptabilisé' });
  } else {
    res.status(404);
    throw new Error('Ressource non trouvée');
  }
});

export {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  incrementDownload,
};

