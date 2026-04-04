// src/components/BackButton.tsx
import { type ReactNode } from "react";

interface BackButtonProps {
  onBack: () => void;
  children?: ReactNode; // allow page name next to arrow
}

export default function BackButton({ onBack, children }: BackButtonProps) {
  return (
    <div
      onClick={onBack}
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