

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"

const JobDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [referralSent, setReferralSent] = useState(false)
  const [referralLoading, setReferralLoading] = useState(false)

  useEffect(() => {
    const fetchJob = async () =>{
      try {
        setLoading(true)
        setError(null)

        console.log(`Fetching job details for ID: ${id}`)
        const res = await axios.get(`/api/jobs/${id}`)

        if (!res.data) {
          throw new Error("No job data returned from server")
        }

        console.log("Job data received:", res.data)
        setJob(res.data)

        // Check if the employer has already sent a referral for this job
        if (user && user.role === "employer") {
          try {
            const referralsRes = await axios.get("/api/referrals/sent")
            const hasReferral = referralsRes.data.some((ref) => ref.job && ref.job._id === id)
            setReferralSent(hasReferral)
          } catch (refErr) {
            console.error("Error fetching referrals:", refErr)
            // Don't fail the whole component if just the referrals check fails
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching job details:", err)
        setError(err.response?.data?.msg || "Failed to fetch job details")
        toast.error(err.response?.data?.msg || "Failed to fetch job details")
        setLoading(false)
      }
    }

    if (id) {
      fetchJob()
    } else {
      setError("No job ID provided")
      setLoading(false)
    }
  }, [id, user])

  const handleSendReferral = async () => {
    try {
      setReferralLoading(true)
      await axios.post("/api/referrals", {
        job: id,
      })

      setReferralSent(true)
      setReferralLoading(false)

      toast.success(`Referral sent successfully to ${job.user.name}! 🎉`)
    } catch (err) {
      const errorMessage = err.response?.data?.msg || "Failed to send referral"
      toast.error(errorMessage)
      setReferralLoading(false)
    }
  } 

  if (loading) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }}></div>
              <h5 className="text-muted">Loading job details...</h5>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <h4 className="text-danger mb-3">Error Loading Job</h4>
                <p className="text-muted mb-4">{error}</p>
                <button onClick={() => navigate(-1)} className="btn btn-outline-primary">
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <h4 className="text-muted mb-3">Job Not Found</h4>
                <p className="text-muted mb-4">The job you're looking for doesn't exist or has been removed.</p>
                <button onClick={() => navigate(-1)} className="btn btn-outline-primary">
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button onClick={() => navigate(-1)} className="btn btn-outline-secondary me-3">
              Back
            </button>
            <div>
              <h1 className="h3 mb-1">{job.position}</h1>
              <p className="text-muted mb-0">{job.company}</p>
            </div>
          </div>

          {/* Job Overview Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">Job Details</h5>

              <div className="mb-3">
                <h6 className="text-muted mb-1">Location</h6>
                <p className="mb-0 fw-medium">{job.location}</p>
              </div>

              <div className="mb-3">
                <h6 className="text-muted mb-1">Posted Date</h6>
                <p className="mb-0 fw-medium">{new Date(job.date).toLocaleDateString()}</p>
              </div>

              <div className="mb-3">
                <h6 className="text-muted mb-1">Job ID</h6>
                <p className="mb-0 fw-medium">{job.jobId}</p>
              </div>

              <div className="mb-0">
                <h6 className="text-muted mb-1">Apply Link</h6>
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fw-medium text-decoration-none"
                >
                  LINK
                </a>
              </div>
            </div>
          </div>         

          
{/* Skills Part */}
<div className="card border-0 shadow-sm mb-4">
  <div className="card-body p-4">
    <h5 className="card-title mb-3">Required Skills</h5>
    <div className="d-flex flex-wrap gap-2">
      {job.skills &&
        job.skills.map((skill, index) => (
          <span
            key={index}
            className="badge bg-success bg-opacity-20 text-success-emphasis border border-success border-opacity-25 px-3 py-2 rounded-pill fw-medium"
            style={{ 
              fontSize: "0.875rem",
              textShadow: '0 1px 1px rgba(0,0,3,0.1)'
            }}
          >
            #{skill}
          </span>
        ))}
    </div>
  </div>
</div>

          {/* Job Description */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              {user.role === "jobseeker" ? (<h5 className="card-title mb-3">Why Me / Resume Link</h5>)
              :
              (<h5 className="card-title mb-3"> About / Resume Link</h5>)}
              <div className="text-muted" style={{ lineHeight: "1.7" }}>
                {job.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Job Seeker*/}
          {job.user && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
              {  
  user.role === "employer" ? (
    <h5 className="card-title mb-4">Job Seeker Profile</h5>
  ) : (
    <h5 className="card-title mb-4">My Profile</h5>
  )
}
                

                <div className="mb-4">
                  <h6 className="text-muted mb-1">Name</h6>
                  <p className="mb-0 fw-medium">{job.user.name}</p>
                </div>

                <div className="mb-4">
                  <h6 className="text-muted mb-1">Email</h6>
                  <p className="mb-0 fw-medium">{job.user.email}</p>
                </div>

                <div className="mb-4">
                  <h6 className="text-muted mb-1">Years of Experience</h6>
                  <p className="mb-0 fw-medium">
                    {job.user.yearsOfExperience !== undefined ? `${job.user.yearsOfExperience} years` : "Not specified"}
                  </p>
                </div>

                <div className="mb-4">
                  <h6 className="text-muted mb-1">Current Company</h6>
                  <p className="mb-0 fw-medium">{job.user.currentCompany || "Not specified"}</p>
                </div>

                {job.user.linkedinProfile && (
                  <div className="mb-4">
                    <h6 className="text-muted mb-1">LinkedIn Profile</h6>
                    <a
                      href={job.user.linkedinProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fw-medium text-decoration-none"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              {user.role == "employer" &&  (
                <div className="border-top pt-4">
                  <a
                    href={`mailto:${job.user.email}?subject=Regarding ${job.position} at ${job.company}&body=Hi ${job.user.name},%0D%0A%0D%0AI'm interested in discussing the ${job.position} position at ${job.company}.%0D%0A%0D%0ABest regards,%0D%0A${user?.name || "Employer"}`}
                    className="btn btn-outline-primary w-100"
                  >
                    Contact Job Seeker
                  </a>
                </div>
              )
            }
              </div>
            </div>
          )}

          {/* For Employers only */}
          {user && user.role === "employer" && job.user && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                {!referralSent ? (
                  <>
                    <h5 className="card-title mb-3">Send Referral</h5>
                    <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                      Send a referral to this job seeker. They will be able to see your profile information and contact
                      you directly.
                    </p>
                    <button onClick={handleSendReferral} className="btn btn-primary w-100" disabled={referralLoading}>
                      {referralLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Sending...
                        </>
                      ) : (
                        "Send Referral"
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <h6 className="text-success mb-2">Referral Sent!</h6>
                    <p className="text-muted small mb-0">
                      The job seeker can now see your profile information and contact you directly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobDetails