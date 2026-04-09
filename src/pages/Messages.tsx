import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: any;
  read?: boolean;
}

interface ChatPreview {
  chatId: string;
  lastMessage: string;
  lastTime: any;
  unreadCount: number;
  otherUserId: string;
}

interface Props {
  onOpenChat: (chatId: string) => void;
}

const Messages: React.FC<Props> = ({ onOpenChat }) => {
  const { user } = useAuth();

  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, "messages");

    // Get all messages where user is involved
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const allMessages = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      // Filter only messages involving current user
      const userMessages = allMessages.filter(
        (m) => m.senderId === user.uid || m.receiverId === user.uid
      );

      const chatMap = new Map<string, ChatPreview>();

      userMessages.forEach((msg) => {
        const chatId = msg.chatId;

        const isUnread =
          msg.receiverId === user.uid && msg.read !== true;

        if (!chatMap.has(chatId)) {
          chatMap.set(chatId, {
            chatId,
            lastMessage: msg.text,
            lastTime: msg.createdAt,
            unreadCount: isUnread ? 1 : 0,
            otherUserId:
              msg.senderId === user.uid ? msg.receiverId : msg.senderId,
          });
        } else {
          const existing = chatMap.get(chatId)!;

          // count unread
          if (isUnread) {
            existing.unreadCount += 1;
          }

          // keep latest message already first because sorted desc
        }
      });

      setChats(Array.from(chatMap.values()));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (!user) return <p>Please login to view messages</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Messages</h2>

      {loading && <p>Loading chats...</p>}

      {!loading && chats.length === 0 && (
        <p style={{ opacity: 0.6 }}>No messages yet</p>
      )}

      <div style={styles.list}>
        {chats.map((chat) => (
          <div
            key={chat.chatId}
            style={styles.chatItem}
            onClick={() => onOpenChat(chat.chatId)}
          >
            <div style={styles.avatar}>
              {chat.otherUserId.slice(0, 2).toUpperCase()}
            </div>

            <div style={styles.content}>
              <div style={styles.topRow}>
                <span style={styles.name}>{chat.otherUserId}</span>

                {chat.unreadCount > 0 && (
                  <span style={styles.badge}>
                    {chat.unreadCount}
                  </span>
                )}
              </div>

              <p style={styles.message}>{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 12,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  chatItem: {
    display: "flex",
    gap: 10,
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 10,
    cursor: "pointer",
    alignItems: "center",
    background: "#fff",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#007bff",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
  },

  content: {
    flex: 1,
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontWeight: 600,
  },

  message: {
    margin: 0,
    fontSize: 13,
    opacity: 0.7,
  },

  badge: {
    background: "red",
    color: "white",
    borderRadius: 20,
    padding: "2px 8px",
    fontSize: 12,
  },
};

export default Messages;