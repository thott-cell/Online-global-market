// src/pages/SavedAddress.tsx
import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

interface SavedAddressProps {
  onSaved: (address: any) => void; // callback after saving
}

const SavedAddress = ({ onSaved }: SavedAddressProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [addressId, setAddressId] = useState<string | null>(null); // track existing doc

  // Load existing address if exists
  useEffect(() => {
    const fetchAddress = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "addresses"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          setAddressId(snap.docs[0].id); // save doc id
          setName(docData.name || "");
          setPhone(docData.phone || "");
          setStreet(docData.street || "");
          setCity(docData.city || "");
          setState(docData.state || "");
        }
      } catch (err) {
        console.error("Failed to fetch existing address:", err);
      }
    };
    fetchAddress();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save an address.");
      return;
    }

    if (!name || !phone || !street || !city || !state) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      if (addressId) {
        // Update existing address
        const docRef = doc(db, "addresses", addressId);
        await updateDoc(docRef, {
          name,
          phone,
          street,
          city,
          state,
          updatedAt: serverTimestamp(),
        });
        toast.success("Address updated successfully!");
      } else {
        // Add new address
        const docRef = await addDoc(collection(db, "addresses"), {
          userId: user.uid,
          name,
          phone,
          street,
          city,
          state,
          createdAt: serverTimestamp(),
        });
        setAddressId(docRef.id); // save new id
        toast.success("Address saved successfully!");
      }

      // Immediately update parent component (Checkout)
      if (onSaved) onSaved({ name, phone, street, city, state });

    } catch (err) {
      console.error("Failed to save/update address:", err);
      toast.error("Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Delivery Address</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Street Address"
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="State/Province"
        value={state}
        onChange={(e) => setState(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleSave} disabled={loading} style={styles.button}>
        {loading ? "Saving..." : addressId ? "Update Address" : "Save Address"}
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 500,
    margin: "50px auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    border: "1px solid #eee",
    borderRadius: 8,
    background: "#fff",
  },
  input: {
    padding: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    border: "none",
    background: "#007bff",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default SavedAddress;