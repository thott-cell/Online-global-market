import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal"
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { toast } from "react-hot-toast";

const AccountSettings = () => {
  const { user, logout } = useAuth();

  const [displayName, setDisplayName] = useState("");
   const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // PASSWORD
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");

  // NOTIFICATIONS
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  if (!user) return <p className="center">Please sign in</p>;

  // PROFILE UPDATE
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(auth.currentUser!, { displayName });
      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // PASSWORD CHANGE
  const handleChangePassword = async () => {
    if (!currentPass || !newPass) {
      toast.error("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPass
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);

      toast.success("Password updated");
      setCurrentPass("");
      setNewPass("");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  // DELETE ACCOUNT
 
  const handleDelete = async () => {

    try {
      setLoading(true);
      await deleteUser(user);
      toast.success("Account deleted");
      logout?.();
    } catch {
      toast.error("Re-login required");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings">

      <h2>Account Settings</h2>

      {/* PROFILE */}
      <div className="card">
        <h3>Profile</h3>

        <div className="avatar">
          {displayName?.charAt(0).toUpperCase()}
        </div>

        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
        />

        <input value={user.email || ""} disabled />

        <button onClick={handleSaveProfile}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* PASSWORD */}
      <div className="card">
        <h3>Security</h3>

        <input
          type="password"
          placeholder="Current password"
          value={currentPass}
          onChange={(e) => setCurrentPass(e.target.value)}
        />

        <input
          type="password"
          placeholder="New password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />

        <button onClick={handleChangePassword}>
          Update Password
        </button>
      </div>

      {/* NOTIFICATIONS */}
      <div className="card">
        <h3>Notifications</h3>

        <div className="toggle-row">
          <span>Email Notifications</span>
          <div
            className={`toggle ${emailNotif ? "active" : ""}`}
            onClick={() => setEmailNotif(!emailNotif)}
          />
        </div>

        <div className="toggle-row">
          <span>Push Notifications</span>
          <div
            className={`toggle ${pushNotif ? "active" : ""}`}
            onClick={() => setPushNotif(!pushNotif)}
          />
        </div>
      </div>

      {/* DANGER */}
      <div className="card danger">
        <h3>Danger Zone</h3>

       <button
  className="danger-btn"
  onClick={() => setShowDeleteModal(true)}
>
  Delete Account
</button>
<Modal
  open={showDeleteModal}
  title="Delete Account"
  description="This action is permanent. You will lose all your data."
  confirmText="Yes, Delete"
  cancelText="Cancel"
  danger
  onCancel={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
/>
      </div>

      {/* CSS */}
      <style>{`
        .settings{max-width:700px;margin:20px auto;padding:16px}
        .settings h2{font-size:20px;font-weight:800;margin-bottom:16px}
        .card{background:#fff;border-radius:14px;padding:16px;margin-bottom:16px;border:1px solid #eee;box-shadow:0 6px 18px rgba(0,0,0,0.05)}
        .card h3{margin-bottom:12px;font-size:15px}
        .card input{width:100%;padding:10px;margin-bottom:10px;border-radius:8px;border:1px solid #ddd;font-size:14px}
        .card button{width:100%;padding:10px;border:none;border-radius:8px;background:#28a745;color:#fff;font-weight:600;cursor:pointer}
        .avatar{width:60px;height:60px;border-radius:50%;background:#28a745;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;margin-bottom:12px}
        .toggle-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
        .toggle{width:45px;height:24px;background:#ccc;border-radius:20px;position:relative;cursor:pointer;transition:.3s}
        .toggle::after{content:"";position:absolute;width:18px;height:18px;background:#fff;border-radius:50%;top:3px;left:3px;transition:.3s}
        .toggle.active{background:#28a745}
        .toggle.active::after{left:24px}
        .danger{background:#fff5f5;border:1px solid #f5c6cb}
        .danger-btn{background:#dc3545!important}
        .center{text-align:center;margin-top:40px}
      `}</style>
    </div>
  );
};

export default AccountSettings;