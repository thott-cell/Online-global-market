// src/App.tsx
import { SearchProvider } from "./context/SearchContext";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import BackButton from "./components/BackButton";

import Home from "./components/Home";
import OrderSuccess from "./pages/OrderSuccess";
import OrderDetail from "./pages/OrderDetail";
import Favorite from "./components/Favorite";
import Profile from "./components/Profile";
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

import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";

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

export default function App() {
  return (
    <SearchProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SearchProvider>
  );
}

function AppContent() {
  const { cartItems } = useCart();
  const { role, logout } = useAuth();

  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [prevPage, setPrevPage] = useState<Page | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

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

  const handlePageChange = (
    page: Page | string,
    extra?: { productId?: string; notificationId?: string; orderId?: string } | string
  ) => {
    const pageStr = page as string;

    if (pageStr === "signout") {
      void logout?.();
      setPrevPage(null);
      setCurrentPage("home");
      return;
    }

    setPrevPage(currentPage);

    if (extra && typeof extra === "object") {
      if ("productId" in extra) {
        setSelectedProductId(extra.productId || null);
      }

      if ("notificationId" in extra) {
        setSelectedNotificationId(extra.notificationId || null);
      }

      if ("orderId" in extra) {
        setSelectedOrderId(extra.orderId || null);
      }
    }

    setCurrentPage(pageStr as Page);
  };

  const navHandler = (
    page: string,
    extra?: { productId?: string; notificationId?: string; orderId?: string } | string
  ) => {
    handlePageChange(page, extra);
  };

  const handleBack = (): void => {
    if (prevPage) {
      setCurrentPage(prevPage);
      setPrevPage(null);
    } else {
      setCurrentPage("home");
    }
  };

  const showBackButton = currentPage !== "home";

  useEffect(() => {
    if (role === "admin") setCurrentPage("adminDashboard");
    else if (role === "seller") setCurrentPage("sellerDashboard");
    else if (role === "buyer") setCurrentPage("profile");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const renderPage = () => {
    const backBtnElement = showBackButton ? (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <BackButton onBack={handleBack} />
        <span style={{ fontWeight: 600 }}>{pageNames[(currentPage as Page) ?? "home"]}</span>
      </div>
    ) : null;

    if (typeof currentPage === "string" && currentPage.startsWith("category-")) {
      const category = currentPage.replace("category-", "");
      return (
        <>
          {backBtnElement}
          <CategoryProducts category={category} />
        </>
      );
    }

    switch (currentPage) {
      case "home":
        return (
          <Home
            onChangePage={navHandler}
            onSelectProduct={(id) => handlePageChange("productDetail", { productId: id })}
          />
        );

      case "menu":
        return <>{backBtnElement}</>;

      case "cart":
        return (
          <>
            {backBtnElement}
            <Cart setCurrentPage={navHandler} />
          </>
        );

      case "productDetail":
        if (!selectedProductId) return <p>Product not found.</p>;
        return (
          <>
            {backBtnElement}
            <ProductDetail productId={selectedProductId} onBack={handleBack} />
          </>
        );

      case "favorite":
        return (
          <>
            {backBtnElement}
            <Favorite />
          </>
        );

      case "profile":
        return (
          <>
            {backBtnElement}
            <Profile onChangePage={(p) => handlePageChange(p as Page)} />
          </>
        );

      case "orders":
        return (
          <>
            {backBtnElement}
            <Orders setCurrentPage={navHandler} />
          </>
        );

      case "addresses":
        return (
          <>
            {backBtnElement}
            <SavedAddresses onSaved={() => handlePageChange("addresses")} />
          </>
        );

      case "payments":
        return (
          <>
            {backBtnElement}
            <PaymentMethods />
          </>
        );

      case "accountSettings":
        return (
          <>
            {backBtnElement}
            <AccountSettings />
          </>
        );

      case "sellerDashboard":
        return (
          <>
            {backBtnElement}
            {role === "seller" ? <SellerDashboard /> : <p>Access denied</p>}
          </>
        );

      case "sellerAddProduct":
        return (
          <>
            {backBtnElement}
            {role === "seller" ? <SellerAddProduct /> : <p>Access denied</p>}
          </>
        );

      case "adminDashboard":
        return (
          <>
            {backBtnElement}
            {role === "admin" ? <AdminDashboard /> : <p>Access denied</p>}
          </>
        );

      case "marketplace":
        return (
          <>
            {backBtnElement}
            <Marketplace />
          </>
        );

      case "help":
        return (
          <>
            {backBtnElement}
            <HelpSupport />
          </>
        );

      case "checkout":
        return (
          <>
            {backBtnElement}
            <Checkout setCurrentPage={navHandler} />
          </>
        );

      case "orderSuccess":
        return (
          <>
            {backBtnElement}
            <OrderSuccess setCurrentPage={(p) => navHandler(p as string)} />
          </>
        );

      case "signup":
        return <Signup onSignedUp={() => handlePageChange("home")} />;

      case "login":
        return <Login setCurrentPage={navHandler} />;

      case "notifications":
        return (
          <>
            {backBtnElement}
            <Notifications
              onSelectNotification={(id) =>
                handlePageChange("notificationDetail", { notificationId: id })
              }
            />
          </>
        );

      case "notificationDetail":
        if (!selectedNotificationId) return <p>Notification not found.</p>;
        return (
          <>
            {backBtnElement}
            <NotificationDetail
              notificationId={selectedNotificationId}
              onBack={handleBack}
            />
          </>
        );

      case "categories":
        return (
          <>
            {backBtnElement}
            <Categories onChangePage={(p: string) => navHandler(p)} />
          </>
        );

      case "orderDetail":
        if (!selectedOrderId) return <p>Order not found.</p>;
        return (
          <>
            {backBtnElement}
            <OrderDetail orderId={selectedOrderId} onBack={handleBack} />
          </>
        );

      default:
        return (
          <Home
            onChangePage={navHandler}
            onSelectProduct={(id) => handlePageChange("productDetail", { productId: id })}
          />
        );
    }
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
      <Navbar cartCount={cartCount} currentPage={currentPage as string} onChangePage={navHandler} />
      <main>{renderPage()}</main>
    </>
  );
}