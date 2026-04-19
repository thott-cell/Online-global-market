import { useMemo, useState } from "react";
import {
  FaBox,
  FaCreditCard,
  FaShoppingBag,
  FaSearch,
  FaArrowLeft,
  FaPhone,
  FaComments,
} from "react-icons/fa";

type View =
  | "home"
  | "orders"
  | "payments"
  | "products"
  | "contact";

const HelpCenter = () => {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("home");

  const topics = [
    {
      key: "orders",
      title: "Orders",
      desc: "Track, cancel or manage orders",
      icon: <FaBox />,
    },
    {
      key: "payments",
      title: "Payments",
      desc: "Refunds, failed payments, wallet issues",
      icon: <FaCreditCard />,
    },
    {
      key: "products",
      title: "Products",
      desc: "Returns, damaged items, quality issues",
      icon: <FaShoppingBag />,
    },
    {
      key: "contact",
      title: "Contact Support",
      desc: "Talk to an agent instantly",
      icon: <FaPhone />,
    },
  ];

  const filtered = useMemo(() => {
    return topics.filter((t) =>
      t.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const goBack = () => setView("home");

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        {view !== "home" && (
          <button style={styles.backBtn} onClick={goBack}>
            <FaArrowLeft /> Back
          </button>
        )}

        <h2 style={styles.title}>Help Center</h2>

        {view === "home" && (
          <>
            <p style={styles.sub}>What do you need help with?</p>

            <div style={styles.searchBox}>
              <FaSearch />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders, payments..."
                style={styles.input}
              />
            </div>
          </>
        )}
      </div>

      {/* HOME VIEW */}
      {view === "home" && (
        <div style={styles.grid}>
          {filtered.map((item) => (
            <div
              key={item.key}
              style={styles.card}
              onClick={() => setView(item.key as View)}
            >
              <div style={styles.icon}>{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* ORDERS */}
      {view === "orders" && (
        <div style={styles.panel}>
          <h3>📦 Order Tracker</h3>
          <p>Enter order ID to track delivery status:</p>

          <input style={styles.fullInput} placeholder="e.g. CMP-88291" />

          <button style={styles.primaryBtn}>
            Track Order
          </button>

          <div style={styles.fakeBox}>
            <p>Status: <b>In Transit 🚚</b></p>
            <p>Estimated Delivery: Tomorrow</p>
          </div>
        </div>
      )}

      {/* PAYMENTS */}
      {view === "payments" && (
        <div style={styles.panel}>
          <h3>💳 Payments & Refunds</h3>

          <div style={styles.cardBox}>
            <p>Recent Transaction</p>
            <b>₦12,500 - Completed</b>
          </div>

          <button style={styles.primaryBtn}>
            Request Refund
          </button>

          <button style={styles.secondaryBtn}>
            Payment Methods
          </button>

          <div style={styles.note}>
            Refunds take 3–7 working days depending on your bank.
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {view === "products" && (
        <div style={styles.panel}>
          <h3>📦 Product Issues</h3>

          <button style={styles.primaryBtn}>Return Item</button>
          <button style={styles.secondaryBtn}>Report Damaged Item</button>
          <button style={styles.secondaryBtn}>Wrong Product Received</button>

          <div style={styles.note}>
            You can return eligible items within 7 days.
          </div>
        </div>
      )}

      {/* CONTACT */}
      {view === "contact" && (
        <div style={styles.panel}>
          <h3>📞 Contact Support</h3>

          <textarea
            placeholder="Describe your issue..."
            style={styles.textarea}
          />

          <button style={styles.primaryBtn}>
            <FaComments /> Start Chat
          </button>

          <div style={styles.note}>
            Average response time: under 5 minutes
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 16,
    maxWidth: 720,
    margin: "0 auto",
    fontFamily: "sans-serif",
  },

  header: {
    marginBottom: 20,
  },

  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    border: "none",
    background: "transparent",
    color: "#075E54",
    fontWeight: 600,
    cursor: "pointer",
  },

  title: {
    margin: 0,
    fontSize: 22,
  },

  sub: {
    color: "#666",
    fontSize: 13,
    marginTop: 4,
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    background: "#f3f4f6",
    borderRadius: 10,
    marginTop: 10,
  },

  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  card: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid #eee",
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
    cursor: "pointer",
    background: "#fff",
  },

  icon: {
    fontSize: 18,
    marginBottom: 6,
    color: "#075E54",
  },

  panel: {
    padding: 16,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },

  fullInput: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  primaryBtn: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    background: "#075E54",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  secondaryBtn: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    background: "#f3f4f6",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  textarea: {
    width: "100%",
    height: 100,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  cardBox: {
    padding: 12,
    borderRadius: 10,
    background: "#f9fafb",
    marginTop: 10,
  },

  note: {
    marginTop: 10,
    fontSize: 12,
    color: "#666",
  },

  fakeBox: {
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    background: "#e8f5e9",
  },
};

export default HelpCenter;