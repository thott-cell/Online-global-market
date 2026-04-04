// src/pages/AccountSettings.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config";
import { updateProfile } from "firebase/auth";
import { toast } from "react-hot-toast";

const AccountSettings = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || "");
  }, [user]);

  if (!user) return <p style={{ textAlign: "center" }}>Please sign in to edit account.</p>;

  const save = async () => {
    try {
      await updateProfile(auth.currentUser!, { displayName });
      toast.success("Profile updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div style={{ maxWidth:700, margin:"20px auto" }}>
      <h2>Account Settings</h2>
      <input placeholder="Display name" style={{ padding: "8px", background: "#fff", borderRadius: "4px", border: "1px solid #ccc" }} value={displayName} onChange={e => setDisplayName(e.target.value)} />
      <button style={{ padding: "8px 16px", background: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }} onClick={save}>Save</button>
    </div>
  );
};

export default AccountSettings;