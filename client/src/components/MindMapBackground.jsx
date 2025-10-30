import React, { useEffect, useRef } from "react";

export default function MindmapBackground() {
  const ref = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    let w = 0, h = 0;
    let particles = [];
    const DENSITY = 0.00012;
    const LINK = 140;
    const SPEED = 0.15;

    // interaction state
    let mouse = { x: -1e9, y: -1e9, down: false };
    let dragIndex = -1;
    const PICK_RADIUS = 16;       // px to grab a node
    const TUG_RADIUS = 120;       // influence distance
    const TUG_STRENGTH = 0.04;    // how strong the pull feels

    function seed() {
      const a = Math.random() * Math.PI * 2;
      const s = (0.4 + Math.random() * 0.6) * SPEED;
      return { x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a)*s, vy: Math.sin(a)*s, r: 1 + Math.random()*1.2 };
    }

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth || 1;
      h = parent.clientHeight || 1;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const target = Math.round(w * h * DENSITY);
      while (particles.length < target) particles.push(seed());
      if (particles.length > target) particles.length = target;
    }

    function nearestIndex(px, py) {
      let best = -1, bestD2 = PICK_RADIUS * PICK_RADIUS;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - px, dy = p.y - py;
        const d2 = dx*dx + dy*dy;
        if (d2 < bestD2) { bestD2 = d2; best = i; }
      }
      return best;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // physics: move
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // if dragging this particle, pin to mouse
        if (i === dragIndex) {
          p.x += (mouse.x - p.x) * 0.35; // smooth follow
          p.y += (mouse.y - p.y) * 0.35;
          p.vx = 0; p.vy = 0;
        } else {
          // gentle tug toward/away from mouse if within radius
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d2 = dx*dx + dy*dy;
          if (d2 < TUG_RADIUS * TUG_RADIUS && !mouse.down) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / TUG_RADIUS) * TUG_STRENGTH; // 0..TUG_STRENGTH
            // pull toward cursor:
            p.vx -= (dx / d) * f;
            p.vy -= (dy / d) * f;
          }

          p.x += p.vx;
          p.y += p.vy;
        }

        // wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      // links
      const max2 = LINK * LINK;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx*dx + dy*dy;
          if (d2 < max2) {
            const t = 1 - d2 / max2;
            ctx.strokeStyle = `rgba(14,165,233,${0.18 * t})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes (highlight the one under cursor)
      const hover = nearestIndex(mouse.x, mouse.y);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        const isDrag = i === dragIndex;
        const isHover = i === hover && dragIndex === -1;
        const r = isDrag ? p.r + 1.2 : isHover ? p.r + 0.8 : p.r;

        ctx.fillStyle = "rgba(14,165,233,0.58)";
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "rgba(34,211,238,0.16)";
        ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf.current = requestAnimationFrame(draw);
    }

    // events
    function toLocal(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / (rect.width) * w,
        y: (e.clientY - rect.top) / (rect.height) * h
      };
    }
    const onMove = (e) => { const m = toLocal(e); mouse.x = m.x; mouse.y = m.y; };
    const onDown = (e) => { mouse.down = true; const m = toLocal(e); mouse.x = m.x; mouse.y = m.y; dragIndex = nearestIndex(m.x, m.y); };
    const onUp   = () => { mouse.down = false; dragIndex = -1; };

    // init
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();
    raf.current = requestAnimationFrame(draw);

    // pointer listeners
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return <canvas className="mindmap-canvas" ref={ref} aria-hidden="true" />;
}
