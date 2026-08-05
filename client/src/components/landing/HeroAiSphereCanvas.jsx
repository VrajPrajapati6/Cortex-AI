import React, { useEffect, useRef } from "react";

export const HeroAiSphereCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Responsive Canvas Resizing
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse tracking for interactive distortion
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left - rect.width / 2;
      mouse.targetY = e.clientY - rect.top - rect.height / 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Microservice Peripheral Nodes (Matching Image 1 & 2 layout)
    const nodes = [
      { label: "USER GATEWAY", angle: 0, radiusOffset: 0, icon: "⚡" },
      { label: "ORDER SERVICE", angle: Math.PI / 3, radiusOffset: 10, icon: "📦" },
      { label: "PAYMENT GATEWAY", angle: (2 * Math.PI) / 3, radiusOffset: -5, icon: "💳" },
      { label: "NEON POSTGRES (VECTOR)", angle: Math.PI, radiusOffset: 15, icon: "🐘" },
      { label: "REDIS CLUSTER", angle: (4 * Math.PI) / 3, radiusOffset: -10, icon: "⚡" },
      { label: "XGBoost ML ENGINE", angle: (5 * Math.PI) / 3, radiusOffset: 5, icon: "🤖" },
    ];

    // Particle Swarm
    const particlesCount = 80;
    const particles = Array.from({ length: particlesCount }, () => ({
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      z: Math.random() * 200 + 50,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.02 + 0.005,
      angle: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.015;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;
      const centerX = width / 2 + mouse.x * 0.05;
      const centerY = height / 2 + mouse.y * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Background Ambient Radial Glow
      const bgGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        20,
        centerX,
        centerY,
        width * 0.45
      );
      bgGlow.addColorStop(0, "rgba(30, 41, 59, 0.4)");
      bgGlow.addColorStop(0.5, "rgba(15, 23, 42, 0.2)");
      bgGlow.addColorStop(1, "rgba(9, 13, 20, 0)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Render Floating Nodes & Connection Rays
      const baseRadius = Math.min(width, height) * 0.28;

      nodes.forEach((node, idx) => {
        const currentAngle = node.angle + time * 0.15;
        const nodeDistance = baseRadius + node.radiusOffset + Math.sin(time + idx) * 8;
        const nx = centerX + Math.cos(currentAngle) * nodeDistance;
        const ny = centerY + Math.sin(currentAngle) * nodeDistance;

        // Connection Ray from Core to Node
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(nx, ny);
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated Signal Pulse along Ray
        const pulseProgress = (time * 0.8 + idx * 0.3) % 1;
        const px = centerX + (nx - centerX) * pulseProgress;
        const py = centerY + (ny - centerY) * pulseProgress;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? "#10b981" : "#3b82f6";
        ctx.shadowColor = idx % 2 === 0 ? "#10b981" : "#3b82f6";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Node Badge
        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Node Label Box
        ctx.font = "600 10px monospace";
        const labelText = `[ ${node.label} ]`;
        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;

        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = "rgba(51, 65, 85, 0.8)";
        ctx.lineWidth = 1;

        const padX = 8;
        const padY = 5;
        const boxX = nx - textWidth / 2 - padX;
        const boxY = ny + 12;

        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(boxX, boxY, textWidth + padX * 2, 20, 6);
        } else {
          ctx.rect(boxX, boxY, textWidth + padX * 2, 20);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.fillText(labelText, boxX + padX, boxY + 13);
      });

      // Render Dynamic Fluid AI Core Blob (Inspired by User Images 1 & 2)
      const coreRadius = Math.min(width, height) * 0.16;
      ctx.beginPath();

      const numPoints = 60;
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        // Organic Fluid Distortion Math
        const distortion1 = Math.sin(angle * 4 + time * 2) * 12;
        const distortion2 = Math.cos(angle * 6 - time * 1.5) * 8;
        const mouseDistortion = Math.sin(angle + Math.atan2(mouse.y, mouse.x)) * 10;

        const r = coreRadius + distortion1 + distortion2 + mouseDistortion;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();

      // Fluid Core Shading Gradient (Sleek Dark Chrome / Metallic Obsidian)
      const coreGlow = ctx.createRadialGradient(
        centerX - coreRadius * 0.3,
        centerY - coreRadius * 0.3,
        coreRadius * 0.1,
        centerX,
        centerY,
        coreRadius * 1.3
      );
      coreGlow.addColorStop(0, "#f8fafc");
      coreGlow.addColorStop(0.2, "#cbd5e1");
      coreGlow.addColorStop(0.5, "#475569");
      coreGlow.addColorStop(0.8, "#1e293b");
      coreGlow.addColorStop(1, "#0f172a");

      ctx.fillStyle = coreGlow;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner Core Highlights
      ctx.beginPath();
      ctx.arc(centerX - coreRadius * 0.25, centerY - coreRadius * 0.25, coreRadius * 0.35, 0, Math.PI * 2);
      const innerHighlight = ctx.createRadialGradient(
        centerX - coreRadius * 0.25,
        centerY - coreRadius * 0.25,
        0,
        centerX - coreRadius * 0.25,
        centerY - coreRadius * 0.25,
        coreRadius * 0.35
      );
      innerHighlight.addColorStop(0, "rgba(255, 255, 255, 0.4)");
      innerHighlight.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = innerHighlight;
      ctx.fill();

      // Render Orbiting Ring
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, coreRadius * 1.5, coreRadius * 0.5, time * 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Render Swarm Particles
      particles.forEach((p) => {
        p.angle += p.speed;
        const px = centerX + Math.cos(p.angle) * p.z;
        const py = centerY + Math.sin(p.angle) * (p.z * 0.4);

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(226, 232, 240, 0.6)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-[480px] md:h-[560px] flex items-center justify-center overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Center Search Bar Overlay (Directly inspired by Image 1 & Image 3) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 w-72 sm:w-80">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/70 shadow-2xl rounded-full py-2.5 px-4 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-medium text-slate-300 tracking-wide">
            CORTEX AI COMPUTE ENGINE
          </span>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
};
