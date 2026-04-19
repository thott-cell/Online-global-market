import { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaComments,
  FaPaperPlane,
} from "react-icons/fa";

const ContactUs = () => {
  const [view, setView] = useState<"home" | "chat" | "email">("home");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<string[]>([]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setChat((prev) => [...prev, `You: ${message}`]);

    // fake bot reply
    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        "Support: Thanks for reaching out. We're looking into it.",
      ]);
    }, 800);

    setMessage("");
  };

  return (
    <div style={styles.page}>

      {/* HOME */}
      {view === "home" && (
        <>
          <h2 style={styles.title}>Contact Support</h2>
          <p style={styles.sub}>
            We're here to help you 24/7
          </p>

          <div style={styles.grid}>
            <div style={styles.card} onClick={() => setView("chat")}>
              <FaComments style={styles.icon} />
              <h4>Live Chat</h4>
              <p>Chat instantly with support</p>
            </div>

            <div style={styles.card} onClick={() => setView("email")}>
              <FaEnvelope style={styles.icon} />
              <h4>Email Us</h4>
              <p>Send us a detailed message</p>
            </div>

            <div style={styles.card} onClick={() => alert("Calling support...")}>
              <FaPhone style={styles.icon} />
              <h4>Call Us</h4>
              <p>Speak directly with an agent</p>
            </div>
          </div>

          {/* QUICK ISSUES */}
          <div style={styles.section}>
            <h3>Quick Help</h3>

            <button style={styles.quickBtn}>
              I have a payment issue
            </button>

            <button style={styles.quickBtn}>
              I want a refund
            </button>

            <button style={styles.quickBtn}>
              My order is delayed
            </button>
          </div>
        </>
      )}

      {/* CHAT */}
      {view === "chat" && (
        <div>
          <h3>💬 Live Chat</h3>

          <div style={styles.chatBox}>
            {chat.length === 0 && (
              <p style={{ color: "#888" }}>
                Start conversation with support...
              </p>
            )}

            {chat.map((msg, i) => (
              <div key={i} style={styles.chatMsg}>
                {msg}
              </div>
            ))}
          </div>

          <div style={styles.chatInputWrap}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              style={styles.input}
            />

            <button onClick={sendMessage} style={styles.sendBtn}>
              <FaPaperPlane />
            </button>
          </div>

          <button style={styles.backBtn} onClick={() => setView("home")}>
            Back
          </button>
        </div>
      )}

      {/* EMAIL */}
      {view === "email" && (
        <div>
          <h3>📧 Send Email</h3>

          <input placeholder="Your email" style={styles.fullInput} />
          <input placeholder="Subject" style={styles.fullInput} />

          <textarea
            placeholder="Describe your issue..."
            style={styles.textarea}
          />

          <button
            style={styles.primaryBtn}
            onClick={() => alert("Message sent")}
          >
            Send Message
          </button>

          <button style={styles.backBtn} onClick={() => setView("home")}>
            Back
          </button>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 16,
    maxWidth: 700,
    margin: "0 auto",
    fontFamily: "sans-serif",
  },

  title: {
    fontSize: 22,
    fontWeight: 800,
  },

  sub: {
    color: "#666",
    fontSize: 13,
    marginBottom: 16,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  card: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid #eee",
    background: "#fff",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
  },

  icon: {
    fontSize: 20,
    marginBottom: 6,
    color: "#075E54",
  },

  section: {
    marginTop: 20,
  },

  quickBtn: {
    width: "100%",
    padding: 10,
    marginTop: 8,
    borderRadius: 8,
    border: "none",
    background: "#f3f4f6",
    cursor: "pointer",
  },

  chatBox: {
    height: 250,
    overflowY: "auto",
    background: "#f9fafb",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  chatMsg: {
    marginBottom: 8,
    fontSize: 13,
  },

  chatInputWrap: {
    display: "flex",
    marginTop: 10,
    gap: 6,
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  sendBtn: {
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#075E54",
    color: "#fff",
    cursor: "pointer",
  },

  fullInput: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  textarea: {
    width: "100%",
    height: 100,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  primaryBtn: {
    width: "100%",
    marginTop: 10,
    padding: 10,
    background: "#075E54",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  backBtn: {
    marginTop: 10,
    padding: 10,
    width: "100%",
    border: "none",
    background: "#eee",
    borderRadius: 8,
    cursor: "pointer",
  },
};

export default ContactUs;