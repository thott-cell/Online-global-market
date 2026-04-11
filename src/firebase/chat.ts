import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt?: any;
}

// ✅ ALWAYS SAFE CHAT ID
export const getChatId = (a: string, b: string) => {
  if (!a || !b) return "";
  return [a, b].sort().join("_");
};

export const sendMessage = async ({
  chatId,
  senderId,
  receiverId,
  text,
}: {
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
}) => {
  if (!chatId || !senderId || !receiverId || !text) {
    throw new Error("Missing chat fields");
  }

  return await addDoc(collection(db, "messages"), {
    chatId,
    senderId,
    receiverId,
    text,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  if (!chatId) return () => {};

  const q = query(
    collection(db, "messages"),
    where("chatId", "==", chatId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ChatMessage, "id">),
    }));

    callback(messages);
  });
};