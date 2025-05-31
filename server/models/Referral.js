const mongoose = require("mongoose")

const ReferralSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "job",
    required: true,
  },
  jobSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("referral", ReferralSchema)
