import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const JobSeekerDashboard = () => {

  const [jobs, setJobs] = useState([])
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [clearingReferrals, setClearingReferrals] = useState(false)
 
  useEffect(() => {
    const fetchData = async () => {

      try {

        setLoading(true)

        const jobsRes = await axios.get("/api/jobs/user")

        const referralsRes = await axios.get("/api/referrals/received")

        setJobs(jobsRes.data || [])

   
        const validReferrals = (referralsRes.data || []).filter(
          (referral) => referral && referral.job && referral.employer,
        )
        setReferrals(validReferrals)

        setLoading(false)
      }
     catch (err){
        console.error("Error fetching data:", err)
        toast.error("Failed to fetch data")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDeleteJob = async (jobId) => {
  try {
    setDeleteLoading(jobId)
    await axios.delete(`/api/jobs/${jobId}`)

    // Removing the job from the local state
    setJobs(jobs.filter((job) => job._id !== jobId))
    setDeleteLoading(null);

    toast.success("Job post deleted successfully!")
  } 
  catch (err) {
    const errorMessage = err.response?.data?.msg || "Failed to delete job post"
    toast.error(errorMessage)
    setDeleteLoading(null)
  }
}


  const refreshReferrals = async () => {
    try {
      const referralsRes = await axios.get("/api/referrals/received")
      const validReferrals = (referralsRes.data || []).filter(
        (referral) => referral && referral.job && referral.employer,
      )
      setReferrals(validReferrals)
    } catch (err) {
      console.error("Error refreshing referrals:", err)
    }
  }

  const handleReferralAction = async (referralId, status, jobTitle) => {
    try {
      await axios.put(`/api/referrals/${referralId}`, { status })

      // Refreshing the referrals list from server instead of local update
      await refreshReferrals()

      const actionText = status === "accepted" ? "accepted" : "rejected"

      if (status === "rejected") {
        toast.info(`Referral for "${jobTitle}" rejected. It will be automatically removed after 1 day.`)
      } else {
        toast.success(`Referral for "${jobTitle}" ${actionText} successfully!`)
      }
    }
    catch (err) {
      const errorMessage = err.response?.data?.msg || "Failed to update referral status"
      toast.error(errorMessage)
    }
  }

  const handleClearAllReferrals = async () => {
    if (referrals.length === 0) {
      toast.info("No referrals to clear")
      return
    }

    try {
      setClearingReferrals(true)

      
      await axios.delete("/api/referrals/clear-all")

      // Clearing the local state
      setReferrals([])
      setClearingReferrals(false)
      toast.success("All referrals cleared successfully!")
    } catch (err) {
      console.error("Clear all referrals error:", err)
      toast.error("Failed to clear referrals: " + (err.response?.data?.msg || err.message))
      setClearingReferrals(false)
    }
  }


  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
      </div>
    )

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <Link to="/jobseeker/post" className="btn btn-primary">
         Create Post
        </Link>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">  
              <h3 className="card-title">Job Posts</h3>
            </div>
            <div className="card-body">
              {jobs.length === 0 ? (
                <p>You haven't posted any jobs yet.</p>
              ) : (
                <div className="list-group">
                  {jobs.map((job) => (
                    <div key={job._id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <Link to={`/job/${job._id}`} className="text-decoration-none">
                            <h5 className="mb-1">{job.position}</h5>
                          </Link>
                          <p className="mb-1">{job.company}</p>
                          <p className="mb-1">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {job.location}
                          </p>
                          <small>Job ID: {job.jobId}</small>
                          <br />
                          <small className="text-muted">{new Date(job.date).toLocaleDateString()}</small>
                        </div>
                        <div className="ms-3">
                          <button
                            onClick={() => handleDeleteJob(job._id, job.position)}
                            className="btn btn-sm btn-outline-danger"
                            disabled={deleteLoading === job._id}
                            title="Delete job post"
                          >
                            {deleteLoading === job._id ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              ></span>
                            ) : (
                              <i className="fas fa-trash"></i>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Referrals ({referrals.length})</h3>
              {referrals.length > 0 && (
                <button
                  onClick={handleClearAllReferrals}
                  className="btn btn-sm btn-outline-danger"
                  disabled={clearingReferrals}
                  title="Clear all referrals"
                >
                  {clearingReferrals ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash-alt me-1"></i>
                      Clear All
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="card-body">
              {referrals.length === 0 ? (
                <p>You haven't received any referrals yet.</p>
              ) : (
                <div className="list-group">
                  {referrals.map((referral) => {
                   
                    if (!referral || !referral.job || !referral.employer) {
                      return null
                    }

                    return (
                      <div key={referral._id} className="list-group-item">
                        <div className="d-flex w-100 justify-content-between">
                          <h5 className="mb-1">
                            {referral.job.position} at {referral.job.company}
                          </h5>
                          <span
                            className={`badge bg-${
                              referral.status === "pending"
                                ? "warning"
                                : referral.status === "accepted"
                                  ? "success"
                                  : "danger"
                            }`}
                          >
                            {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                          </span>
                        </div>
                        <p className="mb-1">From: {referral.employer.name}</p>
                        <p className="mb-1">Company: {referral.employer.currentCompany || "Not specified"}</p>
                        <small className="text-muted">Received: {new Date(referral.date).toLocaleDateString()}</small>

                        <div className="mt-2">
                          <Link to={`/referral/${referral._id}`} className="btn btn-sm btn-primary me-2">
                            <i className="fas fa-eye me-1"></i>
                            View Details
                          </Link>

                          {referral.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleReferralAction(referral._id, "accepted", referral.job.position)}
                                className="btn btn-sm btn-success me-2"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleReferralAction(referral._id, "rejected", referral.job.position)}
                                className="btn btn-sm btn-danger"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>

                        {referral.status === "pending" && (
                          <small className="d-block mt-2 text-muted">
                           
                            
                          </small>
                        )}

                        {referral.status === "rejected" && (
                          <small className="d-block mt-2 text-danger">
                           
                            
                          </small>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobSeekerDashboard
