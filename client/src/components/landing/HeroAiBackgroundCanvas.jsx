import React, { useEffect, useRef } from "react";

export const HeroAiBackgroundCanvas = ({ isDark = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let time = 0;
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = (e.clientX - rect.left - rect.width / 2) * 0.2;
      mouse.targetY = (e.clientY - rect.top - rect.height / 2) * 0.2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Dynamic wave mesh lines (Subtle monochrome background field)
    const lineCount = 18;
    const pointsPerLine = 40;

    const render = () => {
      time += 0.008;

      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, width, height);

      // Monochrome line color scheme
      const strokeColor = isDark
        ? "rgba(255, 255, 255, 0.07)"
        : "rgba(0, 0, 0, 0.06)";
      const highlightColor = isDark
        ? "rgba(255, 255, 255, 0.18)"
        : "rgba(0, 0, 0, 0.15)";

      // Draw subtle wave mesh across background
      for (let l = 0; l < lineCount; l++) {
        ctx.beginPath();
        const baseOffsetY = (height / lineCount) * l + height * 0.05;

        for (let i = 0; i <= pointsPerLine; i++) {
          const x = (width / pointsPerLine) * i;

          // Wave equation math
          const freq1 = 0.003;
          const freq2 = 0.006;
          const wave1 = Math.sin(x * freq1 + time + l * 0.3) * 22;
          const wave2 = Math.cos(x * freq2 - time * 0.8 + l * 0.2) * 14;
          const mouseDistortion =
            Math.sin((x / width) * Math.PI) * (mouse.y * 0.1);

          const y = baseOffsetY + wave1 + wave2 + mouseDistortion;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = l % 4 === 0 ? highlightColor : strokeColor;
        ctx.lineWidth = l % 4 === 0 ? 1.2 : 0.8;
        ctx.stroke();
      }

      // Draw floating monochromatic particle nodes
      const particleCount = 25;
      for (let p = 0; p < particleCount; p++) {
        const px =
          ((Math.sin(p * 99 + time * 0.5) + 1) / 2) * width + mouse.x * 0.3;
        const py =
          ((Math.cos(p * 33 + time * 0.3) + 1) / 2) * height + mouse.y * 0.3;
        const radius = (Math.sin(p + time) + 1.5) * 1.5;

        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(0, 0, 0, 0.12)";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block pointer-events-none z-0"
    />
  );
};
