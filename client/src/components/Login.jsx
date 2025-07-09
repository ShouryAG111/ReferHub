import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  }) 
  const { email, password } = formData
  const { login, isAuthenticated, user, initialLoadComplete } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination from location state or default to dashboard
  const from = location.state?.from?.pathname || null

  useEffect(() => {
    // Only redirect if this is a successful login (not a page reload)
    // and we have completed the initial authentication check
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
    const result = await login(email, password)

    if (result.success) {
      // Navigation will happen in useEffect
    }
  }

  // Show login form even if user is authenticated (they might want to switch accounts)
  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Login</h2>

            {isAuthenticated && (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                You are already logged in as <strong>{user?.name}</strong>. You can continue to your dashboard or login
                with a different account.
              </div>
            )}

            <form onSubmit={onSubmit}>
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
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Login
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

export default Login
