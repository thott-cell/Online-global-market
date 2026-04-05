// src/components/ProfileMenu.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faReceipt,
  faHome,
  faCreditCard,
  faCog,
  faStore,
  faPlus,
  faTools,
  faQuestionCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

interface Notification {
  id: string;
  message: string;
  createdAt: any;
  read: boolean;
}

interface ProfileMenuProps {
  onNavigate: (page: string) => void;
  role?: "buyer" | "seller" | "admin" | null;
}

const ProfileMenu = ({ onNavigate, role }: ProfileMenuProps) => {
  const { user } = useAuth();

  const [pendingProductsCount, setPendingProductsCount] = useState(0);
  const [approvedProductsCount, setApprovedProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user || role !== "seller") return;

    const productsRef = collection(db, "products");
    const qProducts = query(productsRef, where("sellerId", "==", user.uid));

    const unsubProducts = onSnapshot(qProducts, (snap) => {
      const docs = snap.docs.map((d) => d.data());
      setPendingProductsCount(docs.filter((p: any) => p.status === "pending").length);
      setApprovedProductsCount(docs.filter((p: any) => p.status === "approved").length);
    });

    const ordersRef = collection(db, "orders");

    const unsubOrders = onSnapshot(ordersRef, (snap) => {
      const c = snap.docs
        .map((d) => d.data())
        .filter((order: any) =>
          order.products?.some((p: any) => p.sellerId === user.uid)
        ).length;

      setOrdersCount(c);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [user, role]);

  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })) as Notification[]
      );
    });

    return () => unsub();
  }, [user]);

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);

    await Promise.all(
      unread.map((n) =>
        updateDoc(doc(db, "notifications", n.id), { read: true })
      )
    );
  };

  const showSellerBlock = role === "seller";
  const showAdminBlock = role === "admin";

  return (
    <div style={styles.menu}>
      {/* Notifications */}
      {user && (
        <button
          style={styles.item}
          onClick={() => {
            onNavigate("notifications");
            setTimeout(markAllAsRead, 100);
          }}
        >
          <FontAwesomeIcon icon={faBell} /> Notifications
          {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
        </button>
      )}

      <button style={styles.item} onClick={() => onNavigate("orders")}>
        <FontAwesomeIcon icon={faReceipt} /> Orders
      </button>

      <button style={styles.item} onClick={() => onNavigate("addresses")}>
        <FontAwesomeIcon icon={faHome} /> Saved Addresses
      </button>

      <button style={styles.item} onClick={() => onNavigate("payments")}>
        <FontAwesomeIcon icon={faCreditCard} /> Payment Methods
      </button>

      <button style={styles.item} onClick={() => onNavigate("accountSettings")}>
        <FontAwesomeIcon icon={faCog} /> Account Settings
      </button>

      {/* SELLER */}
      {showSellerBlock && (
        <>
          <hr style={styles.sep} />

          <button
            style={styles.item}
            onClick={() => onNavigate("sellerDashboard")}
          >
            <FontAwesomeIcon icon={faStore} /> Seller Dashboard
          </button>

          <div style={styles.sellerStats}>
            <span style={styles.badge}>Pending {pendingProductsCount}</span>
            <span style={styles.badge}>Approved {approvedProductsCount}</span>
            <span style={styles.badge}>Orders {ordersCount}</span>
          </div>

          <button
            style={styles.item}
            onClick={() => onNavigate("sellerAddProduct")}
          >
            <FontAwesomeIcon icon={faPlus} /> Upload Product
          </button>
        </>
      )}

      {/* ADMIN */}
      {showAdminBlock && (
        <>
          <hr style={styles.sep} />

          <button
            style={styles.item}
            onClick={() => onNavigate("adminDashboard")}
          >
            <FontAwesomeIcon icon={faTools} /> Admin Dashboard
          </button>
        </>
      )}

      <hr style={styles.sep} />

      <button style={styles.item} onClick={() => onNavigate("help")}>
        <FontAwesomeIcon icon={faQuestionCircle} /> Help & Support
      </button>

      <button
        style={{ ...styles.item, color: "red" }}
        onClick={() => onNavigate("signout")}
      >
        <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  menu: { display: "flex", flexDirection: "column", gap: 8 },

  item: {
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #eee",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  sep: { border: "none", borderTop: "1px solid #eee" },

  sellerStats: { display: "flex", gap: 10 },

  badge: {
    background: "#007bff",
    color: "#fff",
    borderRadius: 20,
    padding: "4px 8px",
    fontSize: 12,
  },
};

export default ProfileMenu;