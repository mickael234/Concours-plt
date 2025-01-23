import asyncHandler from 'express-async-handler';
import StudyGroup from '../models/studyGroup.js';

// @desc    Register for a study group
// @route   POST /api/study-groups
// @access  Public
const registerStudyGroup = asyncHandler(async (req, res) => {
  const { telephone, whatsapp, concours, ville } = req.body;

  const studyGroup = await StudyGroup.create({
    telephone,
    whatsapp,
    concours,
    ville,
  });

  if (studyGroup) {
    res.status(201).json({
      _id: studyGroup._id,
      telephone: studyGroup.telephone,
      whatsapp: studyGroup.whatsapp,
      concours: studyGroup.concours,
      ville: studyGroup.ville,
    });
  } else {
    res.status(400);
    throw new Error('Données de groupe d\'étude invalides');
  }
});

// @desc    Get all study groups
// @route   GET /api/study-groups
// @access  Private/Admin
const getStudyGroups = asyncHandler(async (req, res) => {
  const studyGroups = await StudyGroup.find({}).populate('concours', 'name');
  res.json(studyGroups);
});

export { registerStudyGroup, getStudyGroups };

