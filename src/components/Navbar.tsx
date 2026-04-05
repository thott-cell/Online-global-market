import logo from "../assets/logo.png";
import { useSearch } from "../context/SearchContext";

interface NavbarProps {
  cartCount: number;
  onChangePage: (page: string) => void;
  currentPage: string;
}

const Navbar = ({ cartCount, onChangePage, currentPage }: NavbarProps) => {
  const { searchTerm, setSearchTerm } = useSearch();

  const getButtonStyle = (page: string) => ({
    background: currentPage === page ? "#333" : "transparent",
    color: currentPage === page ? "#fff" : "#000",
    borderRadius: 6,
    padding: "6px 12px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  });

  const showMobileNavPages = ["home", "categories", "favorite", "profile"];
  const showMobileNav = showMobileNavPages.includes(currentPage);

  return (
    <>
      {/* ================= Desktop Navbar ================= */}
      <nav className="navbar desktop-nav">
        <div className="logo">
          {currentPage === "home" && (
            <img src={logo} alt="Campus Marketplace Logo" />
          )}
        </div>

        <div className="nav-links">
          <button style={getButtonStyle("home")} onClick={() => onChangePage("home")}>
            <i className="fa-solid fa-house"></i> Home
          </button>

          <button
            style={getButtonStyle("categories")}
            onClick={() => onChangePage("categories")}
          >
            <i className="fa-solid fa-layer-group"></i> Categories
          </button>

          <button
            style={getButtonStyle("favorite")}
            onClick={() => onChangePage("favorite")}
          >
            <i className="fa-solid fa-heart"></i> Favorite
          </button>

          <button
            style={getButtonStyle("profile")}
            onClick={() => onChangePage("profile")}
          >
            <i className="fa-solid fa-user"></i> Profile
          </button>
        </div>

        <div className="nav-actions">
          <input
            type="text"
            placeholder="Search products..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button className="cart-btn" onClick={() => onChangePage("cart")}>
            <i className="fa-solid fa-cart-shopping"></i> {cartCount}
          </button>
        </div>
      </nav>

      {/* ================= Mobile Header ================= */}
      <div className="nav-action">
        <div className="logo">
          {currentPage === "home" && (
            <img src={logo} alt="Campus Marketplace Logo" />
          )}
        </div>

        <input
          type="text"
          placeholder="Search products..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button className="cart-btn" onClick={() => onChangePage("cart")}>
          <i className="fa-solid fa-cart-shopping"></i> {cartCount}
        </button>
      </div>

      {/* ================= Mobile Bottom Nav ================= */}
      {showMobileNav && (
        <nav className="mobile-nav">
          <button style={getButtonStyle("home")} onClick={() => onChangePage("home")}>
            <i className="fa-solid fa-house"></i>
            <span>Home</span>
          </button>

          <button
            style={getButtonStyle("categories")}
            onClick={() => onChangePage("categories")}
          >
            <i className="fa-solid fa-layer-group"></i>
            <span>Categories</span>
          </button>

          <button
            style={getButtonStyle("favorite")}
            onClick={() => onChangePage("favorite")}
          >
            <i className="fa-solid fa-heart"></i>
            <span>Favorite</span>
          </button>

          <button
            style={getButtonStyle("profile")}
            onClick={() => onChangePage("profile")}
          >
            <i className="fa-solid fa-user"></i>
            <span>Profile</span>
          </button>
        </nav>
      )}
    </>
  );
};

export default Navbar;