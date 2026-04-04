// src/pages/PaymentMethods.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

const PaymentMethods = () => {
  const { user } = useAuth();
  const [card, setCard] = useState({ brand: "", last4: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data?.profilePayment) setCard(data.profilePayment);
      }
    })();
  }, [user]);

  const save = async () => {
    if (!user) return alert("Please sign in.");
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), { profilePayment: card }, { merge: true });
      alert("Payment method saved (demo).");
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p style={{ textAlign: "center" }}>Please sign in to manage payment methods.</p>;

  return (
    <div style={{ maxWidth:700, margin:"20px auto" }}>
      <h2>Payment Methods</h2>
      <input placeholder="Card brand (demo)" value={card.brand} onChange={e => setCard({...card, brand: e.target.value})} />
      <input placeholder="Last 4 digits" value={card.last4} onChange={e => setCard({...card, last4: e.target.value})} />
      <button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
      <p style={{ color: "#666", marginTop: 12 }}>Note: This is a demo — integrate a proper payments provider (Stripe, etc.) for production.</p>
    </div>
  );
};

export default PaymentMethods;