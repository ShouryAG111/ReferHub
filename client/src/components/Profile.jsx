
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    yearsOfExperience: "",
    currentCompany: "",
    linkedinProfile: "",
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const { name, email, role, yearsOfExperience, currentCompany, linkedinProfile } = formData

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await axios.get("/api/profile")
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          role: res.data.role || "",
          yearsOfExperience: res.data.yearsOfExperience || "",
          currentCompany: res.data.currentCompany || "",
          linkedinProfile: res.data.linkedinProfile || "",
        })
        setLoading(false)
      } catch (err) {
        console.error("Error fetching profile:", err)
        toast.error("Failed to load profile")
        setLoading(false)
      }
    }

    fetchProfile()
  }, [isAuthenticated, navigate])

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    if (!yearsOfExperience || yearsOfExperience < 0 || yearsOfExperience > 50) {
      toast.error("Years of experience must be between 0 and 50")
      return
    }

    if (!currentCompany.trim()) {
      toast.error("Current company is required")
      return
    }

    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    if (!linkedinRegex.test(linkedinProfile)) {
      toast.error("Please provide a valid LinkedIn profile URL")
      return
    }

    try {
      setUpdating(true)
      const updateData = {
        name,
        yearsOfExperience: Number.parseInt(yearsOfExperience),
        currentCompany,
        linkedinProfile,
      }

      await axios.put("/api/profile", updateData)
      toast.success("Profile updated successfully! 🎉")
      setUpdating(false)
    } catch (err) {
      const errorMessage = err.response?.data?.msg || "Failed to update profile"
      toast.error(errorMessage)
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
        <p className="mt-2">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="card-title">My Profile</h2>
              <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">
                Back
              </button>
            </div>

            <form onSubmit={onSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={name}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={email}
                      disabled
                      title="Email cannot be changed"
                    />
                    <div className="form-text">Email cannot be changed</div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">
                      Account Type
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="role"
                      name="role"
                      value={role.charAt(0).toUpperCase() + role.slice(1)}
                      disabled
                      title="Account type cannot be changed"
                    />
                    <div className="form-text">Account type cannot be changed</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="yearsOfExperience" className="form-label">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      value={yearsOfExperience}
                      onChange={onChange}
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="currentCompany" className="form-label">
                  Current Company *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="currentCompany"
                  name="currentCompany"
                  value={currentCompany}
                  onChange={onChange}
                  placeholder="e.g., Google, Microsoft, Freelancer"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="linkedinProfile" className="form-label">
                  LinkedIn Profile *
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="linkedinProfile"
                  name="linkedinProfile"
                  value={linkedinProfile}
                  onChange={onChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  required
                />
                <div className="form-text">Please provide your full LinkedIn profile URL</div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
                <button type="button" onClick={() => navigate(-1)} className="btn btn-outline-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
