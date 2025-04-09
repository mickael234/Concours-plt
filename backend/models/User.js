import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const educationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    school: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "ongoing"],
      default: "completed",
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
    },
    type: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const experienceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "ongoing"],
      default: "completed",
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const alertSchema = mongoose.Schema({
  concours: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Concours",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const notificationSettingsSchema = mongoose.Schema({
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  newConcours: {
    type: Boolean,
    default: true,
  },
  concoursUpdates: {
    type: Boolean,
    default: true,
  },
  newDocuments: {
    type: Boolean,
    default: true,
  },
  newFormations: {
    type: Boolean,
    default: true,
  },
})

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    // Ajout des champs pour le type d'utilisateur
    userType: {
      type: String,
      enum: ["user", "business", "employee", "admin"],
      default: "user",
    },
    type: {
      type: String,
      enum: ["user", "business", "employee", "admin"],
      default: "user",
    },
    // Référence à l'entreprise si l'utilisateur est un employé
    employeeOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },
    // Référence à l'entreprise si l'utilisateur est propriétaire
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },
    phone: {
      type: String,
    },
    birthDate: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    education: [educationSchema],
    experience: [experienceSchema],
    alerts: [alertSchema],
    downloadedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    notificationSettings: {
      type: notificationSettingsSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model("User", userSchema)

export default User
