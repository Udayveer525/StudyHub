// components/ollie/OllieAvatar.jsx
import React from "react";

export default function OllieAvatar({ size = 48, animated = false }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 ${animated ? "animate-bounce" : ""}`}
    >
      <img
        src="/owl-mascot.png"
        alt="Ollie"
        style={{ width: size, height: size }}
        className="object-contain drop-shadow-md"
      />
    </div>
  );
}