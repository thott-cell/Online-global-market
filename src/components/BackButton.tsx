// src/components/BackButton.tsx
import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  onBack?: () => void; // optional; fallback to navigate(-1)
  children?: ReactNode; // page name next to arrow
}

export default function BackButton({ onBack, children }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // go back in history, fallback to home if no history
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/", { replace: true });
      }
    }
  };

  return (
    <div
      onClick={handleBack}
      style={{
        position: "fixed",
        top: "15px",
        left: "15px",
        fontSize: "18px",
        cursor: "pointer",
        fontWeight: "bold",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span>←</span>
      {children && <span>{children}</span>}
    </div>
  );
}