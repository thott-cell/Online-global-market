import React from "react";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

const Modal = ({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
}: ModalProps) => {
  if (!open) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h3 style={styles.title}>{title}</h3>

        {description && (
          <p style={styles.desc}>{description}</p>
        )}

        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            {cancelText}
          </button>

          <button
            style={{
              ...styles.confirmBtn,
              background: danger ? "#dc3545" : "#28a745",
            }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: "90%",
    maxWidth: 380,
    background: "#fff",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    color: "black",
  },
  confirmBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default Modal;