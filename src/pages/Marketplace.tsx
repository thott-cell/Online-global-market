// src/pages/Marketplace.tsx
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

const Marketplace = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "products"), where("status", "==", "approved"));
    const unsubscribe = onSnapshot(q, snapshot => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Products</h2>
      {products.map(p => (
        <div key={p.id}>
          <h3>{p.title}</h3>
          <p>Price: ₦{p.price}</p>
          <p>{p.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Marketplace;