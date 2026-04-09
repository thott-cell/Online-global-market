import {
  collection,
  addDoc,
  getDocs,
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

export const getChatId = (a: string, b: string) => [a, b].sort().join("_");

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
  return await addDoc(collection(db, "messages"), {
    chatId,
    senderId,
    receiverId,
    text,
    createdAt: serverTimestamp(),
  });
};

export const getMessagesForChat = async (chatId: string): Promise<ChatMessage[]> => {
  const q = query(
    collection(db, "messages"),
    where("chatId", "==", chatId),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ChatMessage, "id">),
  }));
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
) => {
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