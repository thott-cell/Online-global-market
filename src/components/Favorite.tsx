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
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";

interface WishlistProduct {
  id: string;
  wishlistDocId?: string;
  productId?: string;
  title?: string;
  description?: string;
  price?: number;
  discount?: number;
  imageUrl?: string;
  sellerId?: string;
  [k: string]: any;
}

const Favorite: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        try {
          if (snapshot.empty) {
            setWishlistProducts([]);
            setLoading(false);
            return;
          }

          const items = await Promise.all(
            snapshot.docs.map(async (wishDoc: QueryDocumentSnapshot<DocumentData>) => {
              const wishData = wishDoc.data();
              const productId = wishData?.productId as string | undefined;

              if (productId) {
                try {
                  const productRef = doc(db, "products", productId);
                  const productSnap = await getDoc(productRef);

                  if (productSnap.exists()) {
                    return {
                      id: productSnap.id,
                      productId: productSnap.id,
                      wishlistDocId: wishDoc.id,
                      ...(productSnap.data() as DocumentData),
                    } as WishlistProduct;
                  }
                } catch (err) {
                  console.error("[Favorite] Failed to load product doc:", err);
                }
              }

              if (wishData?.title || wishData?.price) {
                return {
                  id: productId || wishDoc.id,
                  productId,
                  wishlistDocId: wishDoc.id,
                  title: wishData.title,
                  description: wishData.description,
                  price: wishData.price,
                  discount: wishData.discount,
                  imageUrl: wishData.imageUrl,
                  sellerId: wishData.sellerId,
                } as WishlistProduct;
              }

              return null;
            })
          );

          const cleanItems = items.filter(Boolean) as WishlistProduct[];

          if (mounted) {
            setWishlistProducts(cleanItems);
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

  const handleRemove = async (item: WishlistProduct) => {
    if (!user) return;

    try {
      if (item.productId) {
        const wishlistRef = collection(db, "wishlists");
        const q = query(
          wishlistRef,
          where("userId", "==", user.uid),
          where("productId", "==", item.productId)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          await Promise.all(
            snapshot.docs.map((d) => deleteDoc(doc(db, "wishlists", d.id)))
          );
          return;
        }
      }

      if (item.wishlistDocId) {
        await deleteDoc(doc(db, "wishlists", item.wishlistDocId));
      }
    } catch (err) {
      console.error("[Favorite] Failed to remove from wishlist:", err);
    }
  };

  const handleOpenProduct = (item: WishlistProduct) => {
    const productIdToOpen = item.productId || item.id;
    if (!productIdToOpen) return;

    navigate(`/product/${productIdToOpen}`);
  };

  const formatPrice = (value?: number) =>
    `₦${Number(value || 0).toLocaleString("en-NG")}`;

  const getDiscountedPrice = (item: WishlistProduct) => {
    const price = Number(item.price || 0);
    const discount = Number(item.discount || 0);

    if (discount > 0) {
      return Math.round(price - (price * discount) / 100);
    }

    return price;
  };

  if (!user) {
    return (
      <p style={{ textAlign: "center", marginTop: 20 }}>
        Please sign in to view your wishlist.
      </p>
    );
  }

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: 20 }}>Loading wishlist...</p>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <p style={{ textAlign: "center", marginTop: 20 }}>
        Your wishlist is empty.
      </p>
    );
  }

  return (
    <div className="fav-page">
      <style>{`
        .fav-page {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
          box-sizing: border-box;
        }

        .fav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .fav-title {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          color: #111827;
        }

        .fav-count {
          font-size: 13px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 600;
        }

        .fav-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .fav-card {
          position: relative;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: #fff;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .fav-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(0,0,0,0.08);
        }

        .fav-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
          overflow: hidden;
          flex-shrink: 0;
        }

        .fav-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .fav-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(17, 24, 39, 0.88);
          color: #fff;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
        }

        .fav-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          min-height: 0;
        }

        .fav-name {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          color: #111827;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 35px;
        }

        .fav-desc {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 34px;
        }

        .fav-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .fav-price {
          font-size: 14px;
          font-weight: 800;
          color: #16a34a;
        }

        .fav-old {
          font-size: 12px;
          color: #9ca3af;
          text-decoration: line-through;
        }

        .fav-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 0 12px 12px;
          margin-top: auto;
        }

        .fav-open {
          flex: 1;
          border: none;
          border-radius: 12px;
          padding: 10px 12px;
          background: #075e54;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
        }

        .fav-remove {
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 12px;
          background: #fff1f1;
          color: #dc2626;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .fav-remove:hover {
          background: #fee2e2;
        }

        @media (max-width: 1024px) {
          .fav-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .fav-page {
            padding: 12px;
          }

          .fav-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
          }

          .fav-body {
            padding: 10px;
            gap: 6px;
          }

          .fav-name {
            font-size: 12px;
            min-height: 30px;
          }

          .fav-desc {
            font-size: 11px;
            min-height: 30px;
          }

          .fav-price {
            font-size: 12px;
          }

          .fav-old {
            font-size: 11px;
          }

          .fav-open {
            font-size: 12px;
            padding: 9px 10px;
          }

          .fav-actions {
            padding: 0 10px 10px;
          }

          .fav-remove {
            width: 38px;
            height: 38px;
          }
        }

        @media (max-width: 420px) {
          .fav-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }

          .fav-card {
            border-radius: 14px;
          }

          .fav-name {
            font-size: 11px;
          }

          .fav-desc {
            display: none;
          }

          .fav-body {
            padding: 8px;
            gap: 5px;
          }

          .fav-open {
            padding: 8px 8px;
            font-size: 11px;
            border-radius: 10px;
          }

          .fav-remove {
            width: 34px;
            height: 34px;
            border-radius: 10px;
          }
        }
      `}</style>

      <div className="fav-header">
        <h2 className="fav-title">My Wishlist</h2>
        <span className="fav-count">{wishlistProducts.length} item(s)</span>
      </div>

      <div className="fav-grid">
        {wishlistProducts.map((item) => {
          const hasDiscount = Number(item.discount || 0) > 0;
          const discountedPrice = getDiscountedPrice(item);

          return (
            <div
              key={item.wishlistDocId || item.id}
              className="fav-card"
              role="button"
              tabIndex={0}
              onClick={() => handleOpenProduct(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpenProduct(item);
                }
              }}
            >
              <div className="fav-image-wrap">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title || "Wishlist item"}
                    className="fav-image"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    No image
                  </div>
                )}

                {hasDiscount && (
                  <div className="fav-badge">-{Number(item.discount || 0)}%</div>
                )}
              </div>

              <div className="fav-body">
                <h3 className="fav-name">{item.title || "Untitled product"}</h3>

                {item.description && (
                  <p className="fav-desc">{item.description}</p>
                )}

                <div className="fav-price-row">
                  <span className="fav-price">{formatPrice(discountedPrice)}</span>
                  {hasDiscount && (
                    <span className="fav-old">
                      {formatPrice(Number(item.price || 0))}
                    </span>
                  )}
                </div>
              </div>

              <div className="fav-actions">
                <button
                  type="button"
                  className="fav-open"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenProduct(item);
                  }}
                >
                  View
                </button>

                <button
                  type="button"
                  className="fav-remove"
                  aria-label="Remove from wishlist"
                  title="Remove from wishlist"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleRemove(item);
                  }}
                >
                  <FaTrashAlt size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Favorite;