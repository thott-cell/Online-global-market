// src/App.tsx
import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { SearchProvider } from "./context/SearchContext";
import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";

import Navbar from "./components/Navbar";
import BackButton from "./components/BackButton";
import SplashScreen from "./components/SplashScreen";

import Home from "./components/Home";
import Favorite from "./components/Favorite";
import Profile from "./components/Profile";

import OrderSuccess from "./pages/OrderSuccess";
import OrderDetail from "./pages/OrderDetail";
import ProductDetail from "./pages/ProductDetail";
import Notifications from "./pages/Notifications";
import NotificationDetail from "./pages/NotificationDetail";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Orders from "./pages/Order";
import SavedAddresses from "./pages/SavedAddress";
import PaymentMethods from "./pages/PaymentMethods";
import AccountSettings from "./pages/AccountSettings";
import SellerDashboard from "./pages/SellerDashboard";
import SellerAddProduct from "./pages/SellerAddProduct";
import AdminDashboard from "./pages/AdminDashboard";
import Marketplace from "./pages/Marketplace";
import HelpSupport from "./pages/HelpSupport";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";

type Page =
  | "home"
  | "menu"
  | "categories"
  | "favorite"
  | "profile"
  | "signup"
  | "login"
  | "cart"
  | "checkout"
  | "sellerAddProduct"
  | "adminDashboard"
  | "marketplace"
  | "orders"
  | "addresses"
  | "payments"
  | "accountSettings"
  | "sellerDashboard"
  | "help"
  | "notifications"
  | "notificationDetail"
  | "productDetail"
  | "orderSuccess"
  | "orderDetail";

type NavExtra = {
  productId?: string;
  notificationId?: string;
  orderId?: string;
};

const pageNames: Record<Page, string> = {
  home: "Home",
  menu: "Menu",
  categories: "Categories",
  favorite: "Favorite",
  profile: "Profile",
  signup: "Sign Up",
  login: "Login",
  cart: "Cart",
  checkout: "Checkout",
  sellerAddProduct: "Add Product",
  adminDashboard: "Admin Dashboard",
  marketplace: "Marketplace",
  orders: "Orders",
  addresses: "Saved Addresses",
  payments: "Payment Methods",
  accountSettings: "Account Settings",
  sellerDashboard: "Seller Dashboard",
  help: "Help & Support",
  notifications: "Notifications",
  notificationDetail: "Notification Detail",
  productDetail: "Product Detail",
  orderSuccess: "Order Success",
  orderDetail: "Order Detail",
};

function getCurrentPageKey(pathname: string): string {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname === "/categories") return "categories";
  if (pathname === "/favorite") return "favorite";
  if (pathname === "/profile") return "profile";
  if (pathname === "/signup") return "signup";
  if (pathname === "/login") return "login";
  if (pathname === "/cart") return "cart";
  if (pathname === "/checkout") return "checkout";
  if (pathname === "/seller-add-product") return "sellerAddProduct";
  if (pathname === "/admin-dashboard") return "adminDashboard";
  if (pathname === "/marketplace") return "marketplace";
  if (pathname === "/orders") return "orders";
  if (pathname === "/addresses") return "addresses";
  if (pathname === "/payments") return "payments";
  if (pathname === "/account-settings") return "accountSettings";
  if (pathname === "/seller-dashboard") return "sellerDashboard";
  if (pathname === "/help") return "help";
  if (pathname === "/notifications") return "notifications";
  if (pathname === "/order-success") return "orderSuccess";
  if (pathname.startsWith("/product/")) return "productDetail";
  if (pathname.startsWith("/notification/")) return "notificationDetail";
  if (pathname.startsWith("/order/")) return "orderDetail";
  if (pathname.startsWith("/category/")) return "categories";
  return "home";
}

function PageShell({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <BackButton onBack={onBack} />
        <span style={{ fontWeight: 600 }}>{title}</span>
      </div>
      {children}
    </>
  );
}

