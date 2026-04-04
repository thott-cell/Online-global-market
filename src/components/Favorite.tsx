// src/components/Favorite.tsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaHeart } from "react-icons/fa";

interface WishlistProduct {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  discount?: number;
  imageUrl?: string;
  sellerId?: string;
  // any other product fields you expect
  [k: string]: any;
}

const Favorite: React.FC = () => {
  const { user } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // wait until auth is available
    if (!user) {
      setWishlistProducts([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    const wishlistRef = collection(db, "wishlists");
    const q = query(wishlistRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (!mounted) return;

        console.log("[Favorite] wishlist snapshot docs:", snapshot.docs.length);
        if (snapshot.empty) {
          setWishlistProducts([]);
          setLoading(false);
          return;
        }

        try {
          // map each wishlist doc -> product (attempt product fetch, fallback to wishlist doc content)
          const productPromises = snapshot.docs.map(
            async (wishDoc: QueryDocumentSnapshot<DocumentData>) => {
              const wishData = wishDoc.data();
              const productId = wishData?.productId as string | undefined;

              console.log(`[Favorite] wishlist doc id=${wishDoc.id} productId=${productId}`, wishData);

              // 1) if productId exists, try to fetch product doc from /products
              if (productId) {
                try {
                  const productRef = doc(db, "products", productId);
                  const productSnap = await getDoc(productRef);

                  if (productSnap.exists()) {
                    const productData = productSnap.data() as DocumentData;
                    // return product with product doc id
                    return { id: productSnap.id, ...productData } as WishlistProduct;
                  } else {
                    console.warn(`[Favorite] product doc not found for id=${productId}. Falling back to wishlist doc data if present.`);
                    // fallthrough to wishlist doc fallback
                  }
                } catch (err) {
                  console.error("[Favorite] getDoc(product) failed:", err);
                  // fallthrough to fallback below
                }
              }

              // 2) fallback: maybe the wishlist entry contains product fields (title/price/imageUrl)
              if (wishData?.title || wishData?.price) {
                // build a fallback product object using wishlist doc data
                const fallback: WishlistProduct = {
                  id: wishDoc.id, // note: use wishlist doc id so key is unique
                  title: wishData.title,
                  description: wishData.description,
                  price: wishData.price,
                  discount: wishData.discount,
                  imageUrl: wishData.imageUrl,
                  sellerId: wishData.sellerId,
                };
                return fallback;
              }

              // 3) cannot resolve product -> return null to be filtered out
              console.warn(`[Favorite] Could not resolve product for wishlist doc ${wishDoc.id}`);
              return null;
            }
          );

          const results = (await Promise.all(productPromises)).filter(Boolean) as WishlistProduct[];

          if (mounted) {
            setWishlistProducts(results);
            setLoading(false);
          }
        } catch (err) {
          console.error("[Favorite] Error processing wishlist snapshot:", err);
          if (mounted) {
            setWishlistProducts([]);
            setLoading(false);
          }
        }
      },
      (err) => {
        console.error("[Favorite] onSnapshot error:", err);
        if (mounted) {
          setWishlistProducts([]);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [user]);

  const handleRemove = async (productIdOrWishlistId: string) => {
    // We support two removal modes:
    // - If this id matches a product id in wishlistProducts, find wishlist docs with that productId
    // - Otherwise, treat the passed id as the wishlist doc id and delete directly
    if (!user) return;

    try {
      // try to remove by productId first
      const wishlistRef = collection(db, "wishlists");
      const q = query(wishlistRef, where("userId", "==", user.uid), where("productId", "==", productIdOrWishlistId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // delete all wishlist docs that match (usually 1)
        const deletes = snapshot.docs.map((d) => deleteDoc(doc(db, "wishlists", d.id)));
        await Promise.all(deletes);
        return;
      }

      // If no docs found by productId, attempt to treat the passed id as wishlist doc id and delete
      try {
        await deleteDoc(doc(db, "wishlists", productIdOrWishlistId));
        return;
      } catch (err) {
        // not fatal; just log
        console.warn("[Favorite] remove fallback delete by wishlist doc id failed", err);
      }
    } catch (err) {
      console.error("[Favorite] Failed to remove from wishlist:", err);
    }
  };

  if (!user) {
    return <p style={{ textAlign: "center", marginTop: 20 }}>Please sign in to view your wishlist.</p>;
  }

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 20 }}>Loading wishlist...</p>;
  }

  if (wishlistProducts.length === 0) {
    return <p style={{ textAlign: "center", marginTop: 20 }}>Your wishlist is empty.</p>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "30px auto", padding: 16 }}>
      <h2>My Wishlist</h2>
      <div className="product-grid">
        {wishlistProducts.map((item) => (
          <div
            key={item.id}
            className="product-card"
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
              background: "#fff",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
           <div>
  {/* Product Image */}
  {item.imageUrl && (
    <img
      src={item.imageUrl}
      alt={item.title}
      style={{
        width: "100%",
        height: 180,
        objectFit: "cover",
        borderRadius: 6,
        marginBottom: 12,
      }}
    />
  )}

  <h3 style={{ margin: "8px 0" }}>{item.title}</h3>
  {item.description && (
    <p style={{ fontSize: 14, color: "#555", minHeight: 40 }}>{item.description}</p>
  )}

  <div style={{ fontWeight: 700, marginBottom: 8 }}>
    {item.discount ? (
      <>
        <span style={{ color: "#28a745" }}>
          ₦{Math.round((item.price || 0) - ((item.price || 0) * (item.discount || 0)) / 100).toLocaleString("en-NG")}
        </span>{" "}
        <span style={{ textDecoration: "line-through", color: "#999", marginLeft: 6 }}>
          ₦{(item.price || 0).toLocaleString("en-NG")}
        </span>
      </>
    ) : (
      <span>₦{(item.price || 0).toLocaleString("en-NG")}</span>
    )}
  </div>
</div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8, gap: 8 }}>
              <button
                onClick={() => void handleRemove(item.id)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "red",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FaHeart /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorite;