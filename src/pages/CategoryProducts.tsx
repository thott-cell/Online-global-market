import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";

interface Props {
  category: string;
}

const CategoryProducts = ({ category }: Props) => {

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {

    const loadProducts = async () => {

      const q = query(
        collection(db, "products"),
        where("category", "==", category)
      );

      const snap = await getDocs(q);

      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProducts(items);

    };

    loadProducts();

  }, [category]);

  return (

    <div>

      <h2>{category}</h2>

      <div className="product-grid">

        {products.map((p) => (

          <ProductCard key={p.id} {...p} />

        ))}

      </div>

    </div>

  );
};

export default CategoryProducts;