// src/pages/SellerAddProduct.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const CLOUD_NAME = "dbj6koi4f"; // replace this
const UPLOAD_PRESET = "online market"; // your preset name

// Category list with icons
const CATEGORIES = [
  { name: "Electronics", icon: "📱" },
  { name: "Fashion", icon: "👗" },
  { name: "Books", icon: "📚" },
  { name: "Home", icon: "🏠" },
  { name: "Sports", icon: "⚽" },
  { name: "Other", icon: "🛍️" },
];

const SellerAddProduct = () => {
  const { user, role } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [discount, setDiscount] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  if (!user || role !== "seller") {
    return <div style={{ padding: 40, textAlign: "center" }}>Access denied</div>;
  }

  const uploadImage = async () => {
    if (!imageFile) return "";
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleAddProduct = async () => {
    // Validation
    if (!title || !description || price === "" || price <= 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!category || !CATEGORIES.some((c) => c.name === category)) {
      setCategoryError(true);
      toast.error("Please select a valid category.");
      return;
    }

    if (!imageFile) {
      toast.error("Please select an image.");
      return;
    }

    setCategoryError(false);
    setLoading(true);

    try {
      const imageUrl = await uploadImage();

      await addDoc(collection(db, "products"), {
        title,
        description,
        price: Number(price),
        discount: discount ? Number(discount) : 0,
        imageUrl,
        status: "pending",
        sellerId: user.uid,
        category,
        createdAt: serverTimestamp(),
      });

      toast.success("Product added successfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setDiscount("");
      setImageFile(null);
      setCategory("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  const discountedPrice =
    discount && discount > 0
      ? Number(price) - (Number(discount) / 100) * Number(price)
      : Number(price);

  const selectedCategoryIcon = CATEGORIES.find((c) => c.name === category)?.icon;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2>Seller Add Product</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
        <input
          type="text"
          placeholder="Product title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />

        <textarea
          placeholder="Product description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />

        <input
          type="number"
          placeholder="Price (₦)"
          value={price}
          onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />

        <input
          type="number"
          placeholder="Discount % (optional)"
          value={discount}
          onChange={(e) => setDiscount(e.target.value ? Number(e.target.value) : "")}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 6,
            border: categoryError ? "2px solid red" : "1px solid #ccc",
          }}
        >
          <option value="">-- Select category --</option>
          {CATEGORIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
        />

        <button
          onClick={handleAddProduct}
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 6,
            border: "none",
            background: "#28a745",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: 10,
          }}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </div>

      {/* Preview */}
      {(title || description || price) && (
        <div
          style={{
            marginTop: 30,
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 16,
            background: "#fff",
          }}
        >
          {imageFile && (
            <img
              src={URL.createObjectURL(imageFile)}
              alt="preview"
              style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 6 }}
            />
          )}

          <h3>{title || "Product title"}</h3>

          {/* Category preview with icon */}
          {category && (
            <div style={{ marginBottom: 8 }}>
              <small
                style={{
                  display: "inline-block",
                  background: "#f1f5f9",
                  color: "#0f172a",
                  padding: "6px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {selectedCategoryIcon} {category}
              </small>
            </div>
          )}

          <p style={{ color: "#555" }}>{description || "Product description"}</p>

          <div style={{ fontWeight: 700 }}>
            {discount && discount > 0 ? (
              <>
                <span style={{ textDecoration: "line-through", color: "#999", marginRight: 8 }}>
                  ₦{price}
                </span>
                <span style={{ color: "#28a745" }}>₦{discountedPrice.toFixed(2)}</span>
              </>
            ) : (
              <>₦{price}</>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerAddProduct;