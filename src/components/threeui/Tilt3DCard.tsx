"use client";

import React from "react";

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowColor?: string;
  intensity?: number;
  pressDepth?: number;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

/**
 * Editorial Surface Card Container.
 * Provides a calm, architectural frame with subtle border and elevation refinement
 * without gimmicky 3D rotation or radial glare.
 */
export function Tilt3DCard({
  children,
  className = "",
  style,
  disabled = false,
  onClick,
}: Tilt3DCardProps) {
  return (
    <div
      className={`editorial-surface ${disabled ? "" : "editorial-surface--interactive"} ${className}`}
      onClick={onClick}
      style={{
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

