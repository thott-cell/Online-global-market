import { useState } from "react";

const Terms = () => {
  const [open, setOpen] = useState<number | null>(null);

  const data = [
    { title: "User Responsibilities", text: "Provide accurate information." },
    { title: "Payments", text: "All payments must be verified." },
    { title: "Prohibited Activities", text: "No fraud allowed." },
  ];

  return (
    <div className="page">
      <h2 className="title">Terms & Conditions</h2>

      {data.map((item, i) => (
        <div key={i} className="card">
          <div className="head" onClick={() => setOpen(open === i ? null : i)}>
            {item.title}
          </div>

          {open === i && <p>{item.text}</p>}
        </div>
      ))}

      <style>{`
.page{padding:16px;max-width:720px;margin:auto;font-family:system-ui;}
.title{font-size:22px;font-weight:700;margin-bottom:16px;}

.card{
  background:#fff;
  border-radius:14px;
  margin-bottom:10px;
  box-shadow:0 4px 16px rgba(0,0,0,0.05);
  overflow:hidden;
}

.head{
  padding:14px;
  font-weight:600;
  cursor:pointer;
}

.card p{
  padding:0 14px 14px;
  font-size:13px;
  color:#555;
}
      `}</style>
    </div>
  );
};

export default Terms;