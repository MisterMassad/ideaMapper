import React, { useRef, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * Props:
 * - isOpen: boolean
 * - userId: string (auth.uid())
 * - defaultAvatarUrl: string (public URL)
 * - onClose: function({ updated: boolean, skipped?: boolean, url?: string })
 *
 * Notes:
 * - Uses a public storage bucket called "avatars".
 * - Visuals rely on your existing Dashboard/Login CSS:
 *   .modal, .modal-content, .modal-header, .modal-buttons, .card-button
 */

export default function AvatarPromptModal({
  isOpen,
  userId,
  defaultAvatarUrl,
  onClose,
}) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!isOpen) return null;

  const handleSkip = async () => {
    try {
      setBusy(true);
      setErr("");
      if (!userId) throw new Error("Missing user id.");

      const { error } = await supabase
        .from("profiles")
        .update({
          profile_picture: defaultAvatarUrl,
          onboarding_seen: true,
        })
        .eq("id", userId)
        .eq("onboarding_seen", false); // only set if not seen yet
      if (error) throw error;

      onClose?.({ updated: true, skipped: true });
    } catch (e) {
      setErr(e.message ?? "Failed to update profile.");
      setBusy(false);
    }
  };

  const handleUpload = async () => {
    try {
      setBusy(true);
      setErr("");
      if (!userId) throw new Error("Missing user id.");

      const file = fileRef.current?.files?.[0];
      if (!file) throw new Error("Please choose an image.");

      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error("Could not generate public URL.");

      const { error: updErr } = await supabase
        .from("profiles")
        .update({
          profile_picture: publicUrl,
          onboarding_seen: true,
        })
        .eq("id", userId)
        .eq("onboarding_seen", false);
      if (updErr) throw updErr;

      onClose?.({ updated: true, url: publicUrl });
    } catch (e) {
      setErr(e.message ?? "Upload failed.");
      setBusy(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Welcome! 🎉</h2>
          {/* X just closes without changing anything */}
          <button
            className="close-button"
            onClick={() => onClose?.({ updated: false })}
            aria-label="Close"
            type="button"
          >
            &times;
          </button>
        </div>

        <p style={{ marginTop: 0 }}>
          Oh hey, I see you signed up to organize your ideas — want to choose a
          profile picture now?
        </p>

        <div className="form-group">
          <label>Profile Picture</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="form-input"
          />
        </div>

        {err && <p className="error-text">{err}</p>}

        <div className="modal-buttons">
          <button
            type="button"
            disabled={busy}
            onClick={handleSkip}
            className="card-button"
          >
            Not now
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleUpload}
            className="card-button"
            style={{ background: "#0ea5e9", color: "white", border: "none" }}
          >
            {busy ? "Working..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
