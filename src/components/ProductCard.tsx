// src/components/ProductCard.tsx
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../utils/wishlist";
import { getProductReviews} from "../firebase/reviews";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  description?: string;
  sellerId?: string;
  discount?: number;
  category?: string;
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
}

const ProductCard = ({
  id,
  title,
  price,
  imageUrl,
  description,
  sellerId,
  discount,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const isWishlisted = wishlist.some((item: { id: string }) => item.id === id);

  const safePrice = Number.isFinite(Number(price)) ? Number(price) : 0;
  const safeDiscount = Number.isFinite(Number(discount)) ? Number(discount) : 0;
  const hasDiscount = safeDiscount > 0;

  const discountedPrice = hasDiscount
    ? Math.round(safePrice - (safePrice * safeDiscount) / 100)
    : safePrice;

  const formatNaira = (amount: number) =>
    `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  // 🔄 Load reviews
  useEffect(() => {
    let mounted = true;

    const loadReviewSummary = async () => {
      try {
        const reviews: Review[] = await getProductReviews(id);
        const count = reviews.length;
        const avg = count > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
          : 0;

        if (mounted) {
          setReviewCount(count);
          setAverageRating(avg);
        }
      } catch (err) {
        console.error("Failed to load review summary:", err);
      }
    };

    loadReviewSummary();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(id);
      toast("Removed from wishlist");
      return;
    }

    addToWishlist({
      id,
      title,
      price: safePrice,
      imageUrl,
      description,
      sellerId,
      discount: safeDiscount,
      discountedPrice,
    });

    toast.success("Added to wishlist");
  };

  const handleAddToCart = () => {
    addToCart({
      id,
      title,
      price: safePrice,
      discountedPrice,
      quantity: 1,
      sellerId: sellerId || "",
      description: description || "",
      discount: safeDiscount,
      imageUrl: imageUrl || "",
    });

    toast.success("Product added to cart");
  };

  return (
    <div className="product-card" style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, background: "#fff" }}>
      <div style={{ position: "relative" }}>
        {hasDiscount && <span className="discount-badge">-{safeDiscount}%</span>}
        {imageUrl && <img src={imageUrl} alt={title} style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 6 }} />}
      </div>

      <h4 style={{ marginTop: 8, fontSize: 16, fontWeight: 600 }}>{title}</h4>
      {description && <p style={{ fontSize: 13, color: "#555" }}>{description}</p>}

      <div className="price-container" style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
        <span className="discounted-price" style={{ fontWeight: "bold" }}>{formatNaira(discountedPrice)}</span>
        {hasDiscount && (
          <span className="original-price" style={{ textDecoration: "line-through", color: "#888", fontSize: 12 }}>
            {formatNaira(safePrice)}
          </span>
        )}
      </div>

      {/* ⭐ Reviews */}
      <div style={{ marginTop: 6, fontSize: 12, color: "#333" }}>
        {reviewCount > 0 ? (
          <>
            ⭐ {averageRating.toFixed(1)} ({reviewCount} review{reviewCount > 1 ? "s" : ""})
          </>
        ) : (
          <>No reviews yet</>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={handleAddToCart}
          style={{ flex: 1, padding: "6px 0", borderRadius: 6, background: "#28a745", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          Add to Cart
        </button>

        <button
          onClick={handleWishlist}
          style={{ width: 36, border: "none", background: "transparent", cursor: "pointer" }}
        >
          {isWishlisted ? <FaHeart color="red" /> : <FaRegHeart color="#444" />}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;