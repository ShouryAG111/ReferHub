import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",      
    password2: "",
    role: "jobseeker",
    yearsOfExperience: "",
    currentCompany: "",
    linkedinProfile: "",
  })

  const { name, email, password, password2, role, yearsOfExperience, currentCompany, linkedinProfile } = formData
  const { register, isAuthenticated, user, initialLoadComplete } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || null

  useEffect(() => {
    if (isAuthenticated && initialLoadComplete && from !== location.pathname) {
      const redirectTo = from || (user?.role === "jobseeker" ? "/jobseeker/dashboard" : "/employer/dashboard")
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, user, navigate, from, location.pathname, initialLoadComplete])

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (password !== password2) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long")
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
      toast.error("Please provide a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)")
      return
    }

    const newUser = {
      name,
      email,
      password,
      role,
      yearsOfExperience: Number.parseInt(yearsOfExperience),
      currentCompany,
      linkedinProfile,
    }

    const result = await register(newUser)

    if (result.success) {
      // Navigation will happen in useEffect
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Register</h2>

            {isAuthenticated && (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                You are already logged in as <strong>{user?.name}</strong>. You can continue to your dashboard or
                register a new account.
              </div>
            )}

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
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={email}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password *
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={password}
                      onChange={onChange}
                      required
                      minLength="6"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="password2" className="form-label">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password2"
                      name="password2"
                      value={password2}
                      onChange={onChange}
                      required
                      minLength="6"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
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
                <div className="col-md-6">
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
                </div>
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
                <div className="form-text">
                  Please provide your full LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label d-block">Account Type *</label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="jobseeker"
                    value="jobseeker"
                    checked={role === "jobseeker"}
                    onChange={onChange}
                  />
                  <label className="form-check-label" htmlFor="jobseeker">
                    Job Seeker
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="employer"
                    value="employer"
                    checked={role === "employer"}
                    onChange={onChange}
                  />
                  <label className="form-check-label" htmlFor="employer">
                    Referrer
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Register
              </button>
            </form>

            {isAuthenticated && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => navigate(user?.role === "jobseeker" ? "/jobseeker/dashboard" : "/employer/dashboard")}
                  className="btn btn-outline-primary"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
