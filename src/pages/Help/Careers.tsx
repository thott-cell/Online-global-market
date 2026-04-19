import { useState } from "react";

const Careers = () => {
  const [job, setJob] = useState<any>(null);
  const [applied, setApplied] = useState(false);

  const jobs = [
    { title: "Frontend Developer", location: "Remote" },
    { title: "Customer Support", location: "Lagos" },
    { title: "Marketing Manager", location: "Remote" },
  ];

  if (job) {
    return (
      <div className="page">
        <button className="back" onClick={() => setJob(null)}>← Back</button>

        <div className="job">
          <h2>{job.title}</h2>
          <span>{job.location}</span>

          {!applied ? (
            <button className="btn" onClick={() => setApplied(true)}>
              Apply Now
            </button>
          ) : (
            <p className="success">Application submitted ✔</p>
          )}
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="title">Careers</h2>

      {jobs.map((j, i) => (
        <div key={i} className="card" onClick={() => setJob(j)}>
          <h3>{j.title}</h3>
          <span>{j.location}</span>
        </div>
      ))}

      <style>{styles}</style>
    </div>
  );
};

const styles = `
.page{padding:16px;max-width:720px;margin:auto;font-family:system-ui;}
.title{font-size:22px;font-weight:700;margin-bottom:16px;}

.card{
  padding:16px;
  border-radius:14px;
  background:#fff;
  margin-bottom:12px;
  box-shadow:0 4px 16px rgba(0,0,0,0.05);
  cursor:pointer;
}
.card h3{margin:0;font-size:15px;}
.card span{font-size:12px;color:#777;}

.job span{color:#777;font-size:13px;}

.btn{
  margin-top:16px;
  width:100%;
  padding:12px;
  border:none;
  border-radius:10px;
  background:#075E54;
  color:#fff;
  font-weight:600;
}

.success{color:#16a34a;margin-top:12px;}

.back{margin-bottom:12px;background:none;border:none;color:#075E54;font-weight:600;}
`;

export default Careers;