// Dashboard.jsx (Supabase version)
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import MapEditor from "./MapEditor"; // TODO: migrate MapEditor to Supabase next
import "../styles/Dashboard.css";
import AvatarPromptModal from "./AvatarPromptModal";
import ActionMenu from "./ActionMenu";

import Sidebar from "./Sidebar";
import MapCard from "./MapCard";

  // Helper to calculate the payload
  const bytes = (obj) => new TextEncoder().encode(JSON.stringify(obj ?? {})).length;

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
  const [owners, setOwners] = useState({});

  // Auth user
  const [currentUser, setCurrentUser] = useState(null);
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(false);
  const DEFAULT_AVATAR_URL =
    "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/avatars/defaults/default.png";

  // Action targets
  const [renameTarget, setRenameTarget] = useState(null);        // { id, name }
  const [editDescTarget, setEditDescTarget] = useState(null);    // { id, description }
  const [dupTarget, setDupTarget] = useState(null);              // id

  // Controlled inputs for the two forms
  const [renameValue, setRenameValue] = useState("");
  const [descValue, setDescValue] = useState("");

  // Optional: light feedback
  const [saving, setSaving] = useState(false);


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





const fetchOwners = useCallback(async (list) => {
  try {
    const ownerIds = Array.from(
      new Set((list || []).map(m => m.owner_id).filter(Boolean))
    );
    if (ownerIds.length === 0) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", ownerIds);

    if (error) throw error;

    const map = {};
    (data || []).forEach(r => { map[r.id] = r.username || "User"; });
    setOwners(map);
  } catch (e) {
    console.error("fetchOwners error:", e);
  }
}, []);

const refreshMaps = useCallback(async (uid) => {
  console.time("maps.refresh");
  const t0 = performance.now();

  // Pull only lightweight fields from the joined maps row
  const baseSelect =
    "map:maps(id,name,description,last_edited,owner_id)";

  // First try: order by last_edited (your schema)
  let resp = await supabase
    .from("map_participants")
    .select(baseSelect)
    .eq("user_id", uid)
    // If your supabase-js version supports it, keep the foreignTable option.
    // If not, we'll fallback below.
    .order("last_edited", { ascending: false, foreignTable: "maps" })
    .limit(120, { foreignTable: "maps" });

  // If that errored (e.g., older client doesn’t support foreignTable),
  // try again without order to keep things working.
  if (resp.error) {
    console.warn("refreshMaps fallback (no order):", resp.error.message);
    resp = await supabase
      .from("map_participants")
      .select(baseSelect)
      .eq("user_id", uid);
  }

  console.timeEnd("maps.refresh");

  if (resp.error) {
    console.error("maps.refresh error:", resp.error);
    setAllMaps([]);
    setMaps([]);
    return;
  }

  const list = (resp.data || []).map((r) => r.map).filter(Boolean);

  const size = bytes(list);
  const t1 = performance.now();
  console.log(
    `maps.refresh rows=${list.length}, bytes≈${size}, ms=${(t1 - t0).toFixed(1)}`
  );

  setAllMaps(list);
  await fetchOwners(list);

  if (searchTerm.trim() === "") {
    setMaps(list);
  } else {
    const term = searchTerm.toLowerCase();
    setMaps(list.filter((m) => (m.name || "").toLowerCase().includes(term)));
  }
}, [searchTerm, fetchOwners]);




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

  // Rename from the card menu
const handleRename = async (map) => {
  const current = (map?.name || "").trim();
  const next = window.prompt("New name:", current);
  if (next == null) return; // cancelled
  const newName = next.trim();
  if (!newName || newName === current) return;

  // optimistic UI
  setMaps((prev) => prev.map(m => m.id === map.id ? { ...m, name: newName } : m));

  const { data, error } = await supabase
    .from("maps")
    .update({ name: newName, last_edited: new Date().toISOString() }) // ← use last_edited
    .eq("id", map.id)
    .select("id, name, description, last_edited")                      // ← select last_edited
    .single();

  if (error) {
    console.error("Rename failed:", error);
    // rollback
    setMaps((prev) => prev.map(m => m.id === map.id ? { ...m, name: current } : m));
    alert("Couldn’t rename map. Please try again.");
  } else if (data) {
    setMaps((prev) => prev.map(m => m.id === map.id ? { ...m, ...data } : m));
  }
};

