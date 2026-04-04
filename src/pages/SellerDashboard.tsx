// src/pages/SellerDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import toast from "react-hot-toast";

type ProductStatus = "pending" | "approved" | "rejected";
type OrderStatus = "pending" | "processing" | "dispatch" | "delivered";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  status: ProductStatus;
  createdAt?: any;
  sellerId: string;
}

interface OrderProduct {
  id?: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  sellerId: string;
}

interface Address {
  name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
}

interface Buyer {
  email?: string;
  gmail?: string;
  displayName?: string;
  name?: string;
}

interface Order {
  id: string;
  orderId?: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  user?: Buyer;
  products: OrderProduct[];
  total?: number;
  itemsTotal?: number;
  deliveryFee?: number;
  status: OrderStatus;
  createdAt?: any;
  address?: Address;
  sellerProducts: OrderProduct[];
  sellerSubtotal: number;
}

const orderStatusColors: Record<OrderStatus, string> = {
  pending: "#f0ad4e",
  processing: "#0275d8",
  dispatch: "#5cb85c",
  delivered: "#6c757d",
};

const productStatusColors: Record<ProductStatus, string> = {
  pending: "#f0ad4e",
  approved: "#5bc0de",
  rejected: "#d9534f",
};

function formatMoney(value: number) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function formatDate(createdAt: any) {
  try {
    if (!createdAt?.toDate) return "—";
    return createdAt.toDate().toLocaleDateString();
  } catch {
    return "—";
  }
}

function calcSubtotal(products: OrderProduct[]) {
  return products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0),
    0
  );
}

function normalizeAddress(addr: any): Address | undefined {
  if (!addr) return undefined;
  return {
    name: addr.name ?? "",
    phone: addr.phone ?? "",
    street: addr.street ?? "",
    city: addr.city ?? "",
    state: addr.state ?? "",
  };
}

function getBuyerEmail(order: Order) {
  return (
    order.userEmail ||
    order.user?.email ||
    order.user?.gmail ||
    order.userName ||
    order.user?.displayName ||
    order.user?.name ||
    "—"
  );
}

