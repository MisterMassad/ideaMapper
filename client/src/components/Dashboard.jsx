// Dashboard.jsx (Supabase version)
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import MapEditor from "./MapEditor"; // TODO: migrate MapEditor to Supabase next
import "../styles/Dashboard.css";
import AvatarPromptModal from "./AvatarPromptModal";

const Dashboard = () => {
  const navigate = useNavigate();

  // Maps state
  const [maps, setMaps] = useState([]);
  const [allMaps, setAllMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(null);

  // UI state (create/join/delete)
  const [newMapName, setNewMapName] = useState("");
  const [joinMapName, setJoinMapName] = useState("");
  const [joinMapId, setJoinMapId] = useState("");
  const [isCreateInputVisible, setIsCreateInputVisible] = useState(false);
  const [isJoinInputVisible, setIsJoinInputVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isVisible: false, mapId: null, mapName: "" });

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Profile state
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [joinSuccessMessage, setJoinSuccessMessage] = useState("");

  // Auth user
  const [currentUser, setCurrentUser] = useState(null);
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(false);
  const DEFAULT_AVATAR_URL =
    "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/avatars/defaults/default.png";


  // ------------- helpers -------------
  const getUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }, []);

  const isUsernameTaken = useCallback(async (name, myId) => {
    let q = supabase.from("profiles").select("id").eq("username", name).limit(1);
    if (myId) q = q.neq("id", myId);
    const { data, error } = await q;
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }, []);





  const loadProfile = useCallback(async (uid) => {
    try {
      if (!uid || typeof uid !== "string" || uid.length < 10) {
        const { data: authData } = await supabase.auth.getUser();
        uid = authData?.user?.id;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("email, username, profile_picture")
        .eq("id", uid)
        .single();

      if (error) throw error;

      setEmail(data?.email || "");
      setUsername(data?.username || "");
      setProfilePicture(data?.profile_picture || "");
    } catch (e) {
      // safe fallback so the panel still shows something
      const { data: authData } = await supabase.auth.getUser();
      const u = authData?.user;
      setEmail(u?.email || "");
      setUsername(u?.user_metadata?.username || u?.email?.split("@")[0] || "");
      setProfilePicture(
        u?.user_metadata?.profile_picture || "https://example.com/default-profile-picture.png"
      );
    }
  }, []);

  // const loadProfile = useCallback(async (uid) => {
  //   const { data, error } = await supabase
  //     .from("profiles")
  //     .select("email, username, profile_picture")
  //     .eq("id", uid)
  //     .single();
  //   if (error) throw error;
  //   setEmail(data.email || "");
  //   setUsername(data.username || "");
  //   setProfilePicture(data.profile_picture || "");
  // }, []);





  const refreshMaps = useCallback(async (uid) => {
    // maps where the user is a participant
    const { data, error } = await supabase
      .from("map_participants")
      .select("map:maps(*)")
      .eq("user_id", uid);
    if (error) throw error;

    const list = (data || []).map((r) => r.map).filter(Boolean);
    // Keep a stable shape { id, name, ... }
    setAllMaps(list);
    // Apply current search term
    if (searchTerm.trim() === "") {
      setMaps(list);
    } else {
      const term = searchTerm.toLowerCase();
      setMaps(list.filter((m) => (m.name || "").toLowerCase().includes(term)));
    }
  }, [searchTerm]);

  // ------------- effects -------------
  useEffect(() => {
    (async () => {
      try {
        const user = await getUser();
        if (!user) {
          navigate("/"); // not logged in
          return;
        }
        setCurrentUser(user);
        await loadProfile(user.id);
        await refreshMaps(user.id);

        // ---- Onboarding popup for avatar ----
        // Ensure that the profile row exists and check onboarding_seen
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("id, onboarding_seen, profile_picture")
          .eq("id", user.id)
          .maybeSingle();
        if (profErr) throw profErr;

        if (!prof) {
          // If there's no row, create it and show prompt
          await supabase.from("profiles").insert({ id: user.id });
          setShowAvatarPrompt(true);
        } else if (prof.onboarding_seen === false) {
          setShowAvatarPrompt(true);
        }


        // Realtime: if user’s participation or map changes, refresh
        const ch = supabase
          .channel("dashboard-" + user.id)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "map_participants", filter: `user_id=eq.${user.id}` },
            () => refreshMaps(user.id)
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "maps" },
            () => refreshMaps(user.id)
          )
          .subscribe();

        return () => {
          supabase.removeChannel(ch);
        };
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to initialize dashboard.");
      }
    })();
  }, [getUser, loadProfile, refreshMaps, navigate]);

  // Keep search reactive
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    if (!term) setMaps(allMaps);
    else setMaps(allMaps.filter((m) => (m.name || "").toLowerCase().includes(term)));
  }, [searchTerm, allMaps]);

  // ------------- profile handlers -------------
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

  const handleUsernameChange = async (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    try {
      if (!currentUser) return;
      // optimistic UI, then persist
      // ensure unique if you want real-time checks:
      const taken = await isUsernameTaken(newUsername.trim(), currentUser.id);
      if (taken) {
        setError("Username is already taken. Please choose another one.");
        return;
      }
      const { error: upErr } = await supabase
        .from("profiles")
        .update({ username: newUsername })
        .eq("id", currentUser.id);
      if (upErr) throw upErr;
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (!currentUser) return;
      // Re-check uniqueness on submit
      const clean = (username || "").trim();
      if (!clean) {
        setError("Username cannot be empty.");
        return;
      }
      const taken = await isUsernameTaken(clean, currentUser.id);
      if (taken) {
        setError("Username is already taken. Please choose another one.");
        return;
      }

      const { error: upErr } = await supabase
        .from("profiles")
        .update({ username: clean, profile_picture: profilePicture })
        .eq("id", currentUser.id);
      if (upErr) throw upErr;

      setShowProfileDetails(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // ------------- maps handlers -------------
  // Replace your existing createNewMap with this:
  const createNewMap = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data: authRes } = await supabase.auth.getUser();
      const user = authRes?.user;
      if (!user) throw new Error("You must be logged in.");

      const name = (newMapName || "").trim();
      if (!name) {
        setError("Please enter a map name.");
        return;
      }

      // Use server-side RPC to avoid RLS issues
      const { data: newId, error: rpcErr } = await supabase.rpc("create_map", {
        p_name: name,
        p_description: "",
      });
      if (rpcErr) {
        console.error("create_map RPC failed:", rpcErr);
        setError(rpcErr.message || "Failed to create map.");
        return;
      }

      setNewMapName("");
      setIsCreateInputVisible(false);
      setSelectedMapId(newId); // open MapEditor

    } catch (err) {
      console.error("Unexpected createNewMap error:", err);
      setError(err.message || "Failed to create map.");
    }
  };



  const handleDeleteClick = (mapId, mapName) => {
    setConfirmDelete({ isVisible: true, mapId, mapName });
  };

  const confirmDeleteMap = async () => {
    const { mapId } = confirmDelete;
    if (!mapId) return;
    try {
      const { error: delErr } = await supabase.from("maps").delete().eq("id", mapId);
      if (delErr) throw delErr;
      setMaps((prev) => prev.filter((m) => m.id !== mapId));
      setConfirmDelete({ isVisible: false, mapId: null, mapName: "" });
    } catch (err) {
      setError(err.message || "Failed to delete map.");
    }
  };

  const cancelDelete = () => {
    setConfirmDelete({ isVisible: false, mapId: null, mapName: "" });
  };

  const joinMap = async (e) => {
    e.preventDefault();
    setJoinSuccessMessage("");
    setError("");

    try {
      // ensure auth
      let me = currentUser;
      if (!me) {
        const { data } = await supabase.auth.getUser();
        me = data?.user;
      }
      if (!me) throw new Error("You must be logged in.");

      const id = (joinMapId || "").trim();
      const name = (joinMapName || "").trim();
      if (!id || !name) {
        setError("Please provide both the map name and ID.");
        return;
      }

      // 1) verify (id, name)
      const { data: ok, error: rpcErr } = await supabase.rpc("verify_map_name", {
        p_map_id: id,
        p_name: name,
      });
      if (rpcErr) {
        console.error("verify_map_name RPC error:", rpcErr);
        setError("Couldn't verify the map. Please try again.");
        return;
      }
      if (!ok) {
        setError("The map name does not match the provided ID.");
        return;
      }

      // 2) idempotent participation (avoid duplicate PK)
      const { error: upErr } = await supabase
        .from("map_participants")
        .upsert(
          { map_id: id, user_id: me.id, role: "editor" },
          { onConflict: "map_id,user_id", ignoreDuplicates: true }
        );
      if (upErr) {
        console.error("Join map upsert error:", upErr);
        setError("Couldn't join this map. Ask the owner to invite you.");
        return;
      }

      // 3) clean UI and open the map
      setJoinMapName("");
      setJoinMapId("");
      setIsJoinInputVisible(false);
      setSelectedMapId(id); // <--- open editor immediately
    } catch (err) {
      console.error("joinMap error:", err);
      setError(err.message || "An error occurred while trying to join the map.");
    }
  };



  const cancelJoinMap = () => {
    setJoinMapName("");
    setJoinMapId("");
    setIsJoinInputVisible(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ------------- render -------------
  if (selectedMapId) {
    // NOTE: MapEditor is not migrated yet; this will break until we convert it.
    return <MapEditor mapId={selectedMapId} />;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="user-info">
            <img src={profilePicture} alt="Profile" className="profile-picture" />
            <h2 style={{ color: "#2C5F2D" }}>Hi {username || "User"} ;)</h2>
            <button className="details-button" onClick={() => setShowProfileDetails(true)}>
              User Details
            </button>
          </div>
        </div>
        <div className="header-right">
          <button className="card-button logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </header>

      {showProfileDetails && (
        <div className="modal" tabIndex={0}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Your Profile</h2>
              <button className="close-button" onClick={() => setShowProfileDetails(false)}>
                &times;
              </button>
            </div>
            <form className="profile-form" onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" value={email} disabled className="form-input" />
              </div>
              <div className="form-group">
                <label>Username:</label>
                <input type="text" value={username} onChange={handleUsernameChange} className="form-input" />
              </div>
              <div className="form-group">
                <label>Profile Picture:</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="form-input" />
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="modal-buttons" style={{ marginTop: 12 }}>
                <button type="submit" className="card-button">Save</button>
                <button type="button" className="card-button" onClick={() => setShowProfileDetails(false)}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="button-container">
        {!isCreateInputVisible && (
          <button className="card-button" onClick={() => setIsCreateInputVisible(true)}>
            Create New Map
          </button>
        )}

        {!isJoinInputVisible && (
          <button className="card-button" onClick={() => setIsJoinInputVisible(true)}>
            Join Map
          </button>
        )}
      </div>

      {isCreateInputVisible && (
        <div className="modal">
          <div className="modal-content">
            <form onSubmit={createNewMap} className="new-map-form">
              <input
                type="text"
                value={newMapName}
                onChange={(e) => setNewMapName(e.target.value)}
                placeholder="Enter map name"
                className="new-map-input"
              />
              <div className="modal-buttons">
                <button type="submit" className="card-button">Create Map</button>
                <button type="button" onClick={() => setIsCreateInputVisible(false)} className="card-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isJoinInputVisible && (
        <div className="modal">
          <div className="modal-content">
            <form onSubmit={joinMap} className="new-map-form">
              <input
                type="text"
                value={joinMapName}
                onChange={(e) => setJoinMapName(e.target.value)}
                placeholder="Enter map name"
                className="new-map-input"
              />
              <input
                type="text"
                value={joinMapId}
                onChange={(e) => setJoinMapId(e.target.value)}
                placeholder="Enter map ID"
                className="new-map-input"
              />

              {joinSuccessMessage && (
                <div className="modal">
                  <div className="modal-content">
                    <p>{joinSuccessMessage}</p>
                    <button className="close-button" onClick={() => setJoinSuccessMessage("")}>
                      Close
                    </button>
                  </div>
                </div>
              )}
              {error && <p className="error-text">{error}</p>}

              <div className="modal-buttons">
                <button type="submit" className="card-button">Join Map</button>
                <button type="button" onClick={() => setIsJoinInputVisible(false)} className="card-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete.isVisible && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to delete the "{confirmDelete.mapName}" map?</p>
            <div className="modal-buttons">
              <button className="card-button" onClick={confirmDeleteMap}>Yes</button>
              <button className="card-button" onClick={cancelDelete}>No</button>
            </div>
          </div>
        </div>
      )}

      <h3 style={{ color: "#2C5F2D" }}>Your Learning Space:</h3>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search learning space..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="maps-grid">
        {maps.map((m) => (
          <div key={m.id} className="map-tile">
            <button className="card-button" onClick={() => setSelectedMapId(m.id)}>
              {m.name || m.id}
            </button>
            <button className="delete-button" onClick={() => handleDeleteClick(m.id, m.name)}>
              <div className="trash-icon">
                <div className="lid"></div>
                <div className="bin">
                  <div className="face"></div>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* One-time onboarding popup */}
      <AvatarPromptModal
        isOpen={showAvatarPrompt}
        userId={currentUser?.id}
        defaultAvatarUrl={DEFAULT_AVATAR_URL}
        onClose={(res) => {
          setShowAvatarPrompt(false);
          if (res?.updated) {
            if (res.url) setProfilePicture(res.url);
            else if (res.skipped) setProfilePicture(DEFAULT_AVATAR_URL);
          }
        }}
      />

    </div>
  );
};

export default Dashboard;
