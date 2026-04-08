// src/pages/Login.tsx
import { useState } from "react";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, provider } from "../firebase/config";
import {sendPasswordResetEmail} from "firebase/auth"
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {FaEye, FaEyeSlash} from "react-icons/fa"

interface LoginProps {
  setCurrentPage: (page: string) => void;
}

export default function Login({ }: LoginProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
const [showPassword, setShowPassword] = useState(false);//hhhhhhhhhhhh
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle redirect result on mobile
  useState(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        toast.success("Signed in with Google!");
        navigate("/"); // redirect to home after login
      }
    }).catch((err) => {
      console.error(err);
    });
  });
  const handleForgotPassword = async () => {
  if (!email.trim()) {
    toast.error("Enter your email first.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    toast.success("Password reset link sent to your email.");
  } catch (error: any) {
    const code = error?.code || "";

    if (code === "auth/user-not-found") {
      toast.error("No account found with this email.");
    } else if (code === "auth/invalid-email") {
      toast.error("Invalid email address.");
    } else {
      toast.error("Failed to send reset email.");
    }
  }
};

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!navigator.onLine) {
      toast.error("You are offline. Check your internet connection and try again.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      toast.success("Login successful!");
      navigate("/"); // Redirect to home after login
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found") toast.error("Account not found. Please sign up.");
      else if (code === "auth/wrong-password") toast.error("Incorrect password.");
      else if (code === "auth/invalid-email") toast.error("Please enter a valid email address.");
      else if (code === "auth/too-many-requests") toast.error("Too many attempts. Please try again later.");
      else if (code === "auth/network-request-failed") toast.error("Network error. Please check your internet.");
      else toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!navigator.onLine) {
      toast.error("You are offline. Check your internet connection.");
      return;
    }

    setGoogleLoading(true);

    try {
      // Detect mobile: use redirect instead of popup
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
        toast.success("Signed in with Google!");
        navigate("/"); // redirect to home
      }
    } catch (error: any) {
      const code = error?.code || "";
      if (code === "auth/popup-closed-by-user") toast.error("Google sign-in was closed.");
      else if (code === "auth/network-request-failed") toast.error("Network error. Please check your internet.");
      else toast.error("Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center", padding: 16 }}>
      <h2>Sign In</h2>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
        />

     <div style={{ position: "relative" }}>
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    style={{
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      width: "100%",
    }}
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      right: 10,
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#555",
    }}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 10,
            borderRadius: 5,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p style={{ margin: "15px 0" }}>OR</p>

      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        style={{
          padding: 10,
          background: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          cursor: googleLoading ? "not-allowed" : "pointer",
          opacity: googleLoading ? 0.7 : 1,
        }}
      >
        {googleLoading ? "Please wait..." : "Continue with Google"}
      </button>
      <p
  onClick={handleForgotPassword}
  style={{
    textAlign: "right",
    fontSize: 12,
    cursor: "pointer",
    color: "#007bff",
  }}
>
  Forgot Password?
</p>
    </div>
  );
}