import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const EmployerDashboard = () => {

  const [jobs, setJobs] = useState([])
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSkill, setFilterSkill] = useState("")
  const [filterLocation, setFilterLocation] = useState("")
  const [experienceFilter, setExperienceFilter] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const jobsRes = await axios.get("/api/jobs")

        // Fetching  referrals given by the current employer

        const referralsRes = await axios.get("/api/referrals/sent")

        setJobs(jobsRes.data || [])

        
        const validReferrals = (referralsRes.data || []).filter(
          (referral) => referral && referral.job && referral.jobSeeker,
        )

        setReferrals(validReferrals)

        setLoading(false)
      } 
      catch (err) {
        console.error("Error fetching data:", err)
        toast.error("Failed to fetch data")
        setLoading(false)
      }
    }

    fetchData();
  }, [])

  const filteredJobs = jobs.filter((job) => {
    if (!job) return false

    const matchesSearch =
      searchTerm === "" ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.user?.name && job.user.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSkill =
      filterSkill === "" || job.skills.some((skill) => skill.toLowerCase().includes(filterSkill.toLowerCase()))

    const matchesLocation = filterLocation === "" || job.location.toLowerCase().includes(filterLocation.toLowerCase())

    const matchesExperience = () => {
      if (experienceFilter === "") return true
      if (!job.user?.yearsOfExperience && job.user?.yearsOfExperience !== 0) return false

      const experience = job.user.yearsOfExperience
      switch (experienceFilter) {
        case "0-2":
          return experience >= 0 && experience <= 2
        case "3-5":
          return experience >= 3 && experience <= 5
        case "6-10":
          return experience >= 6 && experience <= 10
        case "10+":
          return experience > 10
        default:
          return true
      }
    }

    return matchesSearch && matchesSkill && matchesLocation && matchesExperience()
  })

  const handleJobClick = (jobId, e) => {
    e.preventDefault()
    navigate(`/job/${jobId}`)
  }

  const handleDeleteReferral = async (referralId) => {
  try {
    setDeleteLoading(referralId)
    await axios.delete(`/api/referrals/${referralId}`)
    
    setReferrals(referrals.filter((referral) => referral._id !== referralId))
    setDeleteLoading(null)

    toast.success("Referral deleted successfully!")
  }
  catch (err) {
    const errorMessage = err.response?.data?.msg || "Failed to delete referral"
    toast.error(errorMessage)
    setDeleteLoading(null)
  }
}

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"> </div>
      </div>
    )

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by company, position, or name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by skill"
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by location"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
          >
            <option value="">All Experience Levels</option>
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Available Posts ({filteredJobs.length})</h3>
            </div>
            <div className="card-body">
              {filteredJobs.length === 0 ? (
                <p>No job posts match your criteria.</p>
              ) : (
                <div className="list-group">
                  {filteredJobs.map((job) => (
                    <a
                      href="#"
                      onClick={(e) => handleJobClick(job._id, e)}
                      key={job._id}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{job.position}</h5>
                        <small>{new Date(job.date).toLocaleDateString()}</small>
                      </div>
                      <p className="mb-1">{job.company}</p>
                      <p className="mb-1">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {job.location}
                      </p>

                      {/* Job Seeker Profile */}
                      {job.user && (
                        <div className="mb-2">
                          <div className="row">
                            <div className="col-md-6">
                              <small className="text-muted">
                                <i className="fas fa-briefcase me-1"></i>
                                Experience:{" "}
                                {job.user.yearsOfExperience !== undefined
                                  ? `${job.user.yearsOfExperience} years`
                                  : "Not specified"}
                              </small>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">
                                <i className="fas fa-building me-1"></i>
                                Current: {job.user.currentCompany || "Not specified"}
                              </small>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <small>Job ID: {job.jobId}</small>
                      </div>
                      <div>
                        <small>Skills: {job.skills.join(", ")}</small>
                      </div>
                      <div>
                        <small>Posted by: {job.user?.name || "Unknown"}</small>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Referrals ({referrals.length})</h3>
            </div>
            <div className="card-body">
              {referrals.length === 0 ? (
                <p>You haven't given any referrals yet.</p>
              ) : (
                <div className="list-group">
                  {referrals.map((referral) => {
                    // Additional safety check
                    if (!referral || !referral.job || !referral.jobSeeker) {
                      return null
                    }

                    return (
                      <div key={referral._id} className="list-group-item">
                        <div className="d-flex w-100 justify-content-between align-items-start">
                          <div>
                            <div className="d-flex justify-content-between align-items-center">
  <h5 className="mb-1 mb-md-0">{referral.job.position}</h5>
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

                            <p className="mb-1">To: {referral.jobSeeker.name}</p>
                            <p className="mb-1">Company: {referral.job.company}</p>
                            <small>Sent on: {new Date(referral.date).toLocaleDateString()}</small>

                            {referral.status === "rejected" && (
                              <div className="mt-1">
                                <small className="text-danger">

                                </small>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteReferral(referral._id, referral.job.position)}
                            className="btn btn-sm btn-outline-danger"
                            disabled={deleteLoading === referral._id}
                            title="Delete referral"
                          >
                            {deleteLoading === referral._id ? (
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

export default EmployerDashboard
