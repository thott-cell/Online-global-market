// src/pages/Profile.tsx
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "./ProfileMenu";
import { toast } from "react-hot-toast";

type ProfileProps = {
  onChangePage: (page: "home" | "menu" | "deals" | "profile" | "signup" | "login") => void;
};

const Profile = ({ onChangePage }: ProfileProps) => {
  const { user, role, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      onChangePage("home"); // Redirect to Home after logout
    } catch (err) {
      console.error(err);
      toast.error("Failed to log out.");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 16 }}>Account</h1>

      {/* User Info */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 8,
            background: "#eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            color: "#666",
            overflow: "hidden",
          }}
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            user?.displayName
              ? user.displayName[0].toUpperCase()
              : user?.email?.[0].toUpperCase() || "U"
          )}
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {user?.displayName || user?.email || "Unknown User"}
          </div>
          <div style={{ color: "#666", fontSize: 14 }}>
            {role ? role.toUpperCase() : "No role"}
          </div>
        </div>
      </div>

      {/* Profile Menu with Logout */}
      <ProfileMenu
        role={role}
        onNavigate={(page) => {
          if (page === "logout") {
            handleLogout();
          } else {
            onChangePage(page as "home" | "menu" | "deals" | "profile" | "signup" | "login");
          }
        }}
      />
    </div>
  );
};

export default Profile;