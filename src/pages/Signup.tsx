import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, provider } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast"; // optional: nicer notifications

interface SignupProps {
  onSignedUp?: () => void; // callback after signup to hide buttons
}

export default function Signup({ onSignedUp }: SignupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");

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
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
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
    } catch (error: any) {
      toast.error(error.message);
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "buyer" | "seller")}
          style={styles.input}
        >
          <option value="buyer">Sign in as Buyer</option>
          <option value="seller">Sign in as Seller</option>
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