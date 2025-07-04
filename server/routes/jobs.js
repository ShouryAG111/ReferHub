const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const Job = require("../models/Job")
const User = require("../models/User")
const mongoose = require("mongoose")


router.get("/", auth, async (req, res) => {

  try {
    const jobs = await Job.find()
      .sort({ date: -1 })
      .populate("user", "name email yearsOfExperience currentCompany linkedinProfile")
    res.json(jobs)
  } catch (err) {
    console.error("Error fetching all jobs:", err.message)
    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})


router.get("/user", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id })
      .sort({ date: -1 })
      .populate("user", "name email yearsOfExperience currentCompany linkedinProfile")
    res.json(jobs)
  } catch (err) {
    console.error("Error fetching user jobs:", err.message)
    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})


router.get("/:id", auth, async (req, res) => {
  try {
   
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid job ID format" })
    }

    console.log(`Fetching job with ID: ${req.params.id}`)
    const job = await Job.findById(req.params.id).populate(
      "user",
      "name email yearsOfExperience currentCompany linkedinProfile",
    )

    if (!job) {
      console.log(`Job with ID ${req.params.id} not found`)
      return res.status(404).json({ msg: "Job not found" })
    }

    console.log(`Job found: ${job.position} at ${job.company}`)
    res.json(job)
  } catch (err) {
    console.error(`Error fetching job ${req.params.id}:`, err.message)

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Job not found - invalid ID format" })
    }

    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})


router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    if (user.role !== "jobseeker") {
      return res.status(403).json({ msg: "Only job seekers can post jobs" })
    }

    if (!user.yearsOfExperience && user.yearsOfExperience !== 0) {
      return res.status(400).json({
        msg: "Please complete your profile with years of experience before posting a job. Go to Profile → Update your information.",
      })
    }

    if (!user.currentCompany) {
      return res.status(400).json({
        msg: "Please complete your profile with current company before posting a job. Go to Profile → Update your information.",
      })
    }

    if (!user.linkedinProfile) {
      return res.status(400).json({
        msg: "Please complete your profile with LinkedIn profile before posting a job. Go to Profile → Update your information.",
      })
    }

    const { company, position, jobId, jobUrl, location, skills, description } = req.body

   
    if (!company || !position || !jobId || !jobUrl || !location || !skills || !description) {
      return res.status(400).json({ msg: "Please provide all required fields" })
    }

    const newJob = new Job({
      company,
      position,
      jobId,
      jobUrl,
      location,
      skills: Array.isArray(skills) ? skills : skills.split(",").map((skill) => skill.trim()),
      description,
      user: req.user.id,
    })

    const job = await newJob.save()

    const populatedJob = await Job.findById(job._id).populate(
      "user",
      "name email yearsOfExperience currentCompany linkedinProfile",
    )

    console.log(`Job created successfully by ${user.name}: ${job.position} at ${job.company}`)
    res.json(populatedJob)
  } catch (err) {
    console.error("Error creating job:", err.message)
    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})


router.put("/:id", auth, async (req, res) => {
  try {
  
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid job ID format" })
    }

    let job = await Job.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ msg: "Job not found" })
    }

    if (job.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" })
    }

    const { company, position, jobId, jobUrl, location, skills, description } = req.body

    // Build job object
    const jobFields = {}
    if (company) jobFields.company = company
    if (position) jobFields.position = position
    if (jobId) jobFields.jobId = jobId
    if (jobUrl) jobFields.jobUrl = jobUrl
    if (location) jobFields.location = location
    if (skills){
      jobFields.skills = Array.isArray(skills) ? skills : skills.split(",").map((skill) => skill.trim())
    }
    if (description) jobFields.description = description

    job = await Job.findByIdAndUpdate(req.params.id, { $set: jobFields }, { new: true }).populate(
      "user",
      "name email yearsOfExperience currentCompany linkedinProfile",
    )

    res.json(job)
  } catch (err) {
    console.error(`Error updating job ${req.params.id}:`, err.message)
    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})


router.delete("/:id", auth, async (req, res) => {
  try {
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid job ID format" })
    }

    const job = await Job.findById(req.params.id)

    if (!job){
      return res.status(404).json({ msg: "Job not found" })
    }

    // Making sure user owns the job
    if (job.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" })
    }

    await job.deleteOne()
    res.json({ msg: "Job removed" })
  } catch (err) {
    console.error(`Error deleting job ${req.params.id}:`, err.message)

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Job not found - invalid ID format" })
    }

    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})

module.exports = router
