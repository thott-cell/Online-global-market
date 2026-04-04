import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
}

const steps = ["pending", "processing", "dispatch", "delivered"];

const OrderDetail = ({ orderId, onBack }: OrderDetailProps) => {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, "orders", orderId));
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
    };
    fetchOrder();
  }, [orderId]);

  if (!order) return <p style={{ padding: 20 }}>Loading...</p>;

  const currentStep = steps.indexOf(order.status);
  const totalAmount = order.products?.reduce(
  (sum: number, p: any) => sum + p.price * p.quantity,
  0
);



  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backBtn}>← Back</button>

      {/* CARD */}
      <div style={styles.card}>
        <h2 style={styles.title}>Order #{order.id}</h2>
        <p style={styles.total}>₦{totalAmount?.toLocaleString()}</p>

        {/* TRACKING */}
        <div style={styles.tracker}>
          {steps.map((step, i) => (
            <div key={step} style={styles.stepWrap}>
              <div
                style={{
                  ...styles.circle,
                  background: i <= currentStep ? "#28a745" : "#ddd",
                }}
              />
              <span style={styles.label}>{step}</span>

              {i < steps.length - 1 && (
                <div
                  style={{
                    ...styles.line,
                    background: i < currentStep ? "#28a745" : "#ddd",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <div style={styles.card}>
        <h3>Products</h3>
        {order.products?.map((p: any) => (
          <div key={p.id || p.title} style={styles.product}>
            <div>
              <strong>{p.title}</strong>
              <p style={{ color: "#777", fontSize: 13 }}>
                Qty: {p.quantity}
              </p>
            </div>
            <div>₦{p.price}</div>
          </div>
        ))}
      </div>

      {/* ADDRESS */}
      <div style={styles.card}>
        <h3>Delivery Address</h3>
        <p>{order.address?.name}</p>
        <p>{order.address?.street}</p>
        <p>
          {order.address?.city}, {order.address?.state}
        </p>
        <p>{order.address?.phone}</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 500,
    margin: "20px auto",
    padding: "10px",
  },

  backBtn: {
    marginBottom: 10,
    border: "none",
    background: "none",
    fontSize: 16,
    cursor: "pointer",
  },

  card: {
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  title: {
    marginBottom: 5,
  },

  total: {
    color: "#28a745",
    fontWeight: "bold",
    marginBottom: 15,
  },

  tracker: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },

  stepWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    flex: 1,
  },

  circle: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    zIndex: 2,
  },

  line: {
    position: "absolute",
    top: 6,
    left: "50%",
    width: "100%",
    height: 2,
    zIndex: 1,
  },

  label: {
    fontSize: 12,
    marginTop: 6,
    textTransform: "capitalize",
  },

  product: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
};

export default OrderDetail;