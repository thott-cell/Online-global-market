// src/pages/OrderSuccess.tsx
import { useEffect } from "react";

interface OrderSuccessProps {
  setCurrentPage: (page: string) => void;
}

const OrderSuccess = ({ setCurrentPage }: OrderSuccessProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage("orders"); // redirect to orders after animation
    }, 2500); // 2.5 seconds animation

    return () => clearTimeout(timer);
  }, [setCurrentPage]);
  

  return (
    <div style={styles.container}>
      <div style={styles.mask}>
        <svg viewBox="0 0 52 52" style={styles.svg}>
          <circle className="circle" cx="26" cy="26" r="25" fill="none" />
          <path className="check" fill="none" d="M14 27l7 7 16-16" />
        </svg>
        <h1 style={styles.text}>Order Placed Successfully!</h1>
      </div>

      {/* Keyframe animations */}
      <style>
        {`
          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes dash {
            0% { stroke-dashoffset: 166; }
            100% { stroke-dashoffset: 0; }
          }

          @keyframes dash-check {
            0% { stroke-dashoffset: 48; }
            100% { stroke-dashoffset: 0; }
          }

          .circle {
            stroke: #28a745;
            stroke-width: 4;
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            transform-origin: 50% 50%;
            animation: dash 0.6s ease-out forwards;
          }

          .check {
            stroke: #28a745;
            stroke-width: 4;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: dash-check 0.3s 0.6s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "rgba(0,255,0,0.1)",
  },
  mask: {
    background: "#fff",
    padding: 50,
    borderRadius: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
    animation: "popIn 0.5s ease-out forwards",
  },
  svg: { width: 100, height: 100, margin: "0 auto" },
  text: {
    marginTop: 20,
    fontSize: 24,
    color: "#28a745",
    fontWeight: 700,
  },
};

export default OrderSuccess;