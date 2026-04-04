import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  description?: string;
  sellerId?: string;
  discount?: number;
  category?: string;
}
export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  description?: string;
  sellerId?: string;
  discount?: number;
  discountedPrice?: number; // ← add this line
}

export function useWishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const wishlistRef = collection(db, "wishlists");
    const q = query(wishlistRef, where("userId", "==", user.uid));

    const unsub = onSnapshot(q, async (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.data().productId,
        ...docSnap.data(),
      })) as WishlistItem[];

      setWishlist(items);
    });

    return () => unsub();
  }, [user]);

  const addToWishlist = async (product: WishlistItem) => {
    if (!user) return;
    const wishlistRef = collection(db, "wishlists");
    await addDoc(wishlistRef, { userId: user.uid, productId: product.id, ...product });
    setWishlist((prev) => [...prev, product]);
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    const wishlistRef = collection(db, "wishlists");
    const q = query(wishlistRef, where("userId", "==", user.uid), where("productId", "==", productId));

    onSnapshot(q, async (snapshot) => {
      snapshot.docs.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "wishlists", docSnap.id));
      });
    });

    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  return { wishlist, addToWishlist, removeFromWishlist };
}