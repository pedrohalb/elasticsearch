// LightFocusOverlay.tsx
import React, { useState, useEffect } from "react";

function LightFocusOverlay({ visible }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="light-focus-overlay"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 3s ease-out",
        position: "absolute",
        inset: 0,
        zIndex: 50,
        background: `radial-gradient(
          circle 100px at ${mousePos.x}px ${mousePos.y}px,
          rgba(255, 255, 255, 0.1),
          black
        )`,
      }}
    />
  );
}

export default LightFocusOverlay;
