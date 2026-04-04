// src/components/ProductCard.tsx
import { useCart } from "../context/CartContext";
import { useWishlist } from "../utils/wishlist"; // <- updated to use utils
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  description?: string;
  sellerId?: string;
  discount?: number; // optional
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
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist(); // <- updated here

  const isWishlisted = wishlist.some((item: { id: string; }) => item.id === id);

  // Calculate final price only if discount exists
  const finalPrice =
    discount && discount > 0 ? Math.round(price - (price * discount) / 100) : price;

  const handleWishlist = () => {
    if (isWishlisted) removeFromWishlist(id);
    else addToWishlist({ id, title, price, imageUrl, description, sellerId, discount });
  };

  const formatNaira = (amount: number) =>
    `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  return (
    <div className="product-card">
      <div style={{ position: "relative" }}>
        {/* Show discount badge only if discount exists */}
        {discount && discount > 0 && (
          <span className="discount-badge">-{discount}%</span>
        )}

        {/* Product Image */}
        {imageUrl && <img src={imageUrl} alt={title} />}
      </div>

      <h4>{title}</h4>

      {description && <p>{description}</p>}

      <div className="price-container">
        <span className="discounted-price">{formatNaira(finalPrice)}</span>
        {discount && discount > 0 && (
          <span className="original-price">{formatNaira(price)}</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button
          onClick={() =>
            addToCart({
              id,
              title,
              price: finalPrice,
              quantity: 1,
              sellerId: sellerId || "",
              description: description || "",
              discount: discount || 0,
              imageUrl: imageUrl || "",
            })
            }
          style={{ flex: 1 }}
        >
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