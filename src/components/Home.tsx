import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext"; // ✅ Import search context
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { toast } from "react-hot-toast";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  discount?: number;
  sellerId?: string;
  imageUrl?: string;
}

type HomeProps = {
  onSelectProduct?: (id: string) => void;
  onChangePage: (page: "home" | "menu" | "deals" | "profile" | "signup" | "login") => void;
};

const Home = ({ onSelectProduct, onChangePage }: HomeProps) => {
  const { user, loading: authLoading } = useAuth();
  const { searchTerm } = useSearch(); // ✅ Get searchTerm from context

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const productsRef = collection(db, "products");

    const q = query(
      productsRef,
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items: Product[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(items.slice(0, 8));
      setLoadingProducts(false);
    });

    return () => unsub();
  }, []);

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

  // ✅ Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>Buy & Sell Worldwide</h1>
          <p>
            Connect with buyers and sellers across campus.
            Discover, buy and sell products easily in your marketplace.
          </p>

          <div className="hero-search">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm} // ✅ Bind input to searchTerm for live updates
              onChange={(_e) => {}}
            />
            <button>
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>

          {!authLoading && !user && (
            <div className="hero-buttons">
              <button onClick={() => onChangePage("signup")}>
                Sign Up
              </button>
              <button onClick={() => onChangePage("login")}>
                Sign In
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <h2 className="section-title">Featured Products</h2>

      {loadingProducts && (
        <div className="product-grid">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {!loadingProducts && filteredProducts.length === 0 && (
        <p className="no-products">
          No products match your search.
        </p>
      )}

      {!loadingProducts && filteredProducts.length > 0 && (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              style={{ cursor: "pointer" }}
            >
              <ProductCard
                id={product.id}
                title={product.title}
                price={product.price}
                imageUrl={product.imageUrl}
                description={product.description}
                sellerId={product.sellerId}
                discount={product.discount}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;