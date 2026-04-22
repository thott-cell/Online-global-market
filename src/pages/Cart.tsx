import { useMemo } from "react";
import { useCart } from "../context/CartContext";
import { formatNaira } from "../utils/formatPrice";
import toast from "react-hot-toast";

interface CartProps {
  setCurrentPage: (page: string, extra?: { productId?: string }) => void;
}

interface CartItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  sellerId?: string;
  discount?: number | string;
  discountedPrice?: number | string;
  discountPrice?: number | string;
  salePrice?: number | string;

  stock?: number;
  initialStock?: number;
  sold?: number;
}

const DELIVERY_FEE = 1500;

const Cart = ({ setCurrentPage }: CartProps) => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart() as {
    cartItems: CartItem[];
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
  };

  const getItemPrice = (item: CartItem) => {
    if (item.discountedPrice != null) {
      return Number(item.discountedPrice);
    }

    if (item.discountPrice != null) {
      return Number(item.discountPrice);
    }

    if (item.salePrice != null) {
      return Number(item.salePrice);
    }

    if (item.discount != null) {
      return Number(item.price) - Number(item.price) * (Number(item.discount) / 100);
    }

    return Number(item.price);
  };

  const getAvailableStock = (item: CartItem) => {
    if (Number.isFinite(Number(item.stock))) {
      return Math.max(0, Number(item.stock));
    }

    if (Number.isFinite(Number(item.initialStock)) || Number.isFinite(Number(item.sold))) {
      const initial = Number.isFinite(Number(item.initialStock)) ? Number(item.initialStock) : 0;
      const sold = Number.isFinite(Number(item.sold)) ? Number(item.sold) : 0;
      return Math.max(0, initial - sold);
    }

    return null;
  };

  const itemsTotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + getItemPrice(item) * item.quantity,
      0
    );
  }, [cartItems]);

  const total = itemsTotal + DELIVERY_FEE;

  const handleIncrease = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const availableStock = getAvailableStock(item);

    if (availableStock !== null && item.quantity >= availableStock) {
      toast.error(`Only ${availableStock} unit${availableStock === 1 ? "" : "s"} left`);
      return;
    }

    updateQuantity(id, item.quantity + 1);
    toast.success(`Increased quantity for ${item.title}`);
  };

  const handleDecrease = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    if (item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
      toast.success(`Decreased quantity for ${item.title}`);
    }
  };

  const handleRemove = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    removeFromCart(id);
    toast.success(`${item.title} removed from cart`);
  };

  const hasOutOfStockItem = cartItems.some((item) => {
    const availableStock = getAvailableStock(item);
    return availableStock !== null && availableStock <= 0;
  });

  if (cartItems.length === 0) {
    return (
      <div style={styles.page}>
        <h2 style={styles.title}>Your cart is empty</h2>
        <button onClick={() => setCurrentPage("home")} style={styles.greenBtn}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Your Cart ({cartItems.length} items)</h2>

      <div style={styles.itemsWrap}>
        {cartItems.map((item) => {
          const effectivePrice = getItemPrice(item);
          const originalPrice = Number(item.price);
          const hasDiscount = effectivePrice < originalPrice;
          const availableStock = getAvailableStock(item);
          const isOutOfStock = availableStock !== null && availableStock <= 0;

          return (
            <div key={item.id} style={styles.itemCard}>
              <div
                style={styles.itemMain}
                onClick={() =>
                  setCurrentPage("productDetail", { productId: item.id })
                }
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={styles.itemImg}
                  />
                )}

                <div style={styles.itemInfo}>
                  <strong style={styles.itemTitle}>{item.title}</strong>

                  {item.description && (
                    <p style={styles.itemDesc}>{item.description}</p>
                  )}

                  <div style={styles.priceRow}>
                    <span style={styles.currentPrice}>
                      {formatNaira(effectivePrice)}
                    </span>

                    {hasDiscount && (
                      <span style={styles.oldPrice}>
                        {formatNaira(originalPrice)}
                      </span>
                    )}
                  </div>

                  {availableStock !== null && (
                    <div style={styles.stockText}>
                      {isOutOfStock
                        ? "Out of stock"
                        : `${availableStock} unit${availableStock === 1 ? "" : "s"} available`}
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.controls}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDecrease(item.id);
                  }}
                  style={styles.qtyBtn}
                >
                  -
                </button>

                <span style={styles.qtyValue}>{item.quantity}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncrease(item.id);
                  }}
                  style={{
                    ...styles.qtyBtn,
                    opacity: isOutOfStock ? 0.5 : 1,
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                  }}
                  disabled={isOutOfStock}
                >
                  +
                </button>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item.id);
                }}
                style={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      {hasOutOfStockItem && (
        <div style={styles.warningBox}>
          Some items are out of stock. Please review your cart before checkout.
        </div>
      )}

      <div style={styles.actionsRow}>
        <button onClick={() => setCurrentPage("home")} style={styles.secondaryBtn}>
          Continue Shopping
        </button>

        <button
          onClick={() => setCurrentPage("checkout")}
          style={{
            ...styles.greenBtn,
            opacity: cartItems.length === 0 ? 0.7 : 1,
          }}
        >
          Proceed to Checkout
        </button>
      </div>

      <div style={styles.summaryBox}>
        <div>Items: {formatNaira(itemsTotal)}</div>
        <div>Delivery: {formatNaira(DELIVERY_FEE)}</div>
        <strong>Total: {formatNaira(total)}</strong>

        <button
          onClick={() => {
            clearCart();
            toast.success("Cart cleared");
          }}
          style={styles.dangerBtn}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 700,
    margin: "20px auto",
    padding: 16,
  },
  title: {
    marginBottom: 10,
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },
  itemsWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  itemCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    background: "#fafafa",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
    flexWrap: "wrap",
  },
  itemMain: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    flex: 1,
    minWidth: 0,
  },
  itemImg: {
    width: 48,
    height: 48,
    objectFit: "cover",
    borderRadius: 8,
    flexShrink: 0,
  },
  itemInfo: {
    minWidth: 0,
    flex: 1,
  },
  itemTitle: {
    display: "block",
    fontSize: 14,
    color: "#111827",
    wordBreak: "break-word",
  },
  itemDesc: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
    marginBottom: 0,
    lineHeight: 1.4,
    wordBreak: "break-word",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 6,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  },
  oldPrice: {
    fontSize: 12,
    color: "#999",
    textDecoration: "line-through",
  },
  stockText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 700,
    color: "#dc2626",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "none",
    background: "#28a745",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  qtyValue: {
    minWidth: 20,
    textAlign: "center",
    fontWeight: 700,
    color: "#111827",
  },
  removeBtn: {
    border: "none",
    background: "#d9534f",
    color: "#fff",
    borderRadius: 6,
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  actionsRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
    flexWrap: "wrap",
  },
  secondaryBtn: {
    padding: "12px 16px",
    border: "none",
    borderRadius: 8,
    background: "#eee",
    cursor: "pointer",
    flex: 1,
    minWidth: 160,
  },
  greenBtn: {
    padding: "12px 16px",
    border: "none",
    borderRadius: 8,
    background: "#28a745",
    color: "#fff",
    cursor: "pointer",
    flex: 1,
    minWidth: 160,
  },
  summaryBox: {
    marginTop: 20,
    paddingTop: 12,
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  dangerBtn: {
    padding: "10px 14px",
    border: "none",
    borderRadius: 8,
    background: "#dc3545",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  warningBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    background: "#fff3cd",
    color: "#856404",
    fontSize: 13,
  },
};

export default Cart;