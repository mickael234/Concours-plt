import mongoose from "mongoose"

const concoursSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
    },
    organizerName: {
      type: String,
      required: [true, "Le nom de l'organisateur est requis"],
      trim: true,
    },
    organizerLogo: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
    },
    category: {
      type: String,
      enum: ["direct", "professionnel"],
      required: [true, "La catégorie est requise"],
    },
    status: {
      type: String,
      enum: ["en_cours", "termine", "a_venir"],
      default: "a_venir",
      required: [true, "Le statut est requis"],
    },
    dateStart: {
      type: Date,
      required: [true, "La date de début est requise"],
    },
    dateEnd: {
      type: Date,
      required: [true, "La date de fin est requise"],
    },
    registrationLink: {
      type: String,
      required: [true, "Le lien d'inscription est requis"],
    },
    conditions: [
      {
        type: String,
        required: [true, "Au moins une condition de participation est requise"],
      },
    ],
    requiredDocuments: [
      {
        type: String,
        required: [true, "Au moins un document requis est nécessaire"],
      },
    ],
    steps: [
      {
        title: {
          type: String,
          required: [true, "Le titre de l'étape est requis"],
        },
        date: {
          type: Date,
          required: [true, "La date de l'étape est requise"],
        },
        description: {
          type: String,
          required: [true, "La description de l'étape est requise"],
        },
      },
    ],
    documents: [
      {
        title: {
          type: String,
          required: [true, "Le titre du document est requis"],
        },
        type: {
          type: String,
          required: [true, "Le type de document est requis"],
        },
        url: {
          type: String,
          required: [true, "L'URL du document est requise"],
        },
        thumbnail: String,
        rating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0,
        },
        reviewCount: {
          type: Number,
          default: 0,
        },
        price: {
          type: Number,
          min: 0,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
  },
  {
    timestamps: true,
  },
)

const Concours = mongoose.models.Concours || mongoose.model("Concours", concoursSchema)

export default Concours

