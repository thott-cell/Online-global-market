import { useEffect, useRef, useState } from "react";
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
import { sendMessage, type ChatMessage } from "../firebase/chat";

interface ChatBoxProps {
  chatId: string;
}

export default function ChatBox({chatId}: ChatBoxProps) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // =========================
  // LOAD MESSAGES
  // =========================
  useEffect(() => {
    if (!chatId || !user?.uid) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    console.log("🔥 Listening to chat:", chatId);

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs: ChatMessage[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ChatMessage, "id">),
        }));

        setMessages(msgs);
        setLoading(false);
      },
      (err) => {
        console.error("🔥 Firestore error:", err);
        toast.error("Chat failed to load");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [chatId, user?.uid]);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================
  // SEND MESSAGE
  // =========================
  const handleSend = async () => {
  if (!text.trim() || !user?.uid || !chatId) return;

  const messageText = text.trim();
  setText("");

  // ✅ extract receiver from chatId
  const [userA, userB] = chatId.split("_");
  const receiverId = user.uid === userA ? userB : userA;

  try {
    await sendMessage({
      chatId,
      senderId: user.uid,
      receiverId, // ✅ FIXED
      text: messageText,
    });

    console.log("✅ sent");
  } catch (err) {
    console.error(err);
    toast.error("Send failed");
  }
};
  // =========================
  // GUARDS
  // =========================
  if (!user) return <p>Please login</p>;
  if (!chatId) return <p>No chat selected</p>;

  // =========================
  // UI
  // =========================
  return (
    <div style={{ display: "flex", flexDirection: "column", height: 350 }}>
      {/* HEADER */}
      <div style={{ padding: 10, background: "#075E54", color: "#fff" }}>
        Chat
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {loading && <p>Loading...</p>}

        {!loading && messages.length === 0 && (
          <p>No messages yet</p>
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
          borderRadius: 12,
          background: isMe ? "#DCF8C6" : "#fff",
          fontSize: 13,
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <div>{m.text}</div>

        {/* TIME */}
        {m.createdAt?.seconds && (
          <div
            style={{
              fontSize: 10,
              color: "#555",
              marginTop: 4,
              textAlign: "right",
            }}
          >
            {new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
})}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ display: "flex", padding: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type..."
          style={{ flex: 1, padding: 10 }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          style={{
            marginLeft: 8,
            background: "#25D366",
            color: "#fff",
            border: "none",
            padding: "0 16px",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}