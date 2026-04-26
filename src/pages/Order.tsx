import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

interface OrderProduct {
  id?: string;
  title?: string;
  price: number;
  quantity: number;
  sellerId?: string;
}

interface Order {
  orderId: string;
  id: string;
  status: "pending" |  "processing" | "dispatch" | "delivered";
  createdAt?: any;
  products?: OrderProduct[];
}

interface OrdersProps {
  setCurrentPage?: (page: string, extra?: any) => void;
}

const formatAmount = (value: number) => `₦${value.toLocaleString()}`;

const calculateOrderTotal = (products?: OrderProduct[]) => {
  if (!Array.isArray(products)) return 0;

  return products.reduce((sum, p) => {
    const price = Number(p.price) || 0;
    const quantity = Number(p.quantity) || 0;
    return sum + price * quantity;
  }, 0);
};

const Orders = ({ setCurrentPage }: OrdersProps) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const mappedOrders = snap.docs.map((d) => {
          const data = d.data() as Omit<Order, "id">;

          return {
            id: d.id,
            ...data,
          };
        });

        setOrders(mappedOrders);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load orders:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "📦";
      case "processing":
        return "⚙️";
      case "dispatch":
        return "🚚";
      case "delivered":
        return "✅";
      case "delivered":
        return "🎉";
      default:
        return "📦";
    }
  };

  if (!user) return <p style={{ textAlign: "center" }}>Please sign in.</p>;

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", padding: "0 10px" }}>
      <h2 style={{ marginBottom: 15 }}>Your Orders</h2>

      {loading && <p>Loading orders…</p>}
      {!loading && orders.length === 0 && <p>No orders yet.</p>}

      {orders.map((order) => {
        const total = calculateOrderTotal(order.products);

        const dateStr =
          typeof order.createdAt?.toDate === "function"
            ? order.createdAt.toDate().toLocaleDateString()
            : "";

        return (
          <div
            key={order.id}
            onClick={() => setCurrentPage?.("orderDetail", { orderId: order.id })}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 10px",
              borderBottom: "1px solid #eee",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>Order: {order.orderId ?? order.id}</div>

              <div style={{ fontSize: 13, color: "#666" }}>
                {formatAmount(total)}
              </div>

              <div style={{ fontSize: 11, color: "#aaa" }}>{dateStr}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{getStatusIcon(order.status)}</span>
              <span style={{ fontSize: 12, color: "#555" }}>{order.status}</span>
              <span style={{ fontSize: 18 }}>›</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Orders;