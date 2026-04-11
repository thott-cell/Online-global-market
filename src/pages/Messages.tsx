import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc as firestoreDoc,
  getDoc,
  updateDoc,
   doc,
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
  otherUserName?: string;
  otherUserRole?: string;
}

interface Props {
  onOpenChat: (chatId: string) => void;
}

interface UserProfile {
  displayName?: string;
  name?: string;
  fullName?: string;
  role?: string;
  userType?: string;
  photoURL?: string;
  avatarUrl?: string;
}

const Messages = ({ onOpenChat }: Props) => {
  const { user, role } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const fetchSeq = useRef(0);

  useEffect(() => {
    if (!user?.uid) {
      setChats([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        snap.docs.forEach(async (d) => {
  const data = d.data();

  if (
    data.receiverId === user?.uid &&
    data.read !== true
  ) {
    await updateDoc(doc(db, "messages", d.id), {
      read: true,
    });
  }
});
        const seq = ++fetchSeq.current;

        void (async () => {
          const messages = snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Message, "id">),
          })) as Message[];

          const chatMap = new Map<string, ChatPreview>();

          messages.forEach((msg) => {
            if (
              msg.senderId !== user.uid &&
              msg.receiverId !== user.uid
            ) {
              return;
            }

            const otherUserId =
              msg.senderId === user.uid ? msg.receiverId : msg.senderId;

            const isUnread =
              msg.receiverId === user.uid && msg.read !== true;

            if (!chatMap.has(msg.chatId)) {
              chatMap.set(msg.chatId, {
                chatId: msg.chatId,
                lastMessage: msg.text,
                lastTime: msg.createdAt,
                unreadCount: isUnread ? 1 : 0,
                otherUserId,
              });
            } else {
              const existing = chatMap.get(msg.chatId)!;

              if (isUnread) {
                existing.unreadCount += 1;
              }
            }
          });

          const previews = Array.from(chatMap.values());
          const uniqueOtherIds = [
            ...new Set(previews.map((chat) => chat.otherUserId).filter(Boolean)),
          ];

          const profileEntries = await Promise.all(
            uniqueOtherIds.map(async (uid) => {
              try {
                const ref = firestoreDoc(db, "users", uid);
                const userSnap = await getDoc(ref);

                if (!userSnap.exists()) {
                  return [uid, null] as const;
                }

                const data = userSnap.data() as UserProfile;

                return [
                  uid,
                  {
                    name:
                      data.displayName ||
                      data.name ||
                      data.fullName ||
                      "",
                    role: data.role || data.userType || "",
                    photoURL: data.photoURL || data.avatarUrl || "",
                  },
                ] as const;
              } catch {
                return [uid, null] as const;
              }
            })
          );

          if (cancelled || seq !== fetchSeq.current) return;

          const profileMap = new Map(profileEntries);

          const enriched = previews
            .map((chat) => {
              const profile = profileMap.get(chat.otherUserId);
              const fallbackName = chat.otherUserId.slice(0, 8);

              return {
                ...chat,
                otherUserName: profile?.name?.trim() || fallbackName,
                otherUserRole:
                  profile?.role?.trim() ||
                  inferFallbackRole(undefined),
              };
            })
            .sort((a, b) => {
              const aTime = getTimeValue(a.lastTime);
              const bTime = getTimeValue(b.lastTime);
              return bTime - aTime;
            });

          setChats(enriched);
          setLoading(false);
        })().catch((err) => {
          if (cancelled) return;
          console.error("Messages load error:", err);
          setLoading(false);
        });
      },
      (err) => {
        if (cancelled) return;
        console.error("Messages listener error:", err);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, [user?.uid, role]);

  const filteredChats = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return chats;

    return chats.filter((chat) => {
      const name = (chat.otherUserName || "").toLowerCase();
      const msg = (chat.lastMessage || "").toLowerCase();
      const chatRole = (chat.otherUserRole || "").toLowerCase();
      const chatId = (chat.chatId || "").toLowerCase();
      return (
        name.includes(term) ||
        msg.includes(term) ||
        chatRole.includes(term) ||
        chatId.includes(term)
      );
    });
  }, [chats, search]);

  if (!user) {
    return <p style={styles.notice}>Please login to view messages</p>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>Messages</div>
          <div style={styles.headerSubtitle}>
            Your conversations in one place
          </div>
        </div>

        <div style={styles.headerChip}>
          {filteredChats.length} chats
        </div>
      </div>

      <div style={styles.searchWrap}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search people or messages..."
          style={styles.search}
        />
      </div>

      {loading ? (
        <div style={styles.list}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={styles.skeletonCard}>
              <div style={styles.skeletonAvatar} />
              <div style={{ flex: 1 }}>
                <div style={styles.skeletonLineWide} />
                <div style={styles.skeletonLineMid} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredChats.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <div style={styles.emptyTitle}>No conversations yet</div>
          <div style={styles.emptyText}>
            Start a chat from a product page and it will appear here.
          </div>
        </div>
      ) : (
        <div style={styles.list}>
          {filteredChats.map((chat) => {
            const initials = getInitials(chat.otherUserName || chat.otherUserId);
            const timeLabel = formatTime(chat.lastTime);
            const roleLabel = formatRoleLabel(chat.otherUserRole, undefined);

            return (
              <button
                key={chat.chatId}
                type="button"
                onClick={() => onOpenChat(chat.chatId)}
                style={{
                  ...styles.card,
                  ...(chat.unreadCount > 0 ? styles.cardUnread : {}),
                }}
              >
                <div style={styles.avatar}>{initials}</div>

                <div style={styles.content}>
                  <div style={styles.topRow}>
                    <div style={styles.nameRow}>
                      <span style={styles.name}>{chat.otherUserName}</span>
                      <span style={styles.rolePill}>{roleLabel}</span>
                    </div>

                    <span style={styles.time}>{timeLabel}</span>
                  </div>

                  <div style={styles.bottomRow}>
                    <p style={styles.message}>{chat.lastMessage}</p>

                    {chat.unreadCount > 0 && (
                      <span style={styles.badge}>{chat.unreadCount}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

function getTimeValue(timestamp: any) {
  if (!timestamp) return 0;
  if (typeof timestamp === "number") return timestamp;
  if (timestamp?.seconds) return timestamp.seconds * 1000;
  if (typeof timestamp?.toDate === "function") return timestamp.toDate().getTime();
  return 0;
}

function formatTime(timestamp: any) {
  const time = getTimeValue(timestamp);
  if (!time) return "";

  const now = Date.now();
  const diff = now - time;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay && new Date(time).getDate() === new Date(now).getDate()) {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (diff < 2 * oneDay) {
    return "Yesterday";
  }

  return new Date(time).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function inferFallbackRole(currentRole?: string) {
  if (currentRole === "seller") return "Buyer";
  if (currentRole === "buyer") return "Seller";
  return "User";
}

function formatRoleLabel(otherRole?: string, currentRole?: string) {
  if (otherRole) {
    return otherRole.charAt(0).toUpperCase() + otherRole.slice(1);
  }
  return inferFallbackRole(currentRole);
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 760,
    margin: "0 auto",
    padding: 16,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
    padding: "16px 18px",
    borderRadius: 18,
    background: "linear-gradient(135deg, #075E54, #0f8b7a)",
    color: "#fff",
    boxShadow: "0 14px 32px rgba(7,94,84,0.16)",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.1,
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.88,
  },

  headerChip: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  searchWrap: {
    marginBottom: 14,
  },

  search: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
    background: "#fff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  card: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    textAlign: "left",
    padding: 14,
    borderRadius: 18,
    border: "1px solid #eef0f3",
    background: "#fff",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  cardUnread: {
    borderColor: "#d7f0e8",
    background: "linear-gradient(180deg, #ffffff, #f7fffc)",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    letterSpacing: 0.5,
    background: "linear-gradient(135deg, #25D366, #0ea5a0)",
    boxShadow: "0 10px 20px rgba(37,211,102,0.22)",
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },

  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
    flexWrap: "wrap",
  },

  name: {
    fontSize: 15,
    fontWeight: 800,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 260,
  },

  rolePill: {
    padding: "4px 8px",
    borderRadius: 999,
    background: "#eef6ff",
    color: "#2563eb",
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  time: {
    fontSize: 12,
    color: "#6b7280",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  bottomRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  message: {
    margin: 0,
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 1.45,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },

  badge: {
    minWidth: 22,
    height: 22,
    padding: "0 7px",
    borderRadius: 999,
    background: "#ef4444",
    color: "#fff",
    fontSize: 11,
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  emptyState: {
    textAlign: "center",
    padding: "56px 20px",
    borderRadius: 22,
    background: "#fff",
    border: "1px solid #eef0f3",
    boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.6,
  },

  skeletonCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    background: "#fff",
    border: "1px solid #eef0f3",
  },

  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "linear-gradient(90deg, #eceff3 25%, #f6f7fa 50%, #eceff3 75%)",
    backgroundSize: "200% 100%",
    animation: "pulse 1.2s infinite linear",
    flexShrink: 0,
  },

  skeletonLineWide: {
    height: 12,
    width: "55%",
    borderRadius: 999,
    marginBottom: 10,
    background: "linear-gradient(90deg, #eceff3 25%, #f6f7fa 50%, #eceff3 75%)",
    backgroundSize: "200% 100%",
    animation: "pulse 1.2s infinite linear",
  },

  skeletonLineMid: {
    height: 10,
    width: "78%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #eceff3 25%, #f6f7fa 50%, #eceff3 75%)",
    backgroundSize: "200% 100%",
    animation: "pulse 1.2s infinite linear",
  },

  notice: {
    padding: 12,
    color: "#666",
  },
};

export default Messages;