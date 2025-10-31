// src/components/MapCard.jsx
import React, { useState, useRef, useEffect } from "react";
import "../styles/MapCard.css";

export default function MapCard({
  map,
  onOpen,
  onRename,
  onEditDescription,
  onDuplicate,
  onDelete,
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (openMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [openMenu]);

  const title = map.name || "Untitled";
  const desc = map.description || "";
  const updated = map.last_edited ? new Date(map.last_edited).toLocaleDateString() : null;


  return (
    <article className="mc" aria-label={`${title} card`}>
      {/* Clickable thumbnail */}
      <button className="mc__thumb" onClick={() => onOpen(map.id)} />

      {/* Body */}
      <div className="mc__body">
        <div className="mc__top">
          <div className="mc__title" title={title}>{title}</div>
          <div className="mc__actions">
            <button
              className="mc__open"
              onClick={() => onOpen(map.id)}
              aria-label="Open"
              title="Open"
            >
              Open
            </button>
            <button
              className="mc__dots"
              aria-label="Menu"
              title="More"
              onClick={() => setOpenMenu((v) => !v)}
            >
              ⋯
            </button>
          </div>
        </div>

        <div className="mc__desc" title={desc}>
          {desc || "No description yet."}
        </div>
        {updated && <div className="mc__meta">Modified {updated}</div>}
      </div>

      {openMenu && (
        <div className="mc__menu" ref={menuRef} role="menu">
          <button role="menuitem" onClick={() => { setOpenMenu(false); onRename(map); }}>
            Rename…
          </button>
          <button role="menuitem" onClick={() => { setOpenMenu(false); onEditDescription(map); }}>
            Edit description…
          </button>
          <button role="menuitem" onClick={() => { setOpenMenu(false); onDuplicate(map); }}>
            Duplicate
          </button>
          <button
            role="menuitem"
            className="is-danger"
            onClick={() => { setOpenMenu(false); onDelete(map); }}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
