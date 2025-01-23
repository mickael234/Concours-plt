import mongoose from 'mongoose';

const establishmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
    },
    contact: {
      address: String,
      phone: String,
      email: String,
    },
    socialMedia: [
      {
        platform: String,
        url: String,
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        network: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        teaching: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        employability: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: String,
      },
    ],
    averageRatings: {
      network: { type: Number, default: 0 },
      teaching: { type: Number, default: 0 },
      employability: { type: Number, default: 0 },
    },
    numRatings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Establishment = mongoose.model('Establishment', establishmentSchema);

export default Establishment;

