const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin || "*");
    },
    credentials: true,
  }),
)

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  if (req.headers["x-auth-token"]) {
    console.log("Auth token present")
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", req.body)
  }
  next()
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message)
    process.exit(1)
  })

// Define Routes - Order matters!
console.log("Registering routes...")

app.use("/api/users", require("./routes/users"))
console.log("✓ Users routes registered")

app.use("/api/auth", require("./routes/auth"))
console.log("✓ Auth routes registered")

app.use("/api/profile", require("./routes/profile"))
console.log("✓ Profile routes registered")

app.use("/api/jobs", require("./routes/jobs"))
console.log("✓ Jobs routes registered")

app.use("/api/referrals", require("./routes/referrals"))
console.log("✓ Referrals routes registered")

// Test route to verify server is working
app.get("/api/test", (req, res) => {
  res.json({ msg: "Server is working!" })
})

// Route debugging middleware
app.use("/api/*", (req, res, next) => {
  console.log(`❌ Unmatched route: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ msg: `Route not found: ${req.method} ${req.originalUrl}` })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ msg: "Internal server error", error: err.message })
})

// Serve static assets in production
app.use(express.static(path.resolve(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});


// Setup scheduled task for auto-deletion of rejected referrals
const setupAutoDeleteTask = () => {
  const HOUR_IN_MS = 60 * 60 * 1000

  // Run the cleanup immediately on server start
  const runCleanup = async () => {
    try {
      console.log("Running cleanup task: Cleaning up rejected referrals...")

      // Calculate date 1 day ago
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)

      // Import Referral model
      const Referral = require("./models/Referral")

      // Find and delete rejected referrals older than 1 day
      const result = await Referral.deleteMany({
        status: "rejected",
        date: { $lt: oneDayAgo },
      })

      console.log(`Auto-deleted ${result.deletedCount} rejected referrals older than 1 day`)
      return result.deletedCount
    } catch (err) {
      console.error("Error running cleanup task:", err.message)
      return 0
    }
  }

  // Run cleanup immediately
  runCleanup()

  // Run the cleanup every hour
  setInterval(runCleanup, HOUR_IN_MS)

  console.log("Scheduled task for auto-deletion of rejected referrals has been set up")
}

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`MongoDB URI: ${process.env.MONGO_URI ? "✓ Set" : "❌ Not set"}`)
  console.log(`JWT Secret: ${process.env.JWT_SECRET ? "✓ Set" : "❌ Not set"}`)

  // Test all routes
  console.log("\n📋 Testing route registration:")
  console.log("Available routes:")
  console.log("- GET  /api/test")
  console.log("- POST /api/users")
  console.log("- GET  /api/auth")
  console.log("- POST /api/auth")
  console.log("- GET  /api/profile")
  console.log("- PUT  /api/profile")
  console.log("- GET  /api/jobs")
  console.log("- POST /api/jobs")
  console.log("- GET  /api/referrals/sent")
  console.log("- GET  /api/referrals/received")
  console.log("- POST /api/referrals")
  console.log("- PUT  /api/referrals/:id")
  console.log("- DELETE /api/referrals/:id")

  // Start the auto-deletion task
  setupAutoDeleteTask()
})

// Handle server shutdown gracefully
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Server closed")
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed")
      process.exit(0)
    })
  })
})

