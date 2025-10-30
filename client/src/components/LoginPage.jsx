// LoginPage.jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { supabase } from "../supabaseClient";
import "../styles/Login.css";
import MindmapBackground from "./MindMapBackground";

// Socket.IO connection
const socket = io("http://localhost:5000");

const LoginPage = ({ onLogin }) => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  // const [profilePicture, setProfilePicture] = useState(null);

  // UI state
  const [isLogin, setIsLogin] = useState(true); // true=Login, false=Sign Up
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState("");

  // Rotating title
  const messages = ["IdeaMapper", "Your ideas are safe here!", "Map. Learn. Grow."];
  const resetMessages = ["Forgot your password?", "No worries!", "We got you covered!"];
  const [titleIndex, setTitleIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTitleIndex((i) => (i + 1) % messages.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);
  const title = messages[titleIndex];

  // const defaultProfilePicture = "https://example.com/default-profile-picture.png";

  useEffect(() => {
    socket.on("map_updated", (data) => {
      console.log("Map updated:", data);
    });
    return () => socket.off("map_updated");
  }, []);

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file && file.type.startsWith("image/")) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => setProfilePicture(reader.result);
  //     reader.readAsDataURL(file);
  //   } else {
  //     setError("Please upload a valid image file.");
  //   }
  // };

  const handleSwitchMode = (mode) => {
    setError("");
    setIsLogin(mode);
    setShowReset(false);
  };

  // Helper function to check if the username is taken or not. Usernames are unique.
  const isUsernameTaken = async (name, myId) => {
    let query = supabase.from("profiles").select("id").eq("username", name).limit(1);
    if (myId) query = query.neq("id", myId);
    const { data, error } = await query;
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  };

  // LOGIN (email + password), Google sign in will be added later.
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = data.user;
      if (user?.email) socket.emit("user_logged_in", { email: user.email });

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
      const cleanUsername = (username || "").trim(); // First of the all trim the username
      if (!cleanUsername) throw new Error("Please choose a username.");
      const taken = await isUsernameTaken(cleanUsername);
      if (taken) throw new Error("Username is already taken. Please choose another one.");

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin, // regular sign-up confirmation
          data: { username: cleanUsername },
        },
      });
      if (signUpError) throw signUpError;

      const user = data.user;

      if (data.session && user) {
        const { error: upsertErr } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          username: cleanUsername,
          // profile_picture will be set later after first login
        });

        if (upsertErr) throw upsertErr;

        socket.emit("user_logged_in", { email: user.email });
        onLogin && onLogin();
        return;
      }

      alert("Account created. Please check your inbox to confirm your email, then log in.");
      setIsLogin(true);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Sign up failed");
    }
  };

  // MAGIC LINK (one-time link)
  const handleMagicLink = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email to get a magic link.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Redirect back to your app (router/session listener will log them in)
          emailRedirectTo: `${window.location.origin}`,
        },
      });
      if (error) throw error;
      alert("Magic link sent! Check your inbox to log in instantly.");
    } catch (err) {
      setError(err.message || "Failed to send magic link.");
    }
  };

  // RESET PASSWORD (send email → /reset-password)
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

  // ===== Password Reset (request email) View =====
  if (showReset) {
    return (
      <div className="login-container">
        <MindmapBackground /> {/* Background component */}
        <h1
          className={`app-title rot-${titleIndex % 2}`}
          data-text={resetMessages[titleIndex % resetMessages.length]}
          aria-live="polite"
        >
          {resetMessages[titleIndex % resetMessages.length]}
        </h1>

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
                autoComplete="email"
                inputMode="email"
              />
              <span>Email</span>
            </label>

            {error && <p className="error-message shake" role="alert">{error}</p>}

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
      <MindmapBackground /> {/* Background component */}
      <h1 className={`app-title rot-${titleIndex % 2}`} data-text={title} aria-live="polite">
        {title}
      </h1>

      <div className="login-form">
        <h2>{isLogin ? "Welcome to IdeaMapper" : "Sign Up"}</h2>
        <p className="subtitle">
          {isLogin ? "Sign in to continue mapping ideas" : "Create your account to start mapping ideas"}
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
                autoComplete="username"
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
              autoComplete="email"
              inputMode="email"
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
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            <span>Password</span>
          </label>

          {/* {!isLogin && (
            <label className="field floating">
              <input type="file" accept="image/*" onChange={handleFileChange} placeholder=" " />
              <span>Profile Picture</span>
            </label>
          )} */}

          {error && <p className="error-message shake" role="alert">{error}</p>}

          <div className="button-row">
            <button type="button" className="signup-button" onClick={() => handleSwitchMode(!isLogin)}>
              {isLogin ? "Sign Up" : "Back to Login"}
            </button>

            <button type="submit" className="login-button">
              {isLogin ? "Login" : "Create Account"}
            </button>
          </div>
        </form>

        {isLogin && (
          <div className="links">
            <button className="linklike" onClick={() => setShowReset(true)}>
              Forgot Password?
            </button>
            {/* Magic Link trigger */}
            <button className="linklike" onClick={handleMagicLink} style={{ marginLeft: 12 }}>
              Get one-time login link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;