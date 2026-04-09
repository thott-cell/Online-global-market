import { useEffect, useMemo, useState } from "react";
import { addReview, getProductReviews, type Review } from "../firebase/reviews";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

type ReviewSectionProps = {
  productId: string;
  limit?: number;
};

const Star = ({
  filled,
  onClick,
}: {
  filled: boolean;
  onClick: () => void;
}) => (
  <span
    onClick={onClick}
    style={{
      cursor: "pointer",
      color: filled ? "#FFD700" : "#ccc",
      fontSize: 22,
      marginRight: 4,
      userSelect: "none",
    }}
  >
    ★
  </span>
);

export default function ReviewSection({ productId, limit }: ReviewSectionProps) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const data = await getProductReviews(productId);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      toast.error("Failed to load reviews");
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to leave a review");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setLoading(true);

      await addReview({
        productId,
        userId: user.uid,
        rating,
        comment: comment.trim(),
      });

      toast.success("Review added");
      setComment("");
      setRating(5);
      await loadReviews();
    } catch (err: any) {
      toast.error(err?.message || "Error adding review");
    } finally {
      setLoading(false);
    }
  };

  const reviewCount = reviews.length;

  const averageRating = useMemo(() => {
    return reviewCount > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount
      : 0;
  }, [reviews, reviewCount]);

  const visibleReviews =
    typeof limit === "number" ? reviews.slice(0, limit) : reviews;

  return (
    <div
      style={{
        marginTop: 24,
        padding: 16,
        background: "#f9f9f9",
        borderRadius: 12,
        border: "1px solid #eee",
      }}
    >
      <h3 style={{ marginBottom: 8, fontSize: 18, fontWeight: 600 }}>Reviews</h3>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <strong style={{ fontSize: 16 }}>
            {reviewCount > 0 ? averageRating.toFixed(1) : "0.0"}
          </strong>

          <div style={{ display: "flex", alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                style={{
                  color: i <= Math.round(averageRating) ? "#FFD700" : "#ccc",
                  fontSize: 18,
                  marginRight: 2,
                }}
              >
                ★
              </span>
            ))}
          </div>

          <span style={{ color: "#666", fontSize: 14 }}>
            ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>
      </div>

      {reviewCount === 0 && (
        <p style={{ color: "#666", marginBottom: 12 }}>No reviews yet.</p>
      )}

      {visibleReviews.map((r) => (
        <div
          key={r.id}
          style={{
            borderBottom: "1px solid #eee",
            padding: "10px 0",
            marginBottom: 8,
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {"⭐".repeat(Number(r.rating || 0))} {r.rating} / 5
          </div>
          <div style={{ color: "#333", lineHeight: 1.5 }}>{r.comment}</div>
        </div>
      ))}

      <div style={{ marginTop: 20 }}>
        <h4 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
          Add Review
        </h4>

        <div style={{ display: "flex", marginBottom: 12 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} filled={i <= rating} onClick={() => setRating(i)} />
          ))}
        </div>

        <textarea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: "100%",
            minHeight: 90,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            resize: "vertical",
            marginBottom: 12,
            outline: "none",
            fontFamily: "inherit",
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: loading ? "#9ccc9c" : "#28a745",
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}