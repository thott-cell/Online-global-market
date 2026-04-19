import { useEffect, useState } from "react";
import {
  FaUsers,
  FaShoppingCart,
  FaStore,
  FaShieldAlt,
  FaRocket,
} from "react-icons/fa";

const AboutUs = () => {
  const [users, setUsers] = useState(0);
  const [orders, setOrders] = useState(0);
  const [sellers, setSellers] = useState(0);

  // fake animated counters (real app feel)
  useEffect(() => {
    let u = 0, o = 0, s = 0;

    const interval = setInterval(() => {
      if (u < 12000) u += 500;
      if (o < 35000) o += 1000;
      if (s < 2500) s += 100;

      setUsers(u);
      setOrders(o);
      setSellers(s);

      if (u >= 12000 && o >= 35000 && s >= 2500) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.page}>

      {/* HERO */}
      <div style={styles.hero}>
        <h1 style={styles.title}>Campus Marketplace</h1>
        <p style={styles.subtitle}>
          Buy, sell, and connect safely within your campus community
        </p>
      </div>

      {/* STATS */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <FaUsers />
          <h3>{users.toLocaleString()}+</h3>
          <p>Active Users</p>
        </div>

        <div style={styles.statCard}>
          <FaShoppingCart />
          <h3>{orders.toLocaleString()}+</h3>
          <p>Orders Completed</p>
        </div>

        <div style={styles.statCard}>
          <FaStore />
          <h3>{sellers.toLocaleString()}+</h3>
          <p>Verified Sellers</p>
        </div>
      </div>

      {/* MISSION */}
      <div style={styles.section}>
        <h2>🎯 Our Mission</h2>
        <p>
          We aim to create a safe, reliable, and fast marketplace where students
          can easily buy and sell products without stress.
        </p>
      </div>

      {/* WHY US */}
      <div style={styles.section}>
        <h2>⭐ Why Choose Us</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <FaShieldAlt style={styles.icon} />
            <h4>Secure Payments</h4>
            <p>All transactions are protected and monitored</p>
          </div>

          <div style={styles.card}>
            <FaRocket style={styles.icon} />
            <h4>Fast Delivery</h4>
            <p>Quick and reliable delivery within campus</p>
          </div>

          <div style={styles.card}>
            <FaUsers style={styles.icon} />
            <h4>Trusted Community</h4>
            <p>Only verified students and sellers</p>
          </div>
        </div>
      </div>

      {/* TEAM */}
      <div style={styles.section}>
        <h2>👥 Our Team</h2>

        <div style={styles.team}>
          <div style={styles.member}>
            <div style={styles.avatar}></div>
            <h4>Founder</h4>
            <p>Product & Vision</p>
          </div>

          <div style={styles.member}>
            <div style={styles.avatar}></div>
            <h4>Engineering</h4>
            <p>Platform Development</p>
          </div>

          <div style={styles.member}>
            <div style={styles.avatar}></div>
            <h4>Support</h4>
            <p>Customer Experience</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <h3>Start buying & selling today</h3>
        <button style={styles.button}>
          Explore Marketplace
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 16,
    maxWidth: 800,
    margin: "0 auto",
    fontFamily: "sans-serif",
  },

  hero: {
    textAlign: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 800,
  },

  subtitle: {
    color: "#666",
    fontSize: 14,
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    background: "#fff",
    padding: 14,
    borderRadius: 12,
    textAlign: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },

  section: {
    marginBottom: 20,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  card: {
    padding: 14,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },

  icon: {
    fontSize: 20,
    color: "#075E54",
    marginBottom: 6,
  },

  team: {
    display: "flex",
    gap: 12,
    justifyContent: "space-between",
  },

  member: {
    textAlign: "center",
    flex: 1,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#ddd",
    margin: "0 auto 8px",
  },

  cta: {
    textAlign: "center",
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    background: "#075E54",
    color: "#fff",
  },

  button: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#fff",
    color: "#075E54",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default AboutUs;