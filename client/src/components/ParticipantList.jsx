// ParticipantList.jsx (Supabase)
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const ParticipantList = ({ mapId, currentUserId }) => {
  const [participants, setParticipants] = useState([]);

  const refresh = async () => {
    try {
      const { data: mp, error: mpErr } = await supabase
        .from("map_participants")
        .select("user_id")
        .eq("map_id", mapId);
      if (mpErr) throw mpErr;

      const ids = (mp || []).map((r) => r.user_id);
      if (!ids.length) {
        setParticipants([]);
        return;
      }

      const { data: profs, error: profErr } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", ids);
      if (profErr) throw profErr;

      const { data: presence, error: presErr } = await supabase
        .from("map_presence")
        .select("user_id, online")
        .eq("map_id", mapId);
      if (presErr) throw presErr;

      const onlineMap = {};
      (presence || []).forEach((p) => (onlineMap[p.user_id] = !!p.online));

      const list = (profs || []).map((p) => ({
        id: p.id,
        name: p.username || "Anonymous",
        status: onlineMap[p.id] ? "online" : "offline",
      }));

      setParticipants(list);
    } catch (e) {
      console.error("ParticipantList refresh error:", e);
    }
  };

  // heartbeat presence every 10s
  useEffect(() => {
    let timer;
    const start = async () => {
      // initial presence write (keeps you visible quickly)
      await supabase.from("map_cursors").upsert({
        map_id: mapId,
        user_id: currentUserId,
        x: 0,
        y: 0,
        username: "", // optional, not necessary for presence
        color: "#FF5733",
        updated_at: new Date().toISOString(),
      });

      timer = setInterval(async () => {
        await supabase.from("map_cursors").upsert({
          map_id: mapId,
          user_id: currentUserId,
          x: 0,
          y: 0,
          username: "",
          color: "#FF5733",
          updated_at: new Date().toISOString(),
        });
      }, 10000);
    };
    if (mapId && currentUserId) start();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mapId, currentUserId]);

  // realtime subscriptions
  useEffect(() => {
    let channel;
    const setup = async () => {
      await refresh();

      channel = supabase
        .channel(`pl-${mapId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "map_participants", filter: `map_id=eq.${mapId}` },
          () => refresh()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "map_cursors", filter: `map_id=eq.${mapId}` },
          () => refresh()
        )
        .subscribe();
    };
    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [mapId]);

  return (
    <div>
      <h3>Participants</h3>
      <ul>
        {participants.map((p) => (
          <li key={p.id}>
            {p.name} -{" "}
            <span style={{ color: p.status === "online" ? "green" : "red" }}>
              {p.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipantList;
