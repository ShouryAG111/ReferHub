const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const User = require("../models/User")


router.get("/", auth, async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    res.json(user)
  }
   catch (err) {
    console.error("Error fetching profile:", err.message)
    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})


router.put("/", auth, async (req, res) => {
  try {
    const { name, yearsOfExperience, currentCompany, linkedinProfile } = req.body

    // Validate required fields
    if (!name || yearsOfExperience === undefined || !currentCompany || !linkedinProfile) {
      return res.status(400).json({
        msg: "Please provide all required fields: name, years of experience, current company, and LinkedIn profile",
      })
    }

    // Validate years of experience
    if (yearsOfExperience < 0 || yearsOfExperience > 50){
      return res.status(400).json({ msg: "Years of experience must be between 0 and 50" })
    }

    // Validate LinkedIn URL
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    if (!linkedinRegex.test(linkedinProfile)) {
      return res.status(400).json({ msg: "Please provide a valid LinkedIn profile URL" })
    }

    // Build profile object
    const profileFields = {
      name,
      yearsOfExperience: Number.parseInt(yearsOfExperience),
      currentCompany,
      linkedinProfile,
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: profileFields }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    res.json(user)
  } catch (err) {
    console.error("Error updating profile:", err.message)
    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})

module.exports = router
