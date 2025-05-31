const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
    enum: ["jobseeker", "employer"],
    required: true,
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0,
    max: 50,
  },
  currentCompany: {
    type: String,
    required: true,
  },
  linkedinProfile: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(v),
      message: "Please provide a valid LinkedIn profile URL",
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("user", UserSchema)