// Edit description from the card menu
const handleEditDescription = async (map) => {
  const current = (map?.description || "").trim();
  const next = window.prompt("New description:", current);
  if (next == null) return; // cancelled
  const newDesc = next.trim();
  if (newDesc === current) return;

  // optimistic UI
  setMaps((prev) => prev.map(m => m.id === map.id ? { ...m, description: newDesc } : m));

  const { data, error } = await supabase
    .from("maps")
    .update({ description: newDesc, last_edited: new Date().toISOString() }) // ← use last_edited
    .eq("id", map.id)
    .select("id, name, description, last_edited")                              // ← select last_edited
    .single();

  if (error) {
    console.error("Update description failed:", error);
    // rollback
    setMaps((prev) => prev.map(m => m.id === map.id ? { ...m, description: current } : m));
    alert("Couldn’t update description. Please try again.");
  } else if (data) {
    setMaps((prev) => prev.map(m => m.id === map.id ? { ...m, ...data } : m));
  }
};
const handleDuplicate = async (map) => {
  try {
    if (!map?.id) return;

    // 1) Pull the source fields 
    const { data: src, error: selErr } = await supabase
      .from("maps")
      .select("name, description, nodes, edges, node_notes, node_data")
      .eq("id", map.id)
      .single();

    if (selErr) {
      console.error("Duplicate: select source failed", selErr);
      alert("Couldn’t read the map to duplicate.");
      return;
    }

    // 2) Create a new map 
    const copyName = (src?.name ? `${src.name} (copy)` : "Untitled (copy)");
    const { data: newId, error: rpcErr } = await supabase.rpc("create_map", {
      p_name: copyName,
      p_description: src?.description || "",
    });
    if (rpcErr || !newId) {
      console.error("Duplicate: create_map RPC failed", rpcErr);
      alert("Couldn’t create the duplicated map.");
      return;
    }

    // 3) Update the new map 
    const payload = {
      nodes: Array.isArray(src?.nodes) ? src.nodes : [],
      edges: Array.isArray(src?.edges) ? src.edges : [],
      node_notes: src?.node_notes ?? {},
      node_data: src?.node_data ?? {},
      last_edited: new Date().toISOString(),
    };

    const { error: upErr } = await supabase
      .from("maps")
      .update(payload)
      .eq("id", newId);

    if (upErr) {
      console.error("Duplicate: update new map failed", upErr);
      alert("Map created but content copy failed.");
      // srefresh; user at least has an empty copy
    }

    // 4) Refresh list 
    const { data: authRes } = await supabase.auth.getUser();
    const me = authRes?.user;
    if (me?.id) await refreshMaps(me.id);

  } catch (e) {
    console.error("Duplicate unexpected error:", e);
    alert("Something went wrong while duplicating.");
  }
};


  // async function renameMap(id, newName) {
  //   if (!id || !newName?.trim()) return;
  //   setSaving(true);
  //   const { error } = await supabase
  //     .from("maps")
  //     .update({ name: newName.trim() })
  //     .eq("id", id);

  //   setSaving(false);
  //   if (error) {
  //     console.error(error);
  //     setError?.("Failed to rename the map. Please try again.");
  //     return;
  //   }
  //   // Optimistic UI update
  //   setMaps((prev) => prev.map((m) => (m.id === id ? { ...m, name: newName.trim() } : m)));
  // }

  // async function updateMapDescription(id, newDesc) {
  //   if (!id) return;
  //   setSaving(true);
  //   const { error } = await supabase
  //     .from("maps")
  //     .update({ description: (newDesc ?? "").trim() })
  //     .eq("id", id);

  //   setSaving(false);
  //   if (error) {
  //     console.error(error);
  //     setError?.("Failed to update the description.");
  //     return;
  //   }
  //   // Optimistic UI update
  //   setMaps((prev) =>
  //     prev.map((m) => (m.id === id ? { ...m, description: (newDesc ?? "").trim() } : m))
  //   );
  // }

  // If you already have confirmDeleteMap wired to Supabase, keep using it.
  // If you want a direct delete without the confirm modal, you can use this:
  async function hardDeleteMap(id) {
    if (!id) return;
    setSaving(true);
    const { error } = await supabase.from("maps").delete().eq("id", id);
    setSaving(false);
    if (error) {
      console.error(error);
      setError?.("Failed to delete the map.");
      return;
    }
    setMaps((prev) => prev.filter((m) => m.id !== id));
  }


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
      <div className="dashboard-layout"> {/* New flex container */}
        <Sidebar
          active="maps"
          user={{ username, email, profilePicture }}
          onNav={(key) => { if (key === "settings") setShowProfileDetails(true); }}
          onSettings={() => setShowProfileDetails(true)}
          onSignOut={handleLogout}
        />
        <div className="content-area">
          <header className="dashboard-header">
            <div className="header-left">
              <div className="user-info">
                <img src={profilePicture} alt="Profile" className="profile-picture" />
                <h2 className="user-greeting">Hi {username || "User"} ;)</h2>
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

          <h3 className="learning-space-title">Your Learning Space:</h3>

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
              <MapCard
                key={m.id}
                map={m}
                ownerName={owners[m.owner_id]}   
                onOpen={(id) => setSelectedMapId(id)}
                onRename={handleRename}
                onEditDescription={handleEditDescription}
                onDuplicate={(map) => handleDuplicate(map)} 
                onDelete={(map) => handleDeleteClick(map.id, map.name)}
              />
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
      </div>
    </div>
  );
};

export default Dashboard;
