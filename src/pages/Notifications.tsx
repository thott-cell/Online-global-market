// src/components/Notifications.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, getDoc } from "firebase/firestore";


interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt?: any;
}

interface NotificationsProps {
  notificationId?: string; // optional, shows single detail if provided
  onBack?: () => void;
  onSelectNotification?: (id: string) => void; // called when list item clicked
}

const Notifications = ({ notificationId,  onSelectNotification }: NotificationsProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all notifications if no notificationId
  useEffect(() => {
    if (!user || notificationId) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      snapshot => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[];

        // Sort by timestamp
        items.sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return bTime - aTime;
        });

        setNotifications(items);
        setLoading(false);
      },
      err => {
        console.error("Failed to fetch notifications:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, notificationId]);

  // Fetch single notification if notificationId is provided
  useEffect(() => {
    if (!user || !notificationId) return;

    const fetchNotification = async () => {
      try {
        const docRef = doc(db, "notifications", notificationId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const notif = { id: docSnap.id, ...docSnap.data() } as Notification;
          setSelectedNotification(notif);

          // mark as read if unread
          if (!notif.read) {
            await updateDoc(docRef, { read: true });
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch notification detail:", err);
        setLoading(false);
      }
    };

    fetchNotification();
  }, [user, notificationId]);

  if (!user) return <div style={{ padding: 40, textAlign: "center" }}>Please log in</div>;

  // Show detail view
  if (notificationId) {
    if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
    if (!selectedNotification) return <p style={{ textAlign: "center" }}>Notification not found.</p>;

    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>

        <h2>Notification Detail</h2>
        <div
          style={{
            border: "1px solid #eee",
            padding: 16,
            borderRadius: 8,
            background: "#f9f9f9",
          }}
        >
          <p>{selectedNotification.message}</p>
          <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
            {selectedNotification.createdAt?.toDate
              ? selectedNotification.createdAt.toDate().toLocaleString()
              : "-"}
          </div>
        </div>
      </div>
    );
  }

  // Show list view
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>Notifications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifications.map(notif => (
            <li
              key={notif.id}
              style={{
                border: "1px solid #eee",
                padding: 12,
                marginBottom: 8,
                background: notif.read ? "#f9f9f9" : "#e0f7fa",
                cursor: "pointer"
              }}
              onClick={() => onSelectNotification?.(notif.id)}
            >
              {notif.message}
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                {notif.createdAt?.toDate
                  ? notif.createdAt.toDate().toLocaleString()
                  : "-"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;