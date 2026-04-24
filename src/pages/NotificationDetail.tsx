// src/pages/NotificationDetail.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {useNavigate} from "react-router-dom"

interface Props {
  notificationId: string;
  onBack: ()=> void;
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt?: any;
  senderName?: string;
  relatedOrderId?: string;
  relatedProductId?: string;
}


const NotificationDetail = ({ notificationId }: Props) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const ref = doc(db, "notifications", notificationId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Notification;
          setNotification(data);

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

  if (loading) {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        Loading notification...
      </div>
    );
  }

  if (!notification) {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        Notification not found.
      </div>
    );
  }

  const formattedDate = notification.createdAt?.toDate
    ? notification.createdAt.toDate().toLocaleString()
    : "";

 return (
  <div className="notification-page">
    <div className="notification-card">

      {/* HEADER */}
      <div className="header">
        <div className="icon">📦</div>
        <div>
          <h3 className="heading">Order Update</h3>
          <p className="sub">
            {notification.senderName || "System Notification"}
          </p>
        </div>
      </div>

      {/* MESSAGE BOX */}
      <div className="message-box">
        {notification.message}
      </div>

      {/* DETAILS */}
      <div className="details">
        {notification.relatedOrderId && (
          <div className="row">
            <span>Order ID</span>
            <strong>{notification.relatedOrderId}</strong>
          </div>
        )}

        {notification.relatedProductId && (
          <div className="row">
            <span>Product</span>
            <strong>{notification.relatedProductId}</strong>
          </div>
        )}

        <div className="row">
          <span>Status</span>
          <strong className={notification.read ? "read" : "unread"}>
            {notification.read ? "Read" : "Unread"}
          </strong>
        </div>

        <div className="row">
          <span>Date</span>
          <strong>
            {notification.createdAt?.toDate
              ? notification.createdAt.toDate().toLocaleString()
              : "-"}
          </strong>
        </div>
      </div>

      {/* ACTION BUTTON */}
      {notification.relatedOrderId && (
       <button
  className="action-btn"
  onClick={() => navigate(`/order/${notification.relatedOrderId}`)}
>
  View Order
</button>
      )}

    </div>

    <style>{`
      .notification-page {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 16px;
        min-height: 75vh;
        background: #f7f7f7;
      }

      .notification-card {
        width: 100%;
        max-width: 500px;
        background: #fff;
        border-radius: 18px;
        padding: 20px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        animation: fadeIn 0.3s ease;
      }

      /* HEADER */
      .header {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 16px;
      }

      .icon {
        font-size: 28px;
        background: #e8f5e9;
        color: #28a745;
        padding: 10px;
        border-radius: 12px;
      }

      .heading {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }

      .sub {
        margin: 2px 0 0;
        font-size: 12px;
        color: #777;
      }

      /* MESSAGE */
      .message-box {
        background: #f1f3f5;
        padding: 14px;
        border-radius: 12px;
        font-size: 15px;
        line-height: 1.5;
        margin-bottom: 16px;
      }

      /* DETAILS */
      .details {
        border-top: 1px solid #eee;
        padding-top: 12px;
      }

      .row {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        margin: 8px 0;
      }

      .row span {
        color: #666;
      }

      .row strong {
        font-weight: 600;
      }

      .read {
        color: #28a745;
      }

      .unread {
        color: #d32f2f;
      }

      /* BUTTON */
      .action-btn {
        margin-top: 18px;
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: #28a745;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        transition: 0.2s;
      }

      .action-btn:hover {
        background: #218838;
      }

      /* ANIMATION */
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* MOBILE */
      @media (max-width: 600px) {
        .notification-card {
          padding: 16px;
        }

        .message-box {
          font-size: 14px;
        }
      }
    `}</style>
  </div>
);
};

export default NotificationDetail;