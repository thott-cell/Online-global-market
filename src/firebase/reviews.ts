import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt?: unknown;
}

type NewReview = {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
};

export const addReview = async ({
  productId,
  userId,
  rating,
  comment,
}: NewReview) => {
  return await addDoc(collection(db, "reviews"), {
    productId,
    userId,
    rating,
    comment,
    createdAt: serverTimestamp(),
  });
};

export const getProductReviews = async (
  productId: string
): Promise<Review[]> => {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<Review, "id">;
    return {
      id: doc.id,
      ...data,
    };
  });
};