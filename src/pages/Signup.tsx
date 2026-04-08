// src/pages/Signup.tsx
import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, db, provider } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {FaEye, FaEyeSlash} from "react-icons/fa"


interface SignupProps {
  onSignedUp?: () => void;
}

export default function Signup({ onSignedUp }: SignupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Handle redirect result for mobile Google signup
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const user = result.user;
          await setDoc(doc(db, "users", user.uid), {
            userId: user.uid,
            email: user.email,
            role,
            status: "active",
          });
          toast.success("Signed in with Google successfully!");
          navigate("/"); // redirect to home
          if (onSignedUp) onSignedUp();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [role, navigate, onSignedUp]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        userId: user.uid,
        email: user.email,
        role,
        status: "active",
      });

      toast.success("Account created successfully!");
      if (onSignedUp) onSignedUp();
      navigate("/"); // redirect to home
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, provider); // mobile-friendly
      } else {
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          userId: user.uid,
          email: user.email,
          role,
          status: "active",
        });
        toast.success("Signed in with Google successfully!");
        if (onSignedUp) onSignedUp();
        navigate("/"); // redirect to home
      }
    } catch (error: any) {
      const code = error?.code || "";
      if (code === "auth/popup-closed-by-user") toast.error("Google sign-in was closed.");
      else if (code === "auth/network-request-failed") toast.error("Network error. Please check your internet.");
      else toast.error("Google sign-in failed.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create Account</h2>

      <form onSubmit={handleSignup} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
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
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "buyer" | "seller")}
          style={styles.input}
        >
          <option value="buyer">Sign up as Buyer</option>
          <option value="seller">Sign up as Seller</option>
        </select>
        <button type="submit" style={styles.button}>Sign Up</button>
      </form>

      <p style={{ margin: "15px 0" }}>OR</p>

      <button onClick={handleGoogleSignup} style={styles.googleButton}>
        Continue with Google
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "400px", margin: "50px auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { padding: "10px", borderRadius: "5px", cursor: "pointer" },
  googleButton: { padding: "10px", background: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
};