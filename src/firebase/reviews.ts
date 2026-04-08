import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";// make sure this matches your firebase config file

// 🔥 Add a review
export const addReview = async ({
  productId,
  userId,
  rating,
  comment,
}: {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
}) => {
  return await addDoc(collection(db, "reviews"), {
    productId,
    userId,
    rating,
    comment,
    createdAt: serverTimestamp(),
  });
};

// 📦 Get all reviews for a product
export const getProductReviews = async (productId: string) => {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};