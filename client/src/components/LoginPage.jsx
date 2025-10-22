// LoginPage.jsx (Supabase version, safe username check)
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { supabase } from "../supabaseClient";
import "../styles/Login.css";

// Socket.IO connection
const socket = io("http://localhost:5000");

const LoginPage = ({ onLogin }) => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  // UI state
  const [isLogin, setIsLogin] = useState(true); // true=Login, false=Sign Up
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState("");

  const defaultProfilePicture =
    "https://example.com/default-profile-picture.png";

  useEffect(() => {
    socket.on("map_updated", (data) => {
      console.log("Map updated:", data);
    });
    return () => socket.off("map_updated");
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicture(reader.result); // base64 for now
      reader.readAsDataURL(file);
    } else {
      setError("Please upload a valid image file.");
    }
  };

  const handleSwitchMode = (mode) => {
    setError("");
    setIsLogin(mode);
    setShowReset(false);
  };

  // Helper: check if username is taken (NO empty-string UUID issue)
  const isUsernameTaken = async (name, myId) => {
    let query = supabase.from("profiles").select("id").eq("username", name).limit(1);
    if (myId) {
      query = query.neq("id", myId); // only exclude self if we have a real UUID
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const user = data.user;
      if (user?.email) {
        socket.emit("user_logged_in", { email: user.email });
      }

      onLogin && onLogin();
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  // SIGN UP
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // (1) Client-side username check
      const cleanUsername = (username || "").trim();
      if (!cleanUsername) {
        throw new Error("Please choose a username.");
      }
      const taken = await isUsernameTaken(cleanUsername);
      if (taken) {
        throw new Error("Username is already taken. Please choose another one.");
      }

      // (2) Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin, // adjust if you have a custom route
          data: { username: cleanUsername }, // optional user_metadata
        },
      });
      if (signUpError) throw signUpError;

      const user = data.user;

      // (3) If session exists (email confirmations OFF), upsert profile now
      if (data.session && user) {
        const { error: upsertErr } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          username: cleanUsername,
          profile_picture: profilePicture || defaultProfilePicture,
        });
        if (upsertErr) throw upsertErr;

        socket.emit("user_logged_in", { email: user.email });
        onLogin && onLogin();
        return;
      }

      // (4) If confirmations ON (no session yet), a profile row is auto-created by trigger.
      // User will complete profile update after first confirmed login.
      alert("Account created. Please check your inbox to confirm your email, then log in.");
      setIsLogin(true);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Sign up failed");
    }
  };

  // RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      alert("Password reset email sent!");
      setShowReset(false);
    } catch (err) {
      setError(err.message || "Reset failed");
    }
  };

  // ===== Password Reset View =====
  if (showReset) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>Reset Password</h2>
          <p className="subtitle">Enter your email to receive a reset link</p>

          <form onSubmit={handleResetPassword}>
            <label className="field floating">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
              />
              <span>Email</span>
            </label>

            {error && <p className="error-message shake">{error}</p>}

            <button type="submit" className="login-button">
              Send Reset Email
            </button>
          </form>

          <div className="links">
            <button className="linklike" onClick={() => setShowReset(false)}>
              Back to {isLogin ? "Login" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Login / Sign Up View =====
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>{isLogin ? "Welcome to IdeaMapper" : "Sign Up"}</h2>
        <p className="subtitle">
          {isLogin
            ? "Sign in to continue mapping ideas"
            : "Create your account to start mapping ideas"}
        </p>

        <form onSubmit={isLogin ? handleLogin : handleSignUp}>
          {!isLogin && (
            <label className="field floating">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder=" "
              />
              <span>Username</span>
            </label>
          )}

          <label className="field floating">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" "
            />
            <span>Email</span>
          </label>

          <label className="field floating">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
            />
            <span>Password</span>
          </label>

          {!isLogin && (
            <label className="field floating">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                placeholder=" "
              />
              <span>Profile Picture</span>
            </label>
          )}

          {error && <p className="error-message shake">{error}</p>}

          {/* Side-by-side buttons */}
          <div className="button-row">
            <button
              type="button"
              className="signup-button"
              onClick={() => handleSwitchMode(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Back to Login"}
            </button>

            <button type="submit" className="login-button">
              {isLogin ? "Login" : "Create Account"}
            </button>
          </div>
        </form>

        {/* Optional links under buttons */}
        {isLogin && (
          <div className="links">
            <button className="linklike" onClick={() => setShowReset(true)}>
              Forgot Password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
