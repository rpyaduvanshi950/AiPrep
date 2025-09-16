import React, { useRef, useEffect, useState } from 'react';

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function clamp(t, a, b) {
  return Math.max(a, Math.min(b, t));
}

function drawLayer(ctx, layer, t, playing) {
  let { type, props = {}, animations = [] } = layer;
  let drawProps = { ...props };
  // Apply animations
  for (const anim of animations) {
    if (anim.property === 'orbit') {
      // Orbit: move x/y in a circle
      const angle = ((t % anim.duration) / anim.duration) * 2 * Math.PI;
      drawProps.x = anim.centerX + anim.radius * Math.cos(angle);
      drawProps.y = anim.centerY + anim.radius * Math.sin(angle);
    } else if (anim.property === 'pulse') {
      // Pulse: oscillate radius
      const pulseT = Math.sin((t / anim.duration) * 2 * Math.PI) * 0.5 + 0.5;
      drawProps.r = lerp(anim.min, anim.max, pulseT);
    } else if (['x', 'y', 'r', 'dx', 'dy'].includes(anim.property)) {
      // Linear interpolation
      const animT = clamp((t - anim.start) / (anim.end - anim.start), 0, 1);
      drawProps[anim.property] = lerp(anim.from, anim.to, animT);
    }
  }
  // Draw
  ctx.save();
  ctx.globalAlpha = drawProps.opacity ?? 1;
  ctx.fillStyle = drawProps.color || '#3a7afe';
  ctx.strokeStyle = drawProps.stroke || '#fff';
  ctx.lineWidth = drawProps.lineWidth || 2;
  switch (type) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(drawProps.x, drawProps.y, drawProps.r, 0, 2 * Math.PI);
      ctx.fill();
      if (drawProps.stroke) ctx.stroke();
      break;
    case 'rect':
      ctx.fillRect(drawProps.x, drawProps.y, drawProps.w, drawProps.h);
      if (drawProps.stroke) ctx.strokeRect(drawProps.x, drawProps.y, drawProps.w, drawProps.h);
      break;
    case 'arrow': {
      // Draw line
      ctx.beginPath();
      ctx.moveTo(drawProps.x, drawProps.y);
      ctx.lineTo(drawProps.x + drawProps.dx, drawProps.y + drawProps.dy);
      ctx.stroke();
      // Arrowhead
      const angle = Math.atan2(drawProps.dy, drawProps.dx);
      const len = Math.sqrt(drawProps.dx ** 2 + drawProps.dy ** 2);
      const ah = 12;
      ctx.beginPath();
      ctx.moveTo(drawProps.x + drawProps.dx, drawProps.y + drawProps.dy);
      ctx.lineTo(drawProps.x + drawProps.dx - ah * Math.cos(angle - 0.4), drawProps.y + drawProps.dy - ah * Math.sin(angle - 0.4));
      ctx.lineTo(drawProps.x + drawProps.dx - ah * Math.cos(angle + 0.4), drawProps.y + drawProps.dy - ah * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'text':
      ctx.font = drawProps.font || '20px Inter, Arial';
      ctx.fillStyle = drawProps.color || '#fff';
      ctx.textAlign = drawProps.align || 'left';
      ctx.fillText(drawProps.text, drawProps.x, drawProps.y);
      break;
    default:
      break;
  }
  ctx.restore();
}

export default function VisualizationCanvas({ spec }) {
  const canvasRef = useRef();
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [rafId, setRafId] = useState(null);

  // Reset on new spec
  useEffect(() => {
    setElapsed(0);
    setPlaying(true);
  }, [spec]);

  // Animation loop
  useEffect(() => {
    if (!spec || !playing) return;
    let start = performance.now() - elapsed;
    let stopped = false;
    function frame(now) {
      if (stopped) return;
      let t = now - start;
      if (t > spec.duration) t = spec.duration;
      setElapsed(t);
      draw(t);
      if (t < spec.duration && playing) {
        setRafId(requestAnimationFrame(frame));
      } else {
        setPlaying(false);
      }
    }
    setRafId(requestAnimationFrame(frame));
    return () => {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line
  }, [spec, playing]);

  function draw(t) {
    const canvas = canvasRef.current;
    if (!canvas || !spec) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const layer of spec.layers || []) {
      drawLayer(ctx, layer, t, playing);
    }
  }

  function handlePlay() {
    if (!spec) return;
    setPlaying(true);
  }
  function handlePause() {
    setPlaying(false);
  }
  function handleReset() {
    setElapsed(0);
    setPlaying(false);
    draw(0);
  }

  return (
    <div className="vis-canvas-wrap">
      <div className="vis-canvas-controls">
        <button onClick={handlePlay} disabled={playing || !spec}>Play</button>
        <button onClick={handlePause} disabled={!playing || !spec}>Pause</button>
        <button onClick={handleReset} disabled={!spec}>Reset</button>
      </div>
      <canvas
        className="vis-canvas"
        ref={canvasRef}
        width={480}
        height={360}
      />
      {spec && (
        <div className="vis-canvas-status">
          {Math.round(elapsed)} ms / {spec.duration} ms
        </div>
      )}
    </div>
  );
}
