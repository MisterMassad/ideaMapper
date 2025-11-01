// src/components/LimitModal.jsx
import React, { useEffect } from "react";
import "../styles/Dashboard.css"; 

export default function LimitModal({ open, kind, limit, used, onClose, onUpgrade }) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="limit-title">
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="limit-title">Limit reached</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div style={{ lineHeight: 1.5 }}>
          {kind === "map" ? (
            <>
              <p>
                Hey! You’ve reached your <strong>map limit</strong>.
              </p>
              <p style={{ marginTop: 6 }}>
                You currently have <strong>{used}</strong> of <strong>{limit}</strong> maps.
              </p>
            </>
          ) : (
            <>
              <p>
                Hey! You’ve reached your <strong>duplicate limit</strong>.
              </p>
              <p style={{ marginTop: 6 }}>
                You’ve used <strong>{used}</strong> of <strong>{limit}</strong> duplicates.
              </p>
            </>
          )}

          <p style={{ marginTop: 10 }}>
            You can <strong>delete</strong> some maps to free up space, or{" "}
            <strong>upgrade</strong> your plan to raise the limit.
          </p>
        </div>

        <div className="modal-buttons" style={{ marginTop: 14 }}>
          <button className="card-button" onClick={onClose}>
            Okay
          </button>
          <button className="card-button" onClick={onUpgrade}>
            💎 Upgrade Now!
          </button>
        </div>
      </div>
    </div>
  );
}
