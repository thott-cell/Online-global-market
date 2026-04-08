import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Loading from "../components/Loading";
import { formatNaira } from "../utils/formatPrice";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import ReviewSection from "../components/ReviewSection";

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
}

const ProductDetail = ({ productId, onBack }: ProductDetailProps) => {
  const { cartItems, addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const isInCart = product
    ? cartItems.some((item) => item.id === product.id)
    : false;

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

  const handleAddToCart = () => {
    if (!product) return;

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
      imageUrl: product.imageUrl || "",
      quantity: 1,
    });

    toast.success("Product added to cart!");
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

      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.title}
          style={{
            width: "100%",
            maxHeight: 300,
            objectFit: "contain",
            borderRadius: 8,
            marginBottom: 16,
          }}
        />
      )}

      <h2 style={{ marginBottom: 8, fontSize: 20 }}>{product.title}</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
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
        disabled={isInCart}
        style={{
          width: "100%",
          padding: "12px 0",
          background: isInCart ? "#aaa" : "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: isInCart ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        {isInCart ? "Already in Cart" : "Add to Cart"}
      </button>

      <div style={{ marginTop: 24 }}>
        <ReviewSection productId={productId} />
      </div>
    </div>
  );
};

export default ProductDetail;