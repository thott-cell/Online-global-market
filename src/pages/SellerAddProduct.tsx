// src/pages/SellerAddProduct.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const CLOUD_NAME = "dbj6koi4f";
const UPLOAD_PRESET = "online market";

const CATEGORIES = [
  { name: "Electronics" },
  { name: "Fashion" },
  { name: "Books" },
  { name: "Shoes" },
  { name: "Hostel" },
  { name: "Sports" },
  { name: "Other" },
  { name: "Accessories" },
  { name: "Beauty" },
] as const;

type CategoryName = (typeof CATEGORIES)[number]["name"];

const SellerAddProduct = () => {
  const { user, role } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [discount, setDiscount] = useState<number | "">("");
  const [category, setCategory] = useState<CategoryName | "">("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 768);

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);

    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  useEffect(() => {
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    setCurrentPreviewIndex(0);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  if (!user || role !== "seller") {
    return <div style={{ padding: 40, textAlign: "center" }}>Access denied</div>;
  }

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await res.json();
    return data.secure_url as string;
  };

  const handleImagesChange = (files: FileList | null) => {
    if (!files) {
      setImageFiles([]);
      return;
    }

    const picked = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    setImageFiles(picked);
  };

  const removeImageAt = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));

    setCurrentPreviewIndex((prev) => {
      if (imageFiles.length <= 1) return 0;
      if (prev > index) return prev - 1;
      if (prev === index) return Math.max(0, prev - 1);
      return prev;
    });
  };

  const goPrev = () => {
    if (imagePreviews.length <= 1) return;
    setCurrentPreviewIndex((prev) =>
      prev === 0 ? imagePreviews.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    if (imagePreviews.length <= 1) return;
    setCurrentPreviewIndex((prev) =>
      prev === imagePreviews.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddProduct = async () => {
    if (!title.trim() || !description.trim() || price === "" || price <= 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!category || !CATEGORIES.some((c) => c.name === category)) {
      setCategoryError(true);
      toast.error("Please select a valid category.");
      return;
    }

    if (imageFiles.length === 0) {
      toast.error("Please select at least one image.");
      return;
    }

    setCategoryError(false);
    setLoading(true);

    try {
      const images = await Promise.all(imageFiles.map((file) => uploadImage(file)));
      const imageUrl = images[0] || "";

      await addDoc(collection(db, "products"), {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        discount: discount ? Number(discount) : 0,
        imageUrl,
        images,
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
      setCategory("");
      setImageFiles([]);
      setImagePreviews([]);
      setCurrentPreviewIndex(0);
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

  const currentPreview = imagePreviews[currentPreviewIndex];
  const styles = createStyles(isMobile);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Seller Add Product</h2>
          <p style={styles.subtitle}>Upload one or more product images</p>
        </div>

        <div style={styles.form}>
          <input
            type="text"
            placeholder="Product title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />

          <textarea
            placeholder="Product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...styles.input, minHeight: isMobile ? 110 : 120, resize: "vertical" }}
          />

          <div style={styles.grid2}>
            <input
              type="number"
              placeholder="Price (₦)"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : "")
              }
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Discount % (optional)"
              value={discount}
              onChange={(e) =>
                setDiscount(e.target.value ? Number(e.target.value) : "")
              }
              style={styles.input}
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryName | "")}
            style={{
              ...styles.input,
              border: categoryError ? "2px solid #ef4444" : styles.input.border,
            }}
          >
            <option value="">-- Select category --</option>
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <div style={styles.uploadBox}>
            <div style={styles.uploadTopRow}>
              <div>
                <p style={styles.uploadLabel}>Product Images</p>
                <p style={styles.uploadHint}>
                  Select multiple images for the product
                </p>
              </div>

              <label style={styles.uploadBtn}>
                Choose Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handleImagesChange(e.target.files)}
                />
              </label>
            </div>

            {imagePreviews.length > 0 ? (
              <>
                <div style={styles.carousel}>
                  <img
                    src={currentPreview}
                    alt={`preview-${currentPreviewIndex + 1}`}
                    style={styles.carouselImage}
                  />

                  {imagePreviews.length > 1 && (
                    <>
                      <button type="button" onClick={goPrev} style={styles.navLeft}>
                        ‹
                      </button>
                      <button type="button" onClick={goNext} style={styles.navRight}>
                        ›
                      </button>

                      <div style={styles.counter}>
                        {currentPreviewIndex + 1}/{imagePreviews.length}
                      </div>
                    </>
                  )}
                </div>

                <div style={styles.dotsWrap}>
                  {imagePreviews.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentPreviewIndex(index)}
                      style={{
                        ...styles.dot,
                        ...(index === currentPreviewIndex ? styles.dotActive : {}),
                      }}
                      aria-label={`Preview image ${index + 1}`}
                    />
                  ))}
                </div>

                <div style={styles.thumbStrip}>
                  {imagePreviews.map((src, index) => (
                    <div
                      key={src}
                      style={{
                        ...styles.thumbItem,
                        ...(index === currentPreviewIndex ? styles.thumbActive : {}),
                      }}
                      onClick={() => setCurrentPreviewIndex(index)}
                    >
                      <img src={src} alt={`thumb-${index}`} style={styles.thumbImg} />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImageAt(index);
                        }}
                        style={styles.removeBtn}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={styles.emptyUpload}>No images selected yet</div>
            )}
          </div>

          <button
            onClick={handleAddProduct}
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>

      {(title || description || price) && (
        <div style={styles.previewCard}>
          <div style={styles.previewHeader}>
            <h3 style={{ margin: 0 }}>Live Preview</h3>
            {category && <span style={styles.categoryPill}>{category}</span>}
          </div>

          {imagePreviews.length > 0 && (
            <div style={styles.heroPreviewWrap}>
              <img
                src={imagePreviews[0]}
                alt="main preview"
                style={styles.heroPreview}
              />
              {imagePreviews.length > 1 && (
                <div style={styles.moreImagesBadge}>
                  +{imagePreviews.length - 1} more
                </div>
              )}
            </div>
          )}

          <h3 style={styles.previewTitle}>{title || "Product title"}</h3>
          <p style={styles.previewDesc}>
            {description || "Product description"}
          </p>

          <div style={styles.priceRow}>
            {discount && discount > 0 ? (
              <>
                <span style={styles.oldPrice}>₦{Number(price || 0).toFixed(2)}</span>
                <span style={styles.newPrice}>₦{discountedPrice.toFixed(2)}</span>
              </>
            ) : (
              <span style={styles.newPrice}>₦{Number(price || 0).toFixed(2)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const createStyles = (isMobile: boolean): Record<string, React.CSSProperties> => ({
  page: {
    width: "100%",
    maxWidth: 980,
    margin: isMobile ? "16px auto" : "40px auto",
    padding: isMobile ? 12 : 16,
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
    gap: isMobile ? 14 : 20,
    boxSizing: "border-box",
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: isMobile ? 14 : 20,
    border: "1px solid #eef0f3",
    boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
    minWidth: 0,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: isMobile ? 20 : 24,
    fontWeight: 800,
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 0,
    color: "#6b7280",
    fontSize: 14,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    width: "100%",
    padding: isMobile ? "11px 12px" : "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: 14,
    background: "#fff",
    boxSizing: "border-box",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: 12,
  },
  uploadBox: {
    border: "1px dashed #cbd5e1",
    borderRadius: 16,
    padding: isMobile ? 12 : 14,
    background: "#f8fafc",
  },
  uploadTopRow: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "stretch" : "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  uploadLabel: {
    margin: 0,
    fontWeight: 700,
    color: "#111827",
  },
  uploadHint: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#6b7280",
  },
  uploadBtn: {
    width: isMobile ? "100%" : "auto",
    textAlign: "center",
    padding: "10px 14px",
    borderRadius: 999,
    background: "#075E54",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  },
  carousel: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    background: "#fff",
  },
  carouselImage: {
    width: "100%",
    height: isMobile ? 200 : 260,
    objectFit: "cover",
    display: "block",
  },
  navLeft: {
    position: "absolute",
    top: "50%",
    left: 10,
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontSize: 24,
    cursor: "pointer",
  },
  navRight: {
    position: "absolute",
    top: "50%",
    right: 10,
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontSize: 24,
    cursor: "pointer",
  },
  counter: {
    position: "absolute",
    right: 12,
    bottom: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.75)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
  },
  dotsWrap: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    border: "none",
    background: "#cbd5e1",
    cursor: "pointer",
  },
  dotActive: {
    background: "#075E54",
    transform: "scale(1.15)",
  },
  thumbStrip: {
    display: "flex",
    gap: 10,
    marginTop: 12,
    overflowX: "auto",
    paddingBottom: 2,
    WebkitOverflowScrolling: "touch",
  },
  thumbItem: {
    position: "relative",
    minWidth: 70,
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    border: "2px solid transparent",
    flexShrink: 0,
  },
  thumbActive: {
    borderColor: "#075E54",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.75)",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: "22px",
  },
  emptyUpload: {
    padding: 18,
    borderRadius: 14,
    background: "#fff",
    color: "#6b7280",
    textAlign: "center",
    fontSize: 14,
    border: "1px solid #eef0f3",
  },
  submitBtn: {
    width: "100%",
    padding: "13px 16px",
    borderRadius: 12,
    border: "none",
    background: "#25a244",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 15,
    boxShadow: "0 10px 20px rgba(37,162,68,0.18)",
  },
  previewCard: {
    background: "#fff",
    borderRadius: 18,
    padding: isMobile ? 14 : 20,
    border: "1px solid #eef0f3",
    boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
    height: "fit-content",
    minWidth: 0,
  },
  previewHeader: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: 12,
    marginBottom: 14,
  },
  categoryPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 10px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#0f172a",
    fontSize: 12,
    fontWeight: 700,
  },
  heroPreviewWrap: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    border: "1px solid #eef0f3",
  },
  heroPreview: {
    width: "100%",
    height: isMobile ? 200 : 260,
    objectFit: "cover",
    display: "block",
  },
  moreImagesBadge: {
    position: "absolute",
    right: 12,
    bottom: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.75)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
  },
  previewTitle: {
    margin: "0 0 8px",
    fontSize: isMobile ? 18 : 20,
    fontWeight: 800,
    color: "#111827",
    wordBreak: "break-word",
  },
  previewDesc: {
    margin: 0,
    color: "#6b7280",
    lineHeight: 1.6,
    fontSize: 14,
    wordBreak: "break-word",
  },
  priceRow: {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  oldPrice: {
    fontSize: 16,
    color: "#9ca3af",
    textDecoration: "line-through",
    fontWeight: 700,
  },
  newPrice: {
    fontSize: 18,
    color: "#16a34a",
    fontWeight: 900,
  },
});

export default SellerAddProduct;