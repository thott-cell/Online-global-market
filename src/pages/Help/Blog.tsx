import { useState } from "react";

const Blog = () => {
  const [activePost, setActivePost] = useState<any>(null);

  const posts = [
    {
      title: "How to Buy Safely Online",
      date: "April 2026",
      content:
        "Always verify sellers, avoid deals that look too cheap, and use secure payment methods.",
    },
    {
      title: "Top Deals This Week",
      date: "April 2026",
      content:
        "Discover trending items with discounts across electronics, fashion, and more.",
    },
    {
      title: "How to Sell Faster",
      date: "March 2026",
      content:
        "Use high-quality images, proper pricing, and detailed descriptions.",
    },
  ];

  if (activePost) {
    return (
      <div className="page">
        <button className="back" onClick={() => setActivePost(null)}>← Back</button>

        <div className="article">
          <h2>{activePost.title}</h2>
          <span>{activePost.date}</span>
          <p>{activePost.content}</p>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="title">Blog</h2>

      <div className="list">
        {posts.map((post, i) => (
          <div key={i} className="card" onClick={() => setActivePost(post)}>
            <h3>{post.title}</h3>
            <span>{post.date}</span>
          </div>
        ))}
      </div>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
.page{padding:16px;max-width:720px;margin:auto;font-family:system-ui;}
.title{font-size:22px;font-weight:700;margin-bottom:16px;}
.list{display:flex;flex-direction:column;gap:12px;}

.card{
  background:#fff;
  padding:16px;
  border-radius:14px;
  box-shadow:0 4px 16px rgba(0,0,0,0.05);
  cursor:pointer;
  transition:0.2s;
}
.card:hover{transform:translateY(-2px);}

.card h3{margin:0;font-size:15px;}
.card span{font-size:12px;color:#777;}

.article h2{margin:0 0 6px;}
.article span{font-size:12px;color:#777;}
.article p{margin-top:12px;line-height:1.6;color:#444;}

.back{margin-bottom:12px;color:#075E54;background:none;border:none;font-weight:600;}
`;

export default Blog;