// // src/components/Menu.tsx
// import { useEffect, useState } from "react";
// import { db } from "../firebase/config";
// import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
// import ProductCard from "./ProductCard";
// import ProductSkeleton from "./ProductSkeleton";

// interface Product {
// id: string;
// title: string;
// description?: string;
// price: number;
// discount?: number;
// sellerId?: string;
// imageUrl?: string;
// }

// // Props for Menu: optional onSelectProduct callback
// interface MenuProps {
// onSelectProduct?: (id: string) => void;
// }

// const Menu = ({ onSelectProduct }: MenuProps) => {
// const [products, setProducts] = useState<Product[]>([]);
// const [loading, setLoading] = useState(true);

// useEffect(() => {
// const productsRef = collection(db, "products");
// const q = query(
// productsRef,
// where("status", "==", "approved"),
// orderBy("createdAt", "desc")
// );

// const unsub = onSnapshot(q, (snapshot) => {  
//   const items: Product[] = snapshot.docs.map((doc) => ({  
//     id: doc.id,  
//     ...doc.data(),  
//   })) as Product[];  
//   setProducts(items);  
//   setLoading(false);  
// });  

// return () => unsub();

// }, []);

// if (loading)
//   return (
//     <div className="product-grid">
//       {[...Array(8)].map((_, i) => (
//         <ProductSkeleton key={i} />
//       ))}
//     </div>
//   );
// if (products.length === 0) return <p style={{ textAlign: "center", marginTop: 30 }}>No products available.</p>;

// return (
// <div style={{ maxWidth: 1400, margin: "30px auto", padding: 16 }}>
// <h2 style={{ marginBottom: 20 }}>Menu</h2>
// <div className="product-grid">
// {products.map((product) => (
// <div
// key={product.id}
// style={{ cursor: onSelectProduct ? "pointer" : "default" }}
// onClick={() => onSelectProduct?.(product.id)}
// >
// <ProductCard  
// id={product.id}  
// title={product.title}  
// price={product.price}  
// imageUrl={product.imageUrl}  
// description={product.description}  
// sellerId={product.sellerId}  
// discount={product.discount}  
// />
// </div>
// ))}
// </div>
// </div>
// );
// };

// export default Menu;