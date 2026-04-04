import { useCart } from "../context/CartContext";
import { formatNaira } from "../utils/formatPrice";
import toast from "react-hot-toast";

interface CartProps {
  setCurrentPage: (page: string, extra?: { productId?: string }) => void;
}

const Cart = ({ setCurrentPage }: CartProps) => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const deliveryFee = 1500;

  // Helper to get effective price per item
 const getItemPrice = (item: any) => {
  // 1. If discounted price already exists → use it
  if (item.discountedPrice != null) {
    return Number(item.discountedPrice);
  }

  // 2. If discount percentage exists → calculate it
  if (item.discount != null) {
    return Number(item.price) - Number(item.price) * (Number(item.discount) / 100);
  }

  // 3. fallback → normal price
  return Number(item.price);
};

  const itemsTotal = cartItems.reduce(
    (acc, item) => acc + getItemPrice(item) * item.quantity,
    0
  );

  const total = itemsTotal + deliveryFee;

  const handleIncrease = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
      toast.success(`Increased quantity for ${item.title}`);
    }
  };

  const handleDecrease = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
      toast.success(`Decreased quantity for ${item.title}`);
    }
  };

  const handleRemove = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      removeFromCart(id);
      toast.success(`${item.title} removed from cart`);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: 700, margin: "20px auto", padding: 16, textAlign: "center" }}>
        <h2>Your cart is empty</h2>
        <button
          onClick={() => setCurrentPage("home")}
          style={{
            marginTop: 16,
            padding: "12px 16px",
            border: "none",
            borderRadius: 8,
            background: "#28a745",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", padding: 16 }}>
      <h2 style={{ marginBottom: 10 }}>Your Cart ({cartItems.length} items)</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cartItems.map((item) => {
          const effectivePrice = getItemPrice(item);

          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 10,
                borderRadius: 8,
                background: "#fafafa",
                gap: 10,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1 }}
                onClick={() => setCurrentPage("productDetail", { productId: item.id })}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                  />
                )}
                <div>
                  <strong style={{ fontSize: 14 }}>{item.title}</strong>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    {formatNaira(effectivePrice)}
                   {(item.discountedPrice != null || item.discount != null) && (
  <span style={{ textDecoration: "line-through", marginLeft: 6, color: "#999" }}>
    {formatNaira(item.price)}
  </span>
)}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDecrease(item.id);
                  }}
                  style={qtyBtn}
                >
                  -
                </button>
                <span style={{ minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncrease(item.id);
                  }}
                  style={qtyBtn}
                >
                  +
                </button>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item.id);
                }}
                style={removeBtn}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 10 }}>
        <button
          onClick={() => setCurrentPage("home")}
          style={{
            padding: "12px 16px",
            border: "none",
            borderRadius: 8,
            background: "#eee",
            cursor: "pointer",
            flex: 1,
          }}
        >
          Continue Shopping
        </button>

        <button
          onClick={() => setCurrentPage("checkout")}
          style={{
            padding: "12px 16px",
            border: "none",
            borderRadius: 8,
            background: "#28a745",
            color: "#fff",
            cursor: "pointer",
            flex: 1,
          }}
        >
          Proceed to Checkout
        </button>
      </div>

      <div
        style={{
          marginTop: 20,
          paddingTop: 12,
          borderTop: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div>Items: {formatNaira(itemsTotal)}</div>
          <div>Delivery: {formatNaira(deliveryFee)}</div>
          <strong>Total: {formatNaira(total)}</strong>
        </div>

        <button
          onClick={() => {
            clearCart();
            toast.success("Cart cleared");
          }}
          style={{
            padding: "10px 14px",
            border: "none",
            borderRadius: 8,
            background: "#dc3545",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
};

const qtyBtn = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: "none",
  background: "#28a745",
  color: "#fff",
  cursor: "pointer",
};

const removeBtn = {
  border: "none",
  background: "#d9534f",
  color: "#fff",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
};

export default Cart;