const SellerDashboard = () => {
  const { user, role } = useAuth();

  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [orderFilter, setOrderFilter] = useState<"all" | OrderStatus>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedAddressIds, setExpandedAddressIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!user || role !== "seller") return;

    let cancelled = false;

    const productsQuery = query(
      collection(db, "products"),
      where("sellerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubProducts = onSnapshot(
      productsQuery,
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, "id">),
        })) as Product[];

        if (!cancelled) setProducts(data);
      },
      (err) => {
        console.error(err);
        toast.error("Failed to load products");
      }
    );

    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubOrders = onSnapshot(
      ordersQuery,
      async (snap) => {
        try {
          const rawOrders = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          })) as Array<any>;

          const relevantOrders = rawOrders.filter(
            (order) =>
              Array.isArray(order.products) &&
              order.products.some((p: OrderProduct) => p.sellerId === user.uid)
          );

          const enrichedOrders: Order[] = await Promise.all(
            relevantOrders.map(async (order) => {
              const sellerProducts = (order.products ?? []).filter(
                (p: OrderProduct) => p.sellerId === user.uid
              );

              const sellerSubtotal = calcSubtotal(sellerProducts);

              let buyer: Buyer | undefined = undefined;

              if (
                order.userEmail ||
                order.userName ||
                order.user?.email ||
                order.user?.gmail ||
                order.user?.displayName
              ) {
                buyer = {
                  email: order.userEmail ?? order.user?.email,
                  gmail: order.user?.gmail,
                  displayName: order.userName ?? order.user?.displayName,
                  name: order.user?.name,
                };
              } else {
                try {
                  const userSnap = await getDoc(doc(db, "users", order.userId));
                  if (userSnap.exists()) {
                    const data = userSnap.data() as any;
                    buyer = {
                      email: data.email ?? data.gmail ?? "",
                      gmail: data.gmail ?? data.email ?? "",
                      displayName: data.displayName ?? data.name ?? "",
                      name: data.name ?? data.displayName ?? "",
                    };
                  }
                } catch (err) {
                  console.warn("Failed fetching buyer data", err);
                }
              }

              let address: Address | undefined = normalizeAddress(order.address);

              if (!address) {
                try {
                  const addrQ = query(
                    collection(db, "addresses"),
                    where("userId", "==", order.userId)
                  );
                  const addrSnap = await getDocs(addrQ);
                  if (!addrSnap.empty) {
                    address = normalizeAddress(addrSnap.docs[0].data());
                  }
                } catch (err) {
                  console.warn("Failed fetching address", err);
                }
              }

              const total =
                typeof order.total === "number"
                  ? order.total
                  : (order.itemsTotal ?? calcSubtotal(order.products ?? [])) +
                    Number(order.deliveryFee || 0);

              return {
                id: order.id,
                orderId: order.orderId,
                userId: order.userId,
                userEmail: order.userEmail,
                userName: order.userName,
                user: buyer,
                products: order.products ?? [],
                total,
                itemsTotal:
                  typeof order.itemsTotal === "number"
                    ? order.itemsTotal
                    : calcSubtotal(order.products ?? []),
                deliveryFee:
                  typeof order.deliveryFee === "number" ? order.deliveryFee : 0,
                status: order.status,
                createdAt: order.createdAt,
                address,
                sellerProducts,
                sellerSubtotal,
              };
            })
          );

          if (!cancelled) setOrders(enrichedOrders);
        } catch (err) {
          console.error(err);
          toast.error("Failed to load orders");
        }
      },
      (err) => {
        console.error(err);
        toast.error("Failed to load orders");
      }
    );

    return () => {
      cancelled = true;
      unsubProducts();
      unsubOrders();
    };
  }, [user, role]);

  const toggleAddress = (orderId: string) => {
    setExpandedAddressIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      toast.success(`Updated to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = useMemo(() => {
    return orderFilter === "all"
      ? orders
      : orders.filter((o) => o.status === orderFilter);
  }, [orders, orderFilter]);

  if (!user || role !== "seller") {
    return <div style={{ padding: 40 }}>Access denied</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 15px 90px" }}>
      <h2 style={{ marginBottom: 16 }}>Seller Dashboard</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("products")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: activeTab === "products" ? "#333" : "#ddd",
            color: activeTab === "products" ? "#fff" : "#000",
            cursor: "pointer",
          }}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: activeTab === "orders" ? "#333" : "#ddd",
            color: activeTab === "orders" ? "#fff" : "#000",
            cursor: "pointer",
          }}
        >
          Orders
        </button>
      </div>

      {activeTab === "products" && (
        <div>
          {products.length === 0 && <p>No products yet.</p>}

          {products.map((p) => (
            <div
              key={p.id}
              style={{
                padding: 12,
                marginBottom: 12,
                borderRadius: 8,
                background: "#f7f7f7",
              }}
            >
              <strong>{p.title}</strong>
              {p.description && <div style={{ fontSize: 14 }}>{p.description}</div>}
              <div>{formatMoney(p.price)}</div>

              <div
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  padding: "4px 8px",
                  borderRadius: 4,
                  background: productStatusColors[p.status],
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {p.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 15, flexWrap: "wrap" }}>
            {(["all", "pending", "processing", "dispatch", "delivered"] as const).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 4,
                    border: "none",
                    background: orderFilter === f ? "#333" : "#ccc",
                    color: orderFilter === f ? "#fff" : "#000",
                    cursor: "pointer",
                  }}
                >
                  {f.toUpperCase()}
                </button>
              )
            )}
          </div>

          {filteredOrders.length === 0 && <p>No orders found.</p>}

          {filteredOrders.map((order) => {
            const isOpen = expandedAddressIds.has(order.id);
            const orderTotal =
              typeof order.total === "number"
                ? order.total
                : (order.itemsTotal ?? calcSubtotal(order.products)) +
                  Number(order.deliveryFee || 0);

            return (
              <div
                key={order.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 14,
                  marginBottom: 20,
                  background: "#fafafa",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div>
                    <strong>Order ID:</strong> {order.orderId ?? order.id}
                  </div>

                  <div
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: orderStatusColors[order.status],
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  >
                    {order.status.toUpperCase()}
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <strong>Buyer Gmail:</strong> {getBuyerEmail(order)}
                </div>

                <div style={{ marginTop: 4 }}>
                  <strong>Order total:</strong> {formatMoney(orderTotal)}
                </div>

                <div style={{ marginTop: 4 }}>
                  <strong>Your subtotal:</strong> {formatMoney(order.sellerSubtotal)}
                </div>

                <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
                  <strong>Date:</strong> {formatDate(order.createdAt)}
                </div>

                <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                  {order.sellerProducts.map((p) => (
                    <li key={p.id ?? `${p.title}-${p.price}`}>
                      <strong>{p.title}</strong>
                      {p.description ? ` — ${p.description}` : ""} × {p.quantity} —{" "}
                      {formatMoney(Number(p.price || 0) * Number(p.quantity || 0))}
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => toggleAddress(order.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 4,
                      border: "none",
                      background: "#007bff",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    {isOpen ? "Hide Address" : "View Address"}
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 10,
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        background: "#f0f0f0",
                      }}
                    >
                      {order.address ? (
                        <>
                          <p>
                            <strong>Name:</strong> {order.address.name || "—"}
                          </p>
                          <p>
                            <strong>Phone:</strong> {order.address.phone || "—"}
                          </p>
                          <p>
                            <strong>Street:</strong> {order.address.street || "—"}
                          </p>
                          <p>
                            <strong>City:</strong> {order.address.city || "—"}
                          </p>
                          <p>
                            <strong>State:</strong> {order.address.state || "—"}
                          </p>
                        </>
                      ) : (
                        <p>No address saved for this order.</p>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  {(["pending", "processing", "dispatch", "delivered"] as OrderStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        disabled={order.status === status}
                        onClick={() => updateOrderStatus(order.id, status)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 4,
                          border: "none",
                          cursor: order.status === status ? "not-allowed" : "pointer",
                          background: orderStatusColors[status],
                          color: "#fff",
                          fontWeight: "bold",
                          opacity: order.status === status ? 0.6 : 1,
                        }}
                      >
                        {status.toUpperCase()}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;