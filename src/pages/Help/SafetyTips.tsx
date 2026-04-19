import { useState } from "react";
import {
  FaShieldAlt,
  FaShoppingCart,
  FaMoneyBillWave,
  FaUserLock,
  FaChevronDown,
  FaExclamationTriangle,
} from "react-icons/fa";

type Category = "buying" | "selling" | "payments" | "account";

const SafetyTips = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("buying");
  const [openTip, setOpenTip] = useState<number | null>(null);
  const [reportSent, setReportSent] = useState(false);

  const tips = {
    buying: [
      {
        title: "Verify seller before paying",
        content:
          "Always check seller ratings and reviews before making any payment. Avoid new or suspicious accounts with no history.",
      },
      {
        title: "Avoid deals that seem too good",
        content:
          "If a product price is extremely low, it may be a scam. Compare prices before purchasing.",
      },
      {
        title: "Meet in safe locations",
        content:
          "For physical meetups, choose public places like malls or campuses.",
      },
    ],
    selling: [
      {
        title: "Do not ship before payment confirmation",
        content:
          "Always confirm payment before dispatching any item.",
      },
      {
        title: "Beware of fake alerts",
        content:
          "Scammers may send fake bank alerts. Verify transactions directly from your bank.",
      },
    ],
    payments: [
      {
        title: "Use secure payment methods",
        content:
          "Avoid direct transfers to unknown accounts. Use trusted channels where possible.",
      },
      {
        title: "Never share OTP or PIN",
        content:
          "Your OTP, PIN, or password should never be shared with anyone.",
      },
    ],
    account: [
      {
        title: "Use a strong password",
        content:
          "Create a password with letters, numbers, and symbols.",
      },
      {
        title: "Enable security alerts",
        content:
          "Stay updated on login attempts and unusual activity.",
      },
    ],
  };

  const categories = [
    { key: "buying", label: "Buying", icon: <FaShoppingCart /> },
    { key: "selling", label: "Selling", icon: <FaShieldAlt /> },
    { key: "payments", label: "Payments", icon: <FaMoneyBillWave /> },
    { key: "account", label: "Account", icon: <FaUserLock /> },
  ];

  const handleReport = () => {
    setReportSent(true);
    setTimeout(() => setReportSent(false), 2500);
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.title}>Safety Tips</h2>
        <p style={styles.subtitle}>
          Stay safe while buying and selling on our platform
        </p>
      </div>

      {/* CATEGORY SELECTOR */}
      <div style={styles.tabs}>
        {categories.map((cat) => (
          <div
            key={cat.key}
            onClick={() => {
              setActiveCategory(cat.key as Category);
              setOpenTip(null);
            }}
            style={{
              ...styles.tab,
              ...(activeCategory === cat.key ? styles.activeTab : {}),
            }}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </div>
        ))}
      </div>

      {/* TIPS LIST */}
      <div style={styles.section}>
        {tips[activeCategory].map((tip, index) => (
          <div key={index} style={styles.card}>
            <div
              style={styles.cardHeader}
              onClick={() =>
                setOpenTip(openTip === index ? null : index)
              }
            >
              <span>{tip.title}</span>
              <FaChevronDown
                style={{
                  transform:
                    openTip === index ? "rotate(180deg)" : "rotate(0)",
                  transition: "0.3s",
                }}
              />
            </div>

            {openTip === index && (
              <p style={styles.cardContent}>{tip.content}</p>
            )}
          </div>
        ))}
      </div>

      {/* ALERT / REPORT */}
      <div style={styles.alertBox}>
        <FaExclamationTriangle />
        <div>
          <strong>Seen something suspicious?</strong>
          <p style={{ margin: "4px 0", fontSize: 13 }}>
            Report scams or unsafe users immediately.
          </p>
        </div>
        <button style={styles.reportBtn} onClick={handleReport}>
          Report
        </button>
      </div>

      {reportSent && (
        <div style={styles.toast}>
          Report sent successfully ✔
        </div>
      )}

      {/* CONTACT SUPPORT */}
      <button style={styles.supportBtn}>
        Contact Support
      </button>
    </div>
  );
};

/* ================= STYLES ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 16,
    maxWidth: 700,
    margin: "0 auto",
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: 800,
    margin: 0,
  },

  subtitle: {
    fontSize: 13,
    color: "#6b7280",
  },

  tabs: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    marginBottom: 20,
  },

  tab: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 10,
    background: "#f3f4f6",
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  activeTab: {
    background: "#075E54",
    color: "#fff",
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  card: {
    borderRadius: 14,
    background: "#fff",
    border: "1px solid #eee",
    overflow: "hidden",
  },

  cardHeader: {
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    cursor: "pointer",
    fontWeight: 600,
  },

  cardContent: {
    padding: "0 14px 14px",
    fontSize: 13,
    color: "#555",
  },

  alertBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    background: "#fff3cd",
    padding: 12,
    borderRadius: 12,
  },

  reportBtn: {
    marginLeft: "auto",
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
  },

  toast: {
    marginTop: 10,
    background: "#28a745",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 13,
  },

  supportBtn: {
    marginTop: 20,
    width: "100%",
    padding: 12,
    background: "#075E54",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default SafetyTips;