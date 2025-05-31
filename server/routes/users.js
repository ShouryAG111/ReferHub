const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post("/", async (req, res) => {
  console.log("Registration request received")
  console.log("Request body:", req.body)

  const { name, email, password, role, yearsOfExperience, currentCompany, linkedinProfile } = req.body

  // Validate required fields
  if (!name || !email || !password || !role || yearsOfExperience === undefined || !currentCompany || !linkedinProfile) {
    console.log("Missing required fields")
    return res.status(400).json({
      msg: "Please provide all required fields: name, email, password, role, years of experience, current company, and LinkedIn profile",
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    console.log("Invalid email format")
    return res.status(400).json({ msg: "Please provide a valid email address" })
  }

  // Validate password length
  if (password.length < 6) {
    console.log("Password too short")
    return res.status(400).json({ msg: "Password must be at least 6 characters long" })
  }

  // Validate role
  if (!["jobseeker", "employer"].includes(role)) {
    console.log("Invalid role")
    return res.status(400).json({ msg: "Role must be either 'jobseeker' or 'employer'" })
  }

  // Validate years of experience
  const experience = Number.parseInt(yearsOfExperience)
  if (isNaN(experience) || experience < 0 || experience > 50) {
    console.log("Invalid years of experience")
    return res.status(400).json({ msg: "Years of experience must be a number between 0 and 50" })
  }

  // Validate LinkedIn URL
  const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
  if (!linkedinRegex.test(linkedinProfile)) {
    console.log("Invalid LinkedIn URL")
    return res
      .status(400)
      .json({ msg: "Please provide a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)" })
  }

  try {
    console.log("Checking if user exists with email:", email)
    let user = await User.findOne({ email })

    if (user) {
      console.log("User already exists")
      return res.status(400).json({ msg: "User already exists" })
    }

    console.log("Creating new user")
    user = new User({
      name,
      email,
      password,
      role,
      yearsOfExperience: experience,
      currentCompany,
      linkedinProfile,
    })

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    console.log("Saving user to database")
    await user.save()

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    }

    console.log("Generating JWT token")
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5 days" }, (err, token) => {
      if (err) {
        console.error("JWT signing error:", err)
        throw err
      }
      console.log("Registration successful")
      res.json({ token })
    })
  } catch (err) {
    console.error("Registration error:", err.message)
    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})

module.exports = router
