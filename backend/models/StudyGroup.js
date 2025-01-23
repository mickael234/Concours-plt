import mongoose from 'mongoose';

const studyGroupSchema = new mongoose.Schema({
  telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
  },
  whatsapp: {
    type: String,
    required: [true, 'Le numéro WhatsApp est requis'],
  },
  concours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Concours',
    required: [true, 'Le concours est requis'],
  },
  ville: {
    type: String,
    required: [true, 'La ville est requise'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);

export default StudyGroup;