function CategoryProductsRoute({ onBack }: { onBack: () => void }) {
  const { categoryId } = useParams<{ categoryId: string }>();

  if (!categoryId) {
    return (
      <PageShell title="Categories" onBack={onBack}>
        <p>Category not found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="Categories" onBack={onBack}>
      <CategoryProducts category={categoryId} />
    </PageShell>
  );
}

function ProductDetailRoute({ onBack }: { onBack: () => void }) {
  const { productId } = useParams<{ productId: string }>();

  if (!productId) {
    return (
      <PageShell title={pageNames.productDetail} onBack={onBack}>
        <p>Product not found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell title={pageNames.productDetail} onBack={onBack}>
      <ProductDetail productId={productId} onBack={onBack} />
    </PageShell>
  );
}

function NotificationDetailRoute({ onBack }: { onBack: () => void }) {
  const { notificationId } = useParams<{ notificationId: string }>();

  if (!notificationId) {
    return (
      <PageShell title={pageNames.notificationDetail} onBack={onBack}>
        <p>Notification not found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell title={pageNames.notificationDetail} onBack={onBack}>
      <NotificationDetail notificationId={notificationId} onBack={onBack} />
    </PageShell>
  );
}

function OrderDetailRoute({ onBack }: { onBack: () => void }) {
  const { orderId } = useParams<{ orderId: string }>();

  if (!orderId) {
    return (
      <PageShell title={pageNames.orderDetail} onBack={onBack}>
        <p>Order not found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell title={pageNames.orderDetail} onBack={onBack}>
      <OrderDetail orderId={orderId} onBack={onBack} />
    </PageShell>
  );
}

function AppContent() {
  const { cartItems } = useCart();
  const { role, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const currentPage = getCurrentPageKey(location.pathname);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  

  
  const handleBack = (): void => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  const handlePageChange = (
    page: Page | string,
    extra?: NavExtra | string
  ) => {
    const pageStr = page as string;

    if (pageStr === "signout") {
      void logout?.();
      navigate("/", { replace: true });
      return;
    }

    if (pageStr.startsWith("category-")) {
      const category = pageStr.replace("category-", "");
      navigate(`/category/${category}`);
      return;
    }

    switch (pageStr) {
      case "home":
      case "menu":
        navigate("/");
        return;
      case "categories":
        navigate("/categories");
        return;
      case "favorite":
        navigate("/favorite");
        return;
      case "profile":
        navigate("/profile");
        return;
      case "signup":
        navigate("/signup");
        return;
      case "login":
        navigate("/login");
        return;
      case "cart":
        navigate("/cart");
        return;
      case "checkout":
        navigate("/checkout");
        return;
      case "sellerAddProduct":
        navigate("/seller-add-product");
        return;
      case "adminDashboard":
        navigate("/admin-dashboard");
        return;
      case "marketplace":
        navigate("/marketplace");
        return;
      case "orders":
        navigate("/orders");
        return;
      case "addresses":
        navigate("/addresses");
        return;
      case "payments":
        navigate("/payments");
        return;
      case "accountSettings":
        navigate("/account-settings");
        return;
      case "sellerDashboard":
        navigate("/seller-dashboard");
        return;
      case "help":
        navigate("/help");
        return;
      case "notifications":
        navigate("/notifications");
        return;
      case "notificationDetail":
        if (typeof extra === "object" && extra?.notificationId) {
          navigate(`/notification/${extra.notificationId}`);
        } else {
          navigate("/notifications");
        }
        return;
      case "productDetail":
        if (typeof extra === "object" && extra?.productId) {
          navigate(`/product/${extra.productId}`);
        } else {
          navigate("/");
        }
        return;
      case "orderSuccess":
        navigate("/order-success");
        return;
      case "orderDetail":
        if (typeof extra === "object" && extra?.orderId) {
          navigate(`/order/${extra.orderId}`);
        } else {
          navigate("/orders");
        }
        return;
      default:
        navigate("/");
    }
  };

  const navHandler = (
    page: string,
    extra?: NavExtra | string
  ) => {
    handlePageChange(page, extra);
  };

  return (
    <>
      <Toaster position="top-right" />
      {isOffline && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 9999,
            background: "#d32f2f",
            color: "#fff",
            textAlign: "center",
            padding: "8px 12px",
            fontWeight: 600,
          }}
        >
          You are offline
        </div>
      )}

      <Navbar
        cartCount={cartCount}
        currentPage={currentPage}
        onChangePage={navHandler}
      />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onChangePage={navHandler}
                onSelectProduct={(id) =>
                  handlePageChange("productDetail", { productId: id })
                }
              />
            }
          />

          <Route
            path="/menu"
            element={
              <Home
                onChangePage={navHandler}
                onSelectProduct={(id) =>
                  handlePageChange("productDetail", { productId: id })
                }
              />
            }
          />

          <Route
            path="/cart"
            element={
              <PageShell title={pageNames.cart} onBack={handleBack}>
                <Cart setCurrentPage={navHandler} />
              </PageShell>
            }
          />

          <Route
            path="/product/:productId"
            element={<ProductDetailRoute onBack={handleBack} />}
          />

          <Route
            path="/favorite"
            element={
              <PageShell title={pageNames.favorite} onBack={handleBack}>
                <Favorite />
              </PageShell>
            }
          />

          <Route
            path="/profile"
            element={
              <PageShell title={pageNames.profile} onBack={handleBack}>
                <Profile onChangePage={(p) => handlePageChange(p as Page)} />
              </PageShell>
            }
          />

          <Route
            path="/orders"
            element={
              <PageShell title={pageNames.orders} onBack={handleBack}>
                <Orders setCurrentPage={navHandler} />
              </PageShell>
            }
          />

          <Route
            path="/order/:orderId"
            element={<OrderDetailRoute onBack={handleBack} />}
          />

          <Route
            path="/addresses"
            element={
              <PageShell title={pageNames.addresses} onBack={handleBack}>
                <SavedAddresses onSaved={() => handlePageChange("addresses")} />
              </PageShell>
            }
          />

          <Route
            path="/payments"
            element={
              <PageShell title={pageNames.payments} onBack={handleBack}>
                <PaymentMethods />
              </PageShell>
            }
          />

          <Route
            path="/account-settings"
            element={
              <PageShell title={pageNames.accountSettings} onBack={handleBack}>
                <AccountSettings />
              </PageShell>
            }
          />

          <Route
            path="/seller-dashboard"
            element={
              <PageShell title={pageNames.sellerDashboard} onBack={handleBack}>
                {role === "seller" ? <SellerDashboard /> : <p>Access denied</p>}
              </PageShell>
            }
          />

          <Route
            path="/seller-add-product"
            element={
              <PageShell title={pageNames.sellerAddProduct} onBack={handleBack}>
                {role === "seller" ? <SellerAddProduct /> : <p>Access denied</p>}
              </PageShell>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <PageShell title={pageNames.adminDashboard} onBack={handleBack}>
                {role === "admin" ? <AdminDashboard /> : <p>Access denied</p>}
              </PageShell>
            }
          />

          <Route
            path="/marketplace"
            element={
              <PageShell title={pageNames.marketplace} onBack={handleBack}>
                <Marketplace />
              </PageShell>
            }
          />

          <Route
            path="/help"
            element={
              <PageShell title={pageNames.help} onBack={handleBack}>
                <HelpSupport />
              </PageShell>
            }
          />

          <Route
            path="/checkout"
            element={
              <PageShell title={pageNames.checkout} onBack={handleBack}>
                <Checkout setCurrentPage={navHandler} />
              </PageShell>
            }
          />

          <Route
            path="/order-success"
            element={
              <PageShell title={pageNames.orderSuccess} onBack={handleBack}>
                <OrderSuccess setCurrentPage={(p) => navHandler(p as string)} />
              </PageShell>
            }
          />

          <Route
            path="/signup"
            element={<Signup onSignedUp={() => handlePageChange("home")} />}
          />

          <Route
            path="/login"
            element={<Login setCurrentPage={navHandler} />}
          />

          <Route
            path="/notifications"
            element={
              <PageShell title={pageNames.notifications} onBack={handleBack}>
                <Notifications
                  onSelectNotification={(id) =>
                    handlePageChange("notificationDetail", { notificationId: id })
                  }
                />
              </PageShell>
            }
          />

          <Route
            path="/notification/:notificationId"
            element={<NotificationDetailRoute onBack={handleBack} />}
          />

          <Route
            path="/categories"
            element={
              <PageShell title={pageNames.categories} onBack={handleBack}>
                <Categories onChangePage={(p: string) => navHandler(p)} />
              </PageShell>
            }
          />

          <Route
            path="/category/:categoryId"
            element={<CategoryProductsRoute onBack={handleBack} />}
          />

          <Route
            path="*"
            element={
              <Home
                onChangePage={navHandler}
                onSelectProduct={(id) =>
                  handlePageChange("productDetail", { productId: id })
                }
              />
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SearchProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            {showSplash ? (
              <SplashScreen onFinish={() => setShowSplash(false)} />
            ) : (
              <AppContent />
            )}
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SearchProvider>
  );
}