interface IconProps {
  name: string;
  size?: number;
  className?: string;
  /** "rounded" = filled mobile glyphs (default), "outlined" = line dashboard glyphs. */
  variant?: "rounded" | "outlined";
}

/** Wrapper for a Material Symbols glyph (Rounded filled, or Outlined line style). */
export function Icon({ name, size = 24, className, variant = "rounded" }: IconProps) {
  const fontClass = variant === "outlined" ? "material-symbols-outlined" : "material-symbols-rounded";
  return (
    <span
      aria-hidden="true"
      className={`${fontClass} ${className ?? ""}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}
