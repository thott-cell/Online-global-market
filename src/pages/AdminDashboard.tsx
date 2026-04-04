// src/pages/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  sellerId: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: any;
}

interface Order {
  id: string;
  orderId?: string;
  userId: string;
  total: number;
  status?: string;
  paymentMethod?: string;
  createdAt?: any;
  products?: any[];
}

interface UserItem {
  id: string;
  email?: string;
  displayName?: string;
  role?: "buyer" | "seller" | "admin";
  createdAt?: any;
}

type TabKey = "products" | "orders" | "users";

const AdminDashboard = () => {
  const { role } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("products");
  const [productFilter, setProductFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  useEffect(() => {
    const productsQ = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const ordersQ = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    // ✅ FIXED: fetch all users directly from Firestore without orderBy
    // because some user docs may not have createdAt yet, which can hide them.
    const usersQ = query(collection(db, "users"));

    const unsubProducts = onSnapshot(
      productsQ,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, "id">),
        })) as Product[];
        setProducts(items);
        setLoading(false);
      },
      () => {
        toast.error("Failed to load products");
        setLoading(false);
      }
    );

    const unsubOrders = onSnapshot(
      ordersQ,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Order, "id">),
        })) as Order[];
        setOrders(items);
      },
      () => {
        toast.error("Failed to load orders");
      }
    );

   const unsubUsers = onSnapshot(
  usersQ,
  (snap) => {
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<UserItem, "id">),
    })) as UserItem[];

    console.log("USERS:", items); // 👈 ADD THIS
    setUsers(items);
  },
  (error) => {
    console.error("USER ERROR:", error); // 👈 ADD THIS
    toast.error("Failed to load users");
  }
);

    return () => {
      unsubProducts();
      unsubOrders();
      unsubUsers();
    };
  }, []);

  const counts = useMemo(
    () => ({
      pending: products.filter((p) => p.status === "pending").length,
      approved: products.filter((p) => p.status === "approved").length,
      rejected: products.filter((p) => p.status === "rejected").length,
      orders: orders.length,
      users: users.length,
      sellers: users.filter((u) => u.role === "seller").length,
    }),
    [products, orders, users]
  );

  const visibleProducts = useMemo(() => {
    if (productFilter === "all") return products;
    return products.filter((p) => p.status === productFilter);
  }, [products, productFilter]);

  const updateStatus = async (product: Product, status: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "products", product.id), { status });

      await addDoc(collection(db, "notifications"), {
        userId: product.sellerId,
        message: `Your product "${product.title}" has been ${status}`,
        createdAt: serverTimestamp(),
        read: false,
      });

      toast.success(`Product ${status}`);
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted");
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  if (role !== "admin") {
    return <div style={styles.center}>Access Denied</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <p style={styles.kicker}>MEEFICIOUS ADMIN</p>
          <h1 style={styles.title}>Control Panel</h1>
          <p style={styles.subtitle}>Approve products, monitor orders, and manage users.</p>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{counts.pending}</span>
            <span style={styles.heroStatLabel}>Pending</span>
          </div>
          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{counts.orders}</span>
            <span style={styles.heroStatLabel}>Orders</span>
          </div>
          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{counts.users}</span>
            <span style={styles.heroStatLabel}>Users</span>
          </div>
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("products")}
          style={{ ...styles.tab, ...(activeTab === "products" ? styles.tabActive : {}) }}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          style={{ ...styles.tab, ...(activeTab === "orders" ? styles.tabActive : {}) }}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{ ...styles.tab, ...(activeTab === "users" ? styles.tabActive : {}) }}
        >
          Users
        </button>
      </div>

      {activeTab === "products" && (
        <>
          <div style={styles.filters}>
            {(["pending", "approved", "rejected", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setProductFilter(f)}
                style={{ ...styles.filterBtn, ...(productFilter === f ? styles.filterBtnActive : {}) }}
              >
                {f.toUpperCase()} ({f === "all" ? products.length : counts[f]})
              </button>
            ))}
          </div>

          {loading && <p style={styles.center}>Loading products...</p>}
          {!loading && visibleProducts.length === 0 && (
            <p style={styles.center}>No {productFilter === "all" ? "" : productFilter} products</p>
          )}

          <div style={styles.grid}>
            {visibleProducts.map((product) => (
              <div key={product.id} style={styles.card}>
                <div style={styles.imageWrap}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.title} style={styles.image} />
                  ) : (
                    <div style={styles.placeholder}>No Image</div>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.rowBetween}>
                    <h3 style={styles.productTitle}>{product.title}</h3>
                    <span style={{ ...styles.badge, ...statusStyle(product.status) }}>
                      {product.status}
                    </span>
                  </div>

                  <p style={styles.description}>
                    {product.description || "No description provided"}
                  </p>

                  <div style={styles.rowBetween}>
                    <strong style={styles.price}>₦{product.price}</strong>
                    <span style={styles.smallText}>Seller: {product.sellerId.slice(0, 8)}</span>
                  </div>

                  <div style={styles.actions}>
                    {product.status === "pending" && (
                      <>
                        <button style={styles.approve} onClick={() => updateStatus(product, "approved")}>
                          Approve
                        </button>
                        <button style={styles.reject} onClick={() => updateStatus(product, "rejected")}>
                          Reject
                        </button>
                      </>
                    )}
                    <button style={styles.delete} onClick={() => deleteProduct(product.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "orders" && (
        <>
          {orders.length === 0 ? (
            <p style={styles.center}>No orders yet.</p>
          ) : (
            <div style={styles.list}>
              {orders.map((order) => (
                <div key={order.id} style={styles.listItem}>
                  <div>
                    <div style={styles.listTitle}>Order #{order.orderId || order.id.slice(0, 8)}</div>
                    <div style={styles.smallText}>Buyer: {order.userId.slice(0, 10)}</div>
                    <div style={styles.smallText}>
                      Total: ₦{order.total}
                    </div>
                  </div>

                  <div style={styles.listRight}>
                    <span style={{ ...styles.badge, ...styles.orderBadge }}>
                      {order.status || "pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "users" && (
        <>
          {users.length === 0 ? (
            <p style={styles.center}>No users found.</p>
          ) : (
            <div style={styles.list}>
              {users.map((userItem) => (
                <div key={userItem.id} style={styles.listItem}>
                  <div>
                    <div style={styles.listTitle}>
                      {userItem.displayName || "Unnamed User"}
                    </div>
                    <div style={styles.smallText}>{userItem.email || "No email"}</div>
                  </div>

                  <div style={styles.listRight}>
                    <span style={{ ...styles.badge, ...roleStyle(userItem.role || "buyer") }}>
                      {userItem.role || "buyer"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const statusStyle = (status: "pending" | "approved" | "rejected"): React.CSSProperties => {
  if (status === "approved") return { background: "#e6f7ec", color: "#1b7f3a" };
  if (status === "rejected") return { background: "#fdecea", color: "#b42318" };
  return { background: "#fff8e1", color: "#b26a00" };
};

const roleStyle = (role: "buyer" | "seller" | "admin"): React.CSSProperties => {
  if (role === "admin") return { background: "#ede7f6", color: "#5e35b1" };
  if (role === "seller") return { background: "#e3f2fd", color: "#1565c0" };
  return { background: "#eef7f0", color: "#2e7d32" };
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 16,
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "stretch",
    flexWrap: "wrap",
    background: "linear-gradient(135deg, #111827, #1f2937)",
    color: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  },
  kicker: {
    margin: 0,
    letterSpacing: 2,
    fontSize: 12,
    opacity: 0.8,
  },
  title: {
    margin: "6px 0 6px",
    fontSize: 32,
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    opacity: 0.85,
  },
  heroStats: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  heroStatCard: {
    minWidth: 92,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(8px)",
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: 800,
  },
  heroStatLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  tab: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    padding: "10px 16px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
  },
  tabActive: {
    background: "#111827",
    color: "#fff",
    borderColor: "#111827",
  },
  filters: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  filterBtn: {
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
  },
  filterBtnActive: {
    background: "#28a745",
    color: "#fff",
    borderColor: "#28a745",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: 16,
  },
  card: {
    display: "flex",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    background: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    border: "1px solid #f1f5f9",
  },
  imageWrap: {
    width: 96,
    height: 96,
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 14,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    background: "#eef2f7",
    color: "#64748b",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  productTitle: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.2,
  },
  description: {
    fontSize: 13,
    color: "#475569",
    margin: "8px 0 10px",
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
  },
  badge: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 700,
    textTransform: "capitalize",
  },
  smallText: {
    fontSize: 12,
    color: "#64748b",
  },
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  },
  approve: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  reject: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  delete: {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  listItem: {
    background: "#fff",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  listTitle: {
    fontWeight: 700,
    marginBottom: 4,
  },
  listRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  orderBadge: {
    background: "#eef2ff",
    color: "#3730a3",
  },
  center: {
    textAlign: "center",
    padding: 30,
  },
};

export default AdminDashboard;