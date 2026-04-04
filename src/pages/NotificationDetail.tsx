// src/pages/NotificationDetail.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface Props {
  notificationId: string;
  onBack: () => void; // pass from App.tsx to handle previous page
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt?: any;
  senderName?: string; // optional sender info
  relatedOrderId?: string; // optional related order
  relatedProductId?: string; // optional related product
}

const NotificationDetail = ({ notificationId }: Props) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const ref = doc(db, "notifications", notificationId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Notification;
          setNotification(data);

          // Mark as read if not already
          if (!data.read) {
            await updateDoc(ref, { read: true });
          }
        }
      } catch (err) {
        console.error("Failed to fetch notification:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [notificationId]);

  if (loading)
    return <p style={{ padding: 20 }}>Loading notification details...</p>;

  if (!notification)
    return (
      <div style={{ padding: 20 }}>
        <p>Notification not found.</p>
      </div>
    );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      {/* Back button */}
      
      <h2>Notification Details</h2>

      <div
        style={{
          border: "1px solid #eee",
          padding: 20,
          borderRadius: 10,
          marginTop: 15,
          background: "#fff",
        }}
      >
        <p style={{ fontSize: 18, fontWeight: "500" }}>
          {notification.message}
        </p>

        {/* Optional sender info */}
        {notification.senderName && (
          <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
            From: {notification.senderName}
          </div>
        )}

        {/* Optional related order/product */}
        {notification.relatedOrderId && (
          <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
            Related Order ID: {notification.relatedOrderId}
          </div>
        )}
        {notification.relatedProductId && (
          <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
            Related Product ID: {notification.relatedProductId}
          </div>
        )}

        {/* Timestamp */}
        <div style={{ marginTop: 15, fontSize: 12, color: "#777" }}>
          {notification.createdAt?.toDate
            ? notification.createdAt.toDate().toLocaleString()
            : ""}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;