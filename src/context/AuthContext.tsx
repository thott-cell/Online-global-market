// src/context/AuthContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Role = "buyer" | "seller" | "admin" | null;

interface AuthContextType {
  user: User | null;
  role: Role;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedRole = docSnap.data().role as Role;
          setRole(fetchedRole || "buyer");
        } else {
          // 🔥 If no document exists, create one automatically
          await setDoc(docRef, {
            role: "buyer",
            email: u.email,
            createdAt: new Date(),
          });

          setRole("buyer");
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, password);
    setLoading(false);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);