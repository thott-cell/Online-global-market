// src/components/ProductDetail.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Loading from "../components/Loading";
import { formatNaira } from "../utils/formatPrice";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import ReviewSection from "../components/ReviewSection";
import ChatBox from "../components/ChatBox";
import { getChatId } from "../firebase/chat";

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  discount?: number;
  sellerId?: string;
  imageUrl?: string;
  images?: string[];
  stock?: number;
}

const ProductDetail = ({ productId, onBack }: ProductDetailProps) => {
  const { user } = useAuth();
  const { cartItems, addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchProduct = useCallback(async () => {
    setLoading(true);

    try {
      const docRef = doc(db, "products", productId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() } as Product);
      } else {
        setProduct(null);
      }
    } catch (err) {
      console.error("Failed to fetch product:", err);
      toast.error("Failed to load product.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id]);

  const chatId = useMemo(() => {
    if (!user?.uid || !product?.sellerId) return "";
    return getChatId(user.uid, product.sellerId);
  }, [user?.uid, product?.sellerId]);

  const productImages = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) return product.images;
    if (product.imageUrl) return [product.imageUrl];
    return [];
  }, [product]);

  const safeStock = Number.isFinite(Number(product?.stock))
    ? Math.max(0, Number(product?.stock))
    : 0;

  const isOutOfStock = safeStock <= 0;

  if (loading) return <Loading message="Loading product..." />;

  if (!product) {
    return (
      <p style={{ textAlign: "center", marginTop: 50 }}>
        Product not found.
      </p>
    );
  }

  const discountedPrice = product.discount
    ? Math.round(product.price - (product.price * product.discount) / 100)
    : product.price;

  const isInCart = cartItems.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    if (!product) return;

    if (isOutOfStock) {
      toast("This product is out of stock", { icon: "⚠️" });
      return;
    }

    if (isInCart) {
      toast("Product is already in your cart", { icon: "🛒" });
      return;
    }

    addToCart({
      id: product.id,
      title: product.title,
      description: product.description || "",
      price: product.price,
      discountedPrice,
      discount: product.discount || 0,
      sellerId: product.sellerId || "unknown",
      imageUrl: productImages[0] || "",
      quantity: 1,
      stock: safeStock,
    });

    toast.success("Product added to cart!");
  };

  const handleChatToggle = () => {
    if (!product.sellerId) {
      toast.error("Seller not available for this product.");
      return;
    }

    setShowChat((prev) => !prev);
  };

  const goPrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const goNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "20px auto",
        padding: 16,
        background: "#fff",
        borderRadius: 10,
      }}
    >
      <button
        onClick={onBack}
        style={{
          marginBottom: 16,
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "#f9f9f9",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        ← Back
      </button>

      {productImages.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              borderRadius: 10,
              overflow: "hidden",
              background: "#f8f8f8",
            }}
          >
            <img
              src={productImages[currentImageIndex]}
              alt={product.title}
              style={{
                width: "100%",
                height: 300,
                objectFit: "cover",
                display: "block",
                opacity: isOutOfStock ? 0.75 : 1,
              }}
            />

            {productImages.length > 1 && (
              <>
                <button
                  onClick={goPrevImage}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 10,
                    transform: "translateY(-50%)",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 22,
                    lineHeight: "36px",
                  }}
                >
                  ‹
                </button>

                <button
                  onClick={goNextImage}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: 10,
                    transform: "translateY(-50%)",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 22,
                    lineHeight: "36px",
                  }}
                >
                  ›
                </button>

                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    padding: "5px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                  }}
                >
                  {currentImageIndex + 1}/{productImages.length}
                </div>
              </>
            )}

            {isOutOfStock && (
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  background: "#dc2626",
                  color: "#fff",
                  padding: "6px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Out of stock
              </div>
            )}
          </div>

          {productImages.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 10,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {productImages.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    width: 56,
                    height: 56,
                    padding: 0,
                    borderRadius: 8,
                    overflow: "hidden",
                    border:
                      index === currentImageIndex
                        ? "2px solid #075E54"
                        : "1px solid #ddd",
                    background: "#fff",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={img}
                    alt={`thumb-${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <h2 style={{ marginBottom: 8, fontSize: 20 }}>{product.title}</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: "bold",
            textDecoration: product.discount ? "line-through" : "none",
            color: product.discount ? "#888" : "#000",
          }}
        >
          {formatNaira(product.price)}
        </span>

        {product.discount && (
          <span style={{ fontSize: 18, fontWeight: "bold", color: "green" }}>
            {formatNaira(discountedPrice)}
          </span>
        )}

        {!isOutOfStock && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#075E54",
              background: "#e7f7f2",
              padding: "5px 10px",
              borderRadius: 999,
            }}
          >
            {safeStock} unit{safeStock === 1 ? "" : "s"} left
          </span>
        )}
      </div>

      {product.discount && (
        <p style={{ fontSize: 14, color: "green", marginBottom: 12 }}>
          {product.discount}% discount applied
        </p>
      )}

      {product.description && (
        <p
          style={{
            fontSize: 14,
            color: "#555",
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          {product.description}
        </p>
      )}

      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isInCart}
        style={{
          width: "100%",
          padding: "12px 0",
          background: isOutOfStock ? "#aaa" : isInCart ? "#aaa" : "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor:
            isOutOfStock || isInCart ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        {isOutOfStock ? "Out of Stock" : isInCart ? "Already in Cart" : "Add to Cart"}
      </button>

      {product.sellerId && (
        <button
          onClick={handleChatToggle}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "10px 0",
            background: "#075E54",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {showChat ? "Close Chat" : "Chat with Seller 💬"}
        </button>
      )}

      {showChat && product.sellerId && <ChatBox chatId={chatId} />}

      <div style={{ marginTop: 24 }}>
        <ReviewSection
          productId={productId}
          limit={showAllReviews ? undefined : 2}
        />

        <button
          onClick={() => setShowAllReviews(!showAllReviews)}
          style={{
            marginTop: 10,
            background: "transparent",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {showAllReviews ? "Hide reviews" : "See more reviews"}
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;