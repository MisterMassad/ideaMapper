// ResetPassword.jsx — dedicated reset page that works even if Supabase auto-signs in
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/Login.css";

// Parse tokens/type from URL hash if present
function parseHash() {
  if (!window.location.hash) return {};
  const params = new URLSearchParams(window.location.hash.slice(1));
  return {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
    type: params.get("type"), // "recovery" when coming from reset email
    error: params.get("error_description"),
  };
}

export default function ResetPassword() {
  const [stage, setStage] = useState("checking"); // checking | ready | saving | done | error
  const [msg, setMsg] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  // Ensure we have an authenticated session (from magic link or auto sign-in)
  useEffect(() => {
    (async () => {
      try {
        const { accessToken, refreshToken, type, error } = parseHash();
        if (error) throw new Error(error);

        // If tokens exist in hash, set the session explicitly
        if (accessToken && refreshToken) {
          const { error: setErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setErr) throw setErr;

          // Clean the hash (keep path/query only)
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }

        // Whether we just set it or Supabase auto-signed us in, make sure a session exists
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          setMsg("Recovery link is invalid or expired. Please request a new password reset email.");
          setStage("error");
          return;
        }

        setStage("ready");
      } catch (e) {
        setMsg(e.message || "Could not initialize password reset.");
        setStage("error");
      }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (pw1.length < 8) return setMsg("Password must be at least 8 characters.");
    if (pw1 !== pw2) return setMsg("Passwords don’t match.");

    setStage("saving");
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    if (error) {
      setMsg(error.message || "Failed to update password.");
      setStage("ready");
      return;
    }
    setStage("done");
  };

  if (stage === "checking") {
    return (
      <div className="login-container">
        <h1 className="app-title" data-text="Reset Password">Reset Password</h1>
        <div className="login-form"><p>Preparing password reset…</p></div>
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="login-container">
        <h1 className="app-title" data-text="Reset Password">Reset Password</h1>
        <div className="login-form">
          <h2>Something went wrong</h2>
          <p className="error-message">{msg}</p>
          <a className="linklike" href="/">Back to login</a>
        </div>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="login-container">
        <h1 className="app-title" data-text="Password updated">Password updated</h1>
        <div className="login-form">
          <h2>Password updated ✅</h2>
          <p>You can now sign in with your new password.</p>
          <a className="linklike" href="/">Go to login</a>
        </div>
      </div>
    );
  }

  // stage === "ready"
  return (
    <div className="login-container">
      <h1 className="app-title" data-text="Reset Password">Reset Password</h1>
      <div className="login-form">
        <h2>Choose a new password</h2>

        <form onSubmit={submit}>
          <label className="field floating">
            <input
              type="password"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              placeholder=" "
              autoComplete="new-password"
              required
            />
            <span>New password</span>
          </label>

          <label className="field floating">
            <input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              placeholder=" "
              autoComplete="new-password"
              required
            />
            <span>Confirm new password</span>
          </label>

          {msg && <p className="error-message">{msg}</p>}

          <div className="button-row">
            <button type="submit" className="login-button" disabled={stage === "saving"}>
              {stage === "saving" ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>

        <div className="links">
          <a className="linklike" href="/">Back to login</a>
        </div>
      </div>
    </div>
  );
}
