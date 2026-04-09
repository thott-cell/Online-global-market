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
  faCog,
  faStore,
  faPlus,
  faTools,
  faQuestionCircle,
  faSignOutAlt,
  faComments,
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
  const [messageChatsCount, setMessageChatsCount] = useState(0);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user || role !== "seller") return;

    const productsRef = collection(db, "products");
    const qProducts = query(productsRef, where("sellerId", "==", user.uid));

    const unsubProducts = onSnapshot(qProducts, (snap) => {
      const docs = snap.docs.map((d) => d.data());
      setPendingProductsCount(
        docs.filter((p: any) => p.status === "pending").length
      );
      setApprovedProductsCount(
        docs.filter((p: any) => p.status === "approved").length
      );
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

  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("receiverId", "==", user.uid));

    const unsub = onSnapshot(q, (snap) => {
      const incomingChatIds = new Set<string>();

      snap.docs.forEach((docItem) => {
        const data = docItem.data() as {
          chatId?: string;
          senderId?: string;
          receiverId?: string;
        };

        if (data.chatId && data.senderId && data.receiverId) {
          if (data.senderId !== user.uid) {
            incomingChatIds.add(data.chatId);
          }
        }
      });

      setMessageChatsCount(incomingChatIds.size);
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
      {user && (
        <>
          <button
            style={styles.item}
            onClick={() => {
              onNavigate("notifications");
              setTimeout(markAllAsRead, 100);
            }}
          >
            <FontAwesomeIcon icon={faBell} /> Notifications
            {unreadNotificationCount > 0 && (
              <span style={styles.badge}>{unreadNotificationCount}</span>
            )}
          </button>

          <button style={styles.item} onClick={() => onNavigate("messages")}>
            <FontAwesomeIcon icon={faComments} /> Messages
            {messageChatsCount > 0 && (
              <span style={styles.badge}>{messageChatsCount}</span>
            )}
          </button>
        </>
      )}

      <button style={styles.item} onClick={() => onNavigate("orders")}>
        <FontAwesomeIcon icon={faReceipt} /> Orders
      </button>

      <button style={styles.item} onClick={() => onNavigate("addresses")}>
        <FontAwesomeIcon icon={faHome} /> Saved Addresses
      </button>

      <button style={styles.item} onClick={() => onNavigate("accountSettings")}>
        <FontAwesomeIcon icon={faCog} /> Account Settings
      </button>

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
    justifyContent: "flex-start",
  },

  sep: { border: "none", borderTop: "1px solid #eee" },

  sellerStats: { display: "flex", gap: 10, flexWrap: "wrap" },

  badge: {
    background: "#007bff",
    color: "#fff",
    borderRadius: 20,
    padding: "4px 8px",
    fontSize: 12,
    whiteSpace: "nowrap",
  },
};

export default ProfileMenu;