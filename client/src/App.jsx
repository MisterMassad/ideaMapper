// App.jsx (Supabase version)
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import MapEditor from "./components/MapEditor"; // we'll migrate this next
import { useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";
import io from "socket.io-client";

// Setup Socket.IO client
const socket = io("http://localhost:5000");

const App = () => {
  const [session, setSession] = useState(null);

  // Supabase auth listener
  useEffect(() => {
    let mounted = true;

    // initial session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
    });

    // subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    // Socket.IO connection setup
    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);
    });
    socket.on("mapUpdate", (data) => {
      console.log("Map update received via socket:", data);
    });

    return () => {
      mounted = false;
      socket.off("connect");
      socket.off("mapUpdate");
      // unsubscribe from Supabase auth changes
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // If no Supabase session, show Login
  if (!session) {
    return <LoginPage onLogin={() => { /* session listener above will re-render */ }} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard Route */}
        <Route path="/" element={<Dashboard />} />
        {/* Map Editor Route */}
        <Route path="/map/:mapId" element={<MapEditorWithParams />} />
      </Routes>
    </BrowserRouter>
  );
};

// Map Editor with URL params
const MapEditorWithParams = () => {
  const { mapId } = useParams();
  return <MapEditor mapId={mapId} />;
};

// Optional: silence ResizeObserver loop error spam
const resizeObserverLoopErr = /ResizeObserver loop limit exceeded/;
const originalConsoleError = console.error;
console.error = (message, ...args) => {
  if (resizeObserverLoopErr.test(message)) return;
  originalConsoleError(message, ...args);
};

export default App;
