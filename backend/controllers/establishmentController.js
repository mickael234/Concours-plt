import asyncHandler from 'express-async-handler';
import Establishment from '../models/Establishment.js';

// @desc    Fetch all establishments
// @route   GET /api/establishments
// @access  Public
const getEstablishments = asyncHandler(async (req, res) => {
  const establishments = await Establishment.find({});
  res.json(establishments);
});

// @desc    Fetch single establishment
// @route   GET /api/establishments/:id
// @access  Public
const getEstablishmentById = asyncHandler(async (req, res) => {
  const establishment = await Establishment.findById(req.params.id);

  if (establishment) {
    res.json(establishment);
  } else {
    res.status(404);
    throw new Error('Établissement non trouvé');
  }
});

// @desc    Create an establishment
// @route   POST /api/establishments
// @access  Private/Admin
const createEstablishment = asyncHandler(async (req, res) => {
  const establishment = new Establishment({
    name: 'Nom de l\'établissement',
    description: 'Description de l\'établissement',
    contact: {
      address: 'Adresse',
      phone: 'Numéro de téléphone',
      email: 'email@example.com',
    },
    socialMedia: [],
  });

  const createdEstablishment = await establishment.save();
  res.status(201).json(createdEstablishment);
});

// @desc    Update an establishment
// @route   PUT /api/establishments/:id
// @access  Private/Admin
const updateEstablishment = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    contact,
    socialMedia,
  } = req.body;

  const establishment = await Establishment.findById(req.params.id);

  if (establishment) {
    establishment.name = name;
    establishment.description = description;
    establishment.contact = contact;
    establishment.socialMedia = socialMedia;

    const updatedEstablishment = await establishment.save();
    res.json(updatedEstablishment);
  } else {
    res.status(404);
    throw new Error('Établissement non trouvé');
  }
});

// @desc    Delete an establishment
// @route   DELETE /api/establishments/:id
// @access  Private/Admin
const deleteEstablishment = asyncHandler(async (req, res) => {
  const establishment = await Establishment.findById(req.params.id);

  if (establishment) {
    await establishment.remove();
    res.json({ message: 'Établissement supprimé' });
  } else {
    res.status(404);
    throw new Error('Établissement non trouvé');
  }
});

// @desc    Add a rating to an establishment
// @route   POST /api/establishments/:id/ratings
// @access  Private
const addEstablishmentRating = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const establishment = await Establishment.findById(req.params.id);

  if (establishment) {
    const alreadyRated = establishment.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyRated) {
      res.status(400);
      throw new Error('Établissement déjà noté');
    }

    const newRating = {
      user: req.user._id,
      rating,
      comment,
    };

    establishment.ratings.push(newRating);
    establishment.numRatings = establishment.ratings.length;
    establishment.averageRating =
      establishment.ratings.reduce((acc, item) => item.rating + acc, 0) /
      establishment.ratings.length;

    await establishment.save();
    res.status(201).json({ message: 'Note ajoutée' });
  } else {
    res.status(404);
    throw new Error('Établissement non trouvé');
  }
});

export {
  getEstablishments,
  getEstablishmentById,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
  addEstablishmentRating,
};

