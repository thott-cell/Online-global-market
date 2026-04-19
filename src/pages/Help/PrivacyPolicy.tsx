import { useState } from "react";

const PrivacyPolicy = () => {
  const [tab, setTab] = useState("intro");

  const content: any = {
    intro: "We respect your privacy.",
    data: "We collect usage and transaction data.",
    usage: "Used to improve experience.",
    security: "Protected with encryption.",
  };

  return (
    <div className="page">
      <h2 className="title">Privacy Policy</h2>

      <div className="tabs">
        {Object.keys(content).map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="content">{content[tab]}</div>

      <style>{`
.page{padding:16px;max-width:720px;margin:auto;font-family:system-ui;}
.title{font-size:22px;font-weight:700;margin-bottom:16px;}

.tabs{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;}
.tabs button{
  padding:8px 12px;
  border-radius:20px;
  border:none;
  background:#f1f5f9;
  cursor:pointer;
}
.tabs .active{
  background:#075E54;
  color:#fff;
}

.content{
  background:#fff;
  padding:16px;
  border-radius:14px;
  box-shadow:0 4px 16px rgba(0,0,0,0.05);
}
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;