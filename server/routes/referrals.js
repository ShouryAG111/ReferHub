const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const Referral = require("../models/Referral")
const Job = require("../models/Job")
const User = require("../models/User")

router.get("/sent", auth, async (req, res) => {
  try {
    // Check if user is an employer
    const user = await User.findById(req.user.id)

    if (user.role !== "employer") {
      return res.status(403).json({ msg: "Only employers can view sent referrals" })
    }

    const referrals = await Referral.find({ employer: req.user.id })
      .sort({ date: -1 })
      .populate("job", "company position")
      .populate("jobSeeker", "name email")


    const validReferrals = referrals.filter((referral) => referral.job && referral.jobSeeker)

    res.json(validReferrals)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})
 
router.get("/received", auth, async (req, res) => {
  try {

    const user = await User.findById(req.user.id)

    if (user.role !== "jobseeker") {
      return res.status(403).json({ msg: "Only job seekers can view received referrals" })
    }

    const referrals = await Referral.find({ jobSeeker: req.user.id })
      .sort({ date: -1 })
      .populate("job", "company position")
      .populate("employer", "name email yearsOfExperience currentCompany linkedinProfile")

    
    const validReferrals = referrals.filter((referral) => referral.job && referral.employer)

    res.json(validReferrals)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

router.get("/cleanup-rejected", async (req, res) => {
  try {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    console.log(`Looking for rejected referrals older than: ${oneDayAgo}`)
    
    const toDelete = await Referral.find({
      status: "rejected",
      date: { $lt: oneDayAgo },
    })
      .populate("job", "position company")
      .populate("jobSeeker", "name")

    console.log(`Found ${toDelete.length} rejected referrals to delete:`)
    toDelete.forEach((ref) => {
      if (ref.job && ref.jobSeeker) {
        console.log(`- ${ref.jobSeeker.name} for ${ref.job.position} at ${ref.job.company} (rejected on ${ref.date})`)
      }
    })

    
    const result = await Referral.deleteMany({
      status: "rejected",
      date: { $lt: oneDayAgo },
    })

    console.log(`Auto-deleted ${result.deletedCount} rejected referrals older than 1 day`)

    res.json({
      msg: `Auto-deleted ${result.deletedCount} rejected referrals older than 1 day`,
      deletedCount: result.deletedCount,
      cutoffDate: oneDayAgo,
      foundReferrals: toDelete.length,
    })
  } catch (err) {
    console.error("Error cleaning up rejected referrals:", err.message)
    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})


router.delete("/clear-all", auth, async (req, res) => {
  try {
    // Check if user is a job seeker
    const user = await User.findById(req.user.id)

    if (user.role !== "jobseeker") {
      return res.status(403).json({ msg: "Only job seekers can clear their referrals" })
    }

    console.log(`Clearing all referrals for job seeker: ${user.name} (ID: ${req.user.id})`)

    
    const referralsToDelete = await Referral.find({ jobSeeker: req.user.id })
      .populate("job", "position company")
      .populate("employer", "name")

    console.log(`Found ${referralsToDelete.length} referrals to delete:`)
    referralsToDelete.forEach((ref) => {
      if (ref.job && ref.employer) {
        console.log(`- ${ref.job.position} at ${ref.job.company} from ${ref.employer.name} (${ref.status})`)
      }
    })

    
    const result = await Referral.deleteMany({ jobSeeker: req.user.id })

    console.log(`Cleared ${result.deletedCount} referrals for ${user.name}`)

    res.json({
      msg: `Successfully cleared ${result.deletedCount} referrals`,
      deletedCount: result.deletedCount,
      userName: user.name,
    })
  } catch (err) {
    console.error("Error clearing all referrals:", err.message)
    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})


router.delete("/cleanup", auth, async (req, res) => {
  try {
    // Find all referrals
    const referrals = await Referral.find()

    let deletedCount = 0

    for (const referral of referrals) {
      
      const jobExists = await Job.findById(referral.job)

      if (!jobExists) {
        await Referral.findByIdAndDelete(referral._id)
        deletedCount++
      }
    }

    res.json({
      msg: `Cleanup completed. Removed ${deletedCount} referrals with deleted jobs.`,
      deletedCount,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})


router.get("/:id", auth, async (req, res) => {
  try {
    // Validate ObjectId format
    const mongoose = require("mongoose")
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid referral ID format" })
    }

    const referral = await Referral.findById(req.params.id)
      .populate("job", "company position location skills description jobId jobUrl")
      .populate("employer", "name email yearsOfExperience currentCompany linkedinProfile")
      .populate("jobSeeker", "name email")

    if (!referral) {
      return res.status(404).json({ msg: "Referral not found" })
    }

    // Make sure user is either the job seeker or employer involved in this referral
    if (referral.jobSeeker._id.toString() !== req.user.id && referral.employer._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized to view this referral" })
    }

    res.json(referral)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})


router.post("/", auth, async (req, res) => {
  try {
    // Check if user is an employer
    const user = await User.findById(req.user.id)

    if (user.role !== "employer") {
      return res.status(403).json({ msg: "Only employers can create referrals" })
    }

    const { job: jobId } = req.body

    // Validate input
    if (!jobId) {
      return res.status(400).json({ msg: "Job ID is required" })
    }

    // Find the job
    const job = await Job.findById(jobId)

    if (!job) {
      return res.status(404).json({ msg: "Job not found" })
    }

    // Check if referral already exists
    const existingReferral = await Referral.findOne({
      job: jobId,
      employer: req.user.id,
      jobSeeker: job.user,
    })

    if (existingReferral) {
      return res.status(400).json({ msg: "You have already sent a referral for this job" })
    }

    const newReferral = new Referral({
      job: jobId,
      jobSeeker: job.user,
      employer: req.user.id,
    })

    const referral = await newReferral.save()

    res.json(referral)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})


router.put("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body

    // Validate ObjectId format
    const mongoose = require("mongoose")
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid referral ID format" })
    }

    // Check if status is valid
    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" })
    }

    let referral = await Referral.findById(req.params.id)

    if (!referral) {
      return res.status(404).json({ msg: "Referral not found" })
    }

    // Make sure user is the job seeker who received the referral
    if (referral.jobSeeker.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" })
    }

    referral = await Referral.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true })

    res.json(referral)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route   DELETE api/referrals/:id
// @desc    Delete a referral (for employers)
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // Validate ObjectId format
    const mongoose = require("mongoose")
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid referral ID format" })
    }

    console.log(`DELETE request received for referral ID: ${req.params.id}`)
    console.log(`User ID: ${req.user.id}`)

    const referral = await Referral.findById(req.params.id)

    if (!referral) {
      console.log(`Referral not found: ${req.params.id}`)
      return res.status(404).json({ msg: "Referral not found" })
    }

    console.log(`Found referral. Employer: ${referral.employer}, Requesting user: ${req.user.id}`)

    // Make sure user is the employer who sent the referral
    if (referral.employer.toString() !== req.user.id) {
      console.log(`Authorization failed. Referral employer: ${referral.employer}, User: ${req.user.id}`)
      return res.status(401).json({ msg: "Not authorized to delete this referral" })
    }

    await referral.deleteOne()
    console.log(`Referral deleted successfully: ${req.params.id}`)
    res.json({ msg: "Referral removed successfully" })
  } catch (err) {
    console.error(`Error deleting referral ${req.params.id}:`, err.message)
    res.status(500).json({ msg: "Server Error", error: err.message })
  }
})

module.exports = router
