import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { getChatId, sendMessage, type ChatMessage } from "../firebase/chat";

interface ChatBoxProps {
  sellerId: string;
}

export default function ChatBox({ sellerId }: ChatBoxProps) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ✅ Generate chatId safely
  const chatId = useMemo(() => {
    if (!user?.uid || !sellerId) return "";
    return getChatId(user.uid, sellerId);
  }, [user?.uid, sellerId]);

  // ✅ Listen to messages
  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ChatMessage, "id">),
        }));

        setMessages(msgs);
        setLoading(false);
      },
      (err) => {
        console.error("🔥 Chat listener error:", err);

        // 🔥 VERY IMPORTANT: this is your likely issue
        if (err.message.includes("index")) {
          toast.error("Firestore index required. Check console.");
        } else {
          toast.error("Failed to load chat");
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  // ✅ Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Format time safely
  const formatTime = (timestamp: any) => {
    if (!timestamp?.seconds) return "";

    return new Date(timestamp.seconds * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Send message (with optimistic UI)
  const handleSend = async () => {
    if (!text.trim() || !user?.uid || !chatId) return;

    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      chatId,
      senderId: user.uid,
      receiverId: sellerId,
      text: text.trim(),
      createdAt: { seconds: Date.now() / 1000 },
    };

    // 🔥 Optimistic UI (fixes "stagnant" feeling)
    setMessages((prev) => [...prev, tempMessage]);
    setText("");

    try {
      await sendMessage({
        chatId,
        senderId: user.uid,
        receiverId: sellerId,
        text: tempMessage.text,
      });
    } catch (err) {
      console.error("❌ Send error:", err);
      toast.error("Failed to send message");

      // rollback if failed
      setMessages((prev) =>
        prev.filter((m) => m.id !== tempMessage.id)
      );
    }
  };

  // ✅ Not logged in
  if (!user) {
    return <p style={{ padding: 10 }}>Please login to chat</p>;
  }

  return (
    <div
      style={{
        marginTop: 16,
        border: "1px solid #ddd",
        borderRadius: 10,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: 350,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: 10,
          background: "#075E54",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        Chat with Seller
      </div>

      {/* MESSAGES */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 10,
          background: "#e5ddd5",
        }}
      >
        {loading && (
          <div style={{ fontSize: 12, color: "#666" }}>
            Loading chat...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ color: "#666", fontSize: 13, padding: 8 }}>
            No messages yet. Start the conversation.
          </div>
        )}

        {messages.map((m) => {
          const isMe = m.senderId === user.uid;

          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: isMe ? "#DCF8C6" : "#fff",
                  fontSize: 13,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                <div>{m.text}</div>

                <div
                  style={{
                    fontSize: 10,
                    color: "#555",
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div
        style={{
          display: "flex",
          padding: 8,
          borderTop: "1px solid #ddd",
          background: "#f0f0f0",
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 20,
            border: "1px solid #ccc",
            outline: "none",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          style={{
            marginLeft: 8,
            padding: "0 16px",
            borderRadius: 20,
            border: "none",
            background: "#25D366",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}