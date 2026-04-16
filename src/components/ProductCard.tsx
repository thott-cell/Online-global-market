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
  useCart();
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


  return (
  <div
    className="pm-card"
    onClick={() =>
      window.dispatchEvent(new CustomEvent("openProduct", { detail: id }))
    }
  >
    <div className="pm-image-wrap">
      {hasDiscount && (
        <span className="pm-badge">-{safeDiscount}%</span>
      )}

      {imageUrl && <img src={imageUrl} alt={title} />}
    </div>

    <div className="pm-body">
      <h4 className="pm-title">{title}</h4>

      {description && (
        <p className="pm-desc">{description}</p>
      )}

      <div className="pm-price">
        <span className="pm-new">
          {formatNaira(discountedPrice)}
        </span>

        {hasDiscount && (
          <span className="pm-old">
            {formatNaira(safePrice)}
          </span>
        )}
      </div>

      <div className="pm-review">
        {reviewCount > 0 ? (
          <>⭐ {averageRating.toFixed(1)} ({reviewCount})</>
        ) : (
          <>No reviews</>
        )}
      </div>
    </div>

    {/* ❤️ Wishlist */}
    <button
      className="pm-wishlist"
      onClick={(e) => {
        e.stopPropagation();
        handleWishlist();
      }}
    >
      {isWishlisted ? <FaHeart color="green" /> : <FaRegHeart />}
    </button>
  </div>
)};

export default ProductCard;