import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { toast } from "react-hot-toast";

interface Props {
  category: string;
  onSelectProduct?: (id: string) => void;
}

const CategoryProducts = ({ category, onSelectProduct }: Props) => {
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("category", "==", category)
        );

        const snap = await getDocs(q);

        const items = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(items);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load category products");
      }
    };

    loadProducts();
  }, [category]);

  // ✅ SAME CLICK LOGIC AS HOME
  const handleProductClick = (id: string) => {
    if (!id) {
      toast.error("Product not found");
      return;
    }

    if (onSelectProduct) {
      onSelectProduct(id);
    } else {
      navigate(`/product/${id}`);
    }
  };

  const filteredProducts = useMemo(() => products, [products]);

  return (
    <div className="category-page">
      <h2 className="category-title">{category}</h2>

      {filteredProducts.length === 0 && (
        <p className="no-products">No products found.</p>
      )}

      <div className="product-grid">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => handleProductClick(p.id)}
            className="product-click-wrapper"
          >
            <ProductCard {...p} />
          </div>
        ))}
      </div>

      <style>{`
        .category-page {
          padding: 16px;
        }

        .category-title {
          margin-bottom: 12px;
          font-size: 20px;
        }

        .no-products {
          text-align: center;
          margin-top: 20px;
          color: #777;
        }

        /* GRID FIX (same as wishlist) */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .product-click-wrapper {
          cursor: pointer;
        }

        /* 📱 MOBILE */
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
        }

        /* 📱 SMALL PHONES */
        @media (max-width: 480px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryProducts;