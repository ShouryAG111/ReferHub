const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()


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

//logging middleware
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

// Connecting to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message)
    process.exit(1)
  })

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


app.get("/api/test", (req, res) => {
  res.json({ msg: "Server is working!" })
})

app.use("/api/*", (req, res, next) => {
  console.log(`❌ Unmatched route: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ msg: `Route not found: ${req.method} ${req.originalUrl}` })
})

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ msg: "Internal server error", error: err.message })
})

app.use(express.static(path.resolve(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});



const setupAutoDeleteTask = () => {
  const HOUR_IN_MS = 60 * 60 * 1000

  // Run the cleanup immediately on server start
  const runCleanup = async () => {
    try {
      console.log("Running cleanup task: Cleaning up rejected referrals...")

      // Calculate date 1 day ago
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)

      
      const Referral = require("./models/Referral")

      
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


  runCleanup()


  setInterval(runCleanup, HOUR_IN_MS)

  console.log("Auto deployment using jenkins")
}

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`MongoDB URI: ${process.env.MONGO_URI ? "✓ Set" : "❌ Not set"}`)
  console.log(`JWT Secret: ${process.env.JWT_SECRET ? "✓ Set" : "❌ Not set"}`)



  
  setupAutoDeleteTask()
})


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

