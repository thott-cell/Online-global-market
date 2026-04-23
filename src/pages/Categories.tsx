import { categories } from "../data/categories";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();

  const handleClick = (name: string) => {
    navigate(`/category/${name}`);
  };

  return (
    <div className="categories-page">
      <h2 className="cat-title">Categories</h2>

      <div className="categories-grid">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="category-card"
            onClick={() => handleClick(cat.name)}
          >
            <i className={cat.icon}></i>
            <p>{cat.name}</p>
          </div>
        ))}
      </div>

      <style>{`
        .categories-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
        }

        .cat-title {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .category-card {
          background: #fff;
          border-radius: 16px;
          padding: 18px 10px;
          text-align: center;
          cursor: pointer;
          border: 1px solid #eee;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .category-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        .category-card i {
          font-size: 28px;
          margin-bottom: 8px;
          color: #28a745;
        }

        .category-card p {
          font-size: 14px;
          font-weight: 600;
        }

        /* Tablet */
        @media (max-width: 900px) {
          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Mobile */
        @media (max-width: 600px) {
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .category-card {
            padding: 14px 8px;
            border-radius: 12px;
          }

          .category-card i {
            font-size: 22px;
          }

          .category-card p {
            font-size: 12px;
          }
        }

        /* Small phones */
        @media (max-width: 420px) {
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Categories;