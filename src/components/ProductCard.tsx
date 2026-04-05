import { useCart } from "../context/CartContext";
import { useWishlist } from "../utils/wishlist";
import { FaHeart, FaRegHeart } from "react-icons/fa";

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

  const isWishlisted = wishlist.some((item: { id: string }) => item.id === id);

  const safePrice = Number.isFinite(Number(price)) ? Number(price) : 0;
  const safeDiscount = Number.isFinite(Number(discount)) ? Number(discount) : 0;
  const hasDiscount = safeDiscount > 0;

  const discountedPrice = hasDiscount
    ? Math.round(safePrice - (safePrice * safeDiscount) / 100)
    : safePrice;

  const formatNaira = (amount: number) =>
    `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(id);
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
  };

  return (
    <div className="product-card">
      <div style={{ position: "relative" }}>
        {hasDiscount && <span className="discount-badge">-{safeDiscount}%</span>}
        {imageUrl && <img src={imageUrl} alt={title} />}
      </div>

      <h4>{title}</h4>
      {description && <p>{description}</p>}

      <div className="price-container">
        <span className="discounted-price">{formatNaira(discountedPrice)}</span>
        {hasDiscount && (
          <span className="original-price">{formatNaira(safePrice)}</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button onClick={handleAddToCart} style={{ flex: 1 }}>
          Add to Cart
        </button>

        <button onClick={handleWishlist} style={{ width: 36 }}>
          {isWishlisted ? <FaHeart color="red" /> : <FaRegHeart color="#444" />}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;