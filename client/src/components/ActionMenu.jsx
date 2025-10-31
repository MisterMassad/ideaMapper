// ActionMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import "../styles/ActionMenu.css";



/**
 * Props:
 * - onRename()
 * - onEditDescription()
 * - onDuplicate()
 * - onTrash()
 * - align ("right" | "left") optional
 * - size ("sm" | "md") optional
 */
export default function ActionMenu({
  onRename,
  onEditDescription,
  onDuplicate,
  onTrash,
  align = "right",
  size = "sm",
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Close on click outside / Escape
  useEffect(() => {
    if (!open) return;

    function onDocClick(e) {
      if (!menuRef.current || !btnRef.current) return;
      if (
        !menuRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Basic keyboard nav inside the menu
  useEffect(() => {
    if (!open || !menuRef.current) return;
    const items = Array.from(menuRef.current.querySelectorAll("button[role='menuitem']"));
    const first = items[0];
    if (first) first.focus();

    function onKey(e) {
      const idx = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = items[(idx + 1) % items.length] || items[0];
        next?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = items[(idx - 1 + items.length) % items.length] || items[0];
        prev?.focus();
      }
    }
    menuRef.current.addEventListener("keydown", onKey);
    return () => menuRef.current?.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={`amenu ${size}`}>
      <button
        type="button"
        className="amenu__button"
        ref={btnRef}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="Open actions"
      >
        ⋯
      </button>

      {open && (
        <div
          className={`amenu__menu ${align === "left" ? "left" : "right"}`}
          ref={menuRef}
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            className="amenu__item"
            onClick={() => {
              setOpen(false);
              onRename?.();
            }}
          >
            Rename
          </button>
          <button
            type="button"
            role="menuitem"
            className="amenu__item"
            onClick={() => {
              setOpen(false);
              onEditDescription?.();
            }}
          >
            Edit description
          </button>
          <button
            type="button"
            role="menuitem"
            className="amenu__item"
            onClick={() => {
              setOpen(false);
              onDuplicate?.();
            }}
          >
            Duplicate (placeholder)
          </button>
          <div className="amenu__sep" />
          <button
            type="button"
            role="menuitem"
            className="amenu__item amenu__danger"
            onClick={() => {
              setOpen(false);
              onTrash?.();
            }}
          >
            Move to trash
          </button>
        </div>
      )}
    </div>
  );
}
