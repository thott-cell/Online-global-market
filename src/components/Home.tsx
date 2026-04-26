// src/components/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { toast } from "react-hot-toast";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  discount?: number;
  sellerId?: string;
  imageUrl?: string;
  stock?: number;
  initialStock?: number;
  category?: string
}

type HomeProps = {
  onSelectProduct?: (id: string) => void;
  onChangePage: (page: "home" | "menu" | "deals" | "profile" | "signup" | "login") => void;
};



const Home = ({ onSelectProduct, onChangePage }: HomeProps) => {
  const { user, loading: authLoading } = useAuth();
  const { searchTerm } = useSearch();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

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

      setProducts(items);
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

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      product.title.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);





  useEffect(() => {
  const ids = JSON.parse(localStorage.getItem("recentProducts") || "[]");

  const matched = products.filter((p) => ids.includes(p.id));

  setRecentProducts(matched);
}, [products]);

const recommendedProducts = useMemo(() => {
  if (recentProducts.length === 0) return [];

  const lastViewed = recentProducts[0];
  if (!lastViewed?.category) return [];

  return products
    .filter(
      (p) =>
        p.category === lastViewed.category &&
        p.id !== lastViewed.id
    )
    .slice(0, 6);
}, [products, recentProducts]);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="page">
      {/* HERO CAROUSEL */}
      <section className="hero-carousel">
        {loadingProducts ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            spaceBetween={0}
            loop={true}
            speed={800}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="hero-swiper"
          >
            {[...Array(4)].map((_, i) => (
              <SwiperSlide key={i}>
                <ProductSkeleton isCarousel />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : featuredProducts.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            spaceBetween={0}
            loop={true}
            speed={800}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="hero-swiper"
          >
            {featuredProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <div
                  className="hero-slide"
                  onClick={() => handleProductClick(product.id)}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="hero-image"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="carousel-loading">No featured products yet.</div>
        )}
      </section>

      {/* AUTH BUTTONS */}
      {!authLoading && !user && (
        <section className="auth-strip">
          <button onClick={() => onChangePage("signup")}>Sign Up</button>
          <button onClick={() => onChangePage("login")}>Sign In</button>
        </section>
      )}

      {/* PRODUCTS */}
      <h2 className="section-title">Featured Products</h2>

      {loadingProducts && (
        <div className="product-grid">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {recentProducts.length > 0 && (
  <>
   
      {!loadingProducts && filteredProducts.length === 0 && (
        <p className="no-products">No products match your search.</p>
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
                stock={product.stock}
                
                initialStock={product.initialStock}
              />
            </div>
          ))}
        </div>
      )}
       <h2 className="section-title">Recently Viewed</h2>

    <div className="product-grid">
      {recentProducts.map((product) => (
        <div
          key={product.id}
          onClick={() => handleProductClick(product.id)}
          style={{ cursor: "pointer" }}
        >
          <ProductCard {...product} />
        </div>
      ))}
    </div>
  </>
)}
{recommendedProducts.length > 0 && (
  <>
    <h2 className="section-title">Recommended for You</h2>

    <div className="product-grid">
      {recommendedProducts.map((product) => (
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
            stock={product.stock}
            initialStock={product.initialStock}
          />
        </div>
      ))}
    </div>
  </>
)}


      <style>{`
        .hero-carousel {
          width: 100%;
          margin: 12px 0 14px;
        }
         .section-title {
  background: #28a745;
  color: #fff;
  font-weight: 500;
  padding: 12px 16px;
  margin: 18px 0 10px;
  border-radius: 6px;
  width: 100%;
  display: block;
}

        .hero-swiper {
          width: 100%;
        }

        .hero-slide {
          width: 100%;
          height: 210px;
          overflow: hidden;
          border-radius: 14px;
          cursor: pointer;
          background: #f5f5f5;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .carousel-loading {
          height: 210px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f2f2f2;
          color: #666;
          font-weight: 600;
        }

        .auth-strip {
          display: flex;
          gap: 10px;
          margin: 10px 0 18px;
        }

        .auth-strip button {
          flex: 1;
          padding: 8px 14px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .auth-strip button:first-child {
          background: #28a745;
          color: #fff;
        }

        .auth-strip button:last-child {
          background: #f2f2f2;
          color: #111;
        }

        .swiper-pagination-bullet {
          background: #d0d0d0;
          opacity: 1;
        }

        .swiper-pagination-bullet-active {
          background: #28a745;
        }

        @media (max-width: 768px) {
          .hero-slide,
          .carousel-loading {
            height: 180px;
          }

          .auth-strip button {
            padding: 6px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;