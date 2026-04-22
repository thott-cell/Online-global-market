// src/pages/Checkout.tsx
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import SavedAddress from "./SavedAddress";
import { formatNaira } from "../utils/formatPrice";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  runTransaction,
} from "firebase/firestore";

interface CheckoutProps {
  setCurrentPage?: (page: string, extra?: any) => void;
}

interface Address {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
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
}

const DELIVERY_FEE = 1500;

const toNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const getOriginalPrice = (item: CartItem) => toNumber(item.price);

const getEffectivePrice = (item: CartItem) => {
  const originalPrice = getOriginalPrice(item);

  const directDiscountPrice =
    item.discountedPrice ?? item.discountPrice ?? item.salePrice;

  if (directDiscountPrice !== undefined && directDiscountPrice !== null) {
    const price = toNumber(directDiscountPrice);
    if (price > 0) return price;
  }

  const discountValue = toNumber(item.discount);

  if (discountValue > 0 && discountValue < 100) {
    const discounted = originalPrice - originalPrice * (discountValue / 100);
    return Math.max(0, Number(discounted.toFixed(2)));
  }

  return originalPrice;
};

const Checkout = ({ setCurrentPage }: CheckoutProps) => {
  const { cartItems, clearCart } = useCart() as {
    cartItems: CartItem[];
    clearCart: () => void;
  };

  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [editingAddress, setEditingAddress] = useState(false);
  const [checkingAddress, setCheckingAddress] = useState(true);
  const [gpsChecked, setGpsChecked] = useState(false);
  const [gpsAllowed, setGpsAllowed] = useState(true);

  const itemsTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + getEffectivePrice(item) * toNumber(item.quantity);
    }, 0);
  }, [cartItems]);

  const total = itemsTotal + DELIVERY_FEE;

  const generateOrderId = () =>
    "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  useEffect(() => {
    const loadAddress = async () => {
      if (!user) {
        setCheckingAddress(false);
        return;
      }

      try {
        const q = query(
          collection(db, "addresses"),
          where("userId", "==", user.uid)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          setAddress(snap.docs[0].data() as Address);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load address");
      } finally {
        setCheckingAddress(false);
      }
    };

    loadAddress();
  }, [user]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsAllowed(false);
      setGpsChecked(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setGpsAllowed(true);
        setGpsChecked(true);
      },
      () => {
        setGpsAllowed(false);
        setGpsChecked(true);
      }
    );
  }, []);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Login required");
      setCurrentPage?.("login");
      return;
    }

    if (!address) {
      toast.error("Add delivery address");
      setEditingAddress(true);
      return;
    }

    const state = address.state?.toLowerCase() || "";
    if (!state.includes("ekiti")) {
      toast.error("Delivery is only available in Ekiti State");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setLoading(true);

    try {
      await runTransaction(db, async (transaction) => {
        for (const item of cartItems) {
          const productRef = doc(db, "products", item.id);
          const productSnap = await transaction.get(productRef);

          if (!productSnap.exists()) {
            throw new Error(`${item.title} not found`);
          }

          const productData = productSnap.data() as { stock?: unknown };
          const currentStock = toNumber(productData.stock);
          const requestedQuantity = toNumber(item.quantity);

          if (currentStock < requestedQuantity) {
            throw new Error(`${item.title} is out of stock`);
          }

          transaction.update(productRef, {
            stock: currentStock - requestedQuantity,
          });
        }
      });

      const products = cartItems.map((item) => {
        const originalPrice = getOriginalPrice(item);
        const effectivePrice = getEffectivePrice(item);

        return {
          id: item.id,
          title: item.title,
          description: item.description || "",
          price: effectivePrice,
          originalPrice,
          quantity: toNumber(item.quantity),
          imageUrl: item.imageUrl || "",
          sellerId: item.sellerId || "",
          hasDiscount: effectivePrice < originalPrice,
        };
      });

      await addDoc(collection(db, "orders"), {
        orderId: generateOrderId(),
        userId: user.uid,
        products,
        itemsTotal,
        deliveryFee: DELIVERY_FEE,
        total,
        status: "pending",
        paymentMethod: "Pay on Delivery",
        address: {
          name: address.name,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
        },
        createdAt: serverTimestamp(),
      });

      toast.success("Order placed!");
      clearCart();
      setCurrentPage?.("orderSuccess");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Order failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAddress) return <Loading message="Preparing checkout..." />;

  if (editingAddress) {
    return (
      <SavedAddress
        onSaved={(addr: Address) => {
          setAddress(addr);
          setEditingAddress(false);
        }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", padding: 16 }}>
      <h2>Checkout</h2>

      {gpsChecked && !gpsAllowed && (
        <div
          style={{
            background: "#fff3cd",
            padding: 10,
            borderRadius: 8,
            marginBottom: 10,
            fontSize: 13,
          }}
        >
          Location is off. Delivery is only available in Ekiti.
        </div>
      )}

      {cartItems.length === 0 ? (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p>Your cart is empty.</p>
          <button onClick={() => setCurrentPage?.("home")} style={secondaryBtn}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              gap: 10,
              padding: "10px 0",
              scrollSnapType: "x mandatory",
            }}
          >
            {cartItems.map((item) => {
              const effectivePrice = getEffectivePrice(item);
              const originalPrice = getOriginalPrice(item);
              const hasDiscount = effectivePrice < originalPrice;

              return (
                <div key={item.id} style={itemCard}>
                  <img src={item.imageUrl} alt={item.title} style={itemImg} />
                  <div>
                    <strong style={{ fontSize: 14 }}>{item.title}</strong>
                    {item.description && (
                      <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                        {item.description}
                      </p>
                    )}
                    <div style={{ fontWeight: "bold" }}>
                      {formatNaira(effectivePrice)} × {item.quantity}
                    </div>
                    {hasDiscount && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#999",
                          textDecoration: "line-through",
                        }}
                      >
                        {formatNaira(originalPrice)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={section}>
            <h3>Delivery Address</h3>
            {address ? (
              <>
                <p>{address.name}</p>
                <p>{address.phone}</p>
                <p>
                  {address.street}, {address.city}, {address.state}
                </p>
                <button style={editBtn} onClick={() => setEditingAddress(true)}>
                  Edit Address
                </button>
              </>
            ) : (
              <button style={editBtn} onClick={() => setEditingAddress(true)}>
                Add Address
              </button>
            )}
          </div>

          <div style={section}>
            <h3>Summary</h3>
            <div>Items: {formatNaira(itemsTotal)}</div>
            <div>Delivery: {formatNaira(DELIVERY_FEE)}</div>
            <strong>Total: {formatNaira(total)}</strong>
          </div>

          <button
            style={checkoutBtn}
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </>
      )}
    </div>
  );
};

export default Checkout;

const section: CSSProperties = {
  marginTop: 20,
  padding: 12,
  borderTop: "1px solid #eee",
};

const editBtn: CSSProperties = {
  marginTop: 8,
  padding: "6px 12px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const checkoutBtn: CSSProperties = {
  width: "100%",
  marginTop: 20,
  padding: 14,
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  cursor: "pointer",
};

const secondaryBtn: CSSProperties = {
  marginTop: 12,
  padding: "12px 16px",
  background: "#eee",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const itemCard: CSSProperties = {
  minWidth: "80%",
  display: "flex",
  gap: 10,
  padding: 10,
  background: "#fff",
  borderRadius: 10,
  scrollSnapAlign: "start",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};

const itemImg: CSSProperties = {
  width: 60,
  height: 60,
  borderRadius: 8,
  objectFit: "cover",
};