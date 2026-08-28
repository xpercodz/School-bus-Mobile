interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

/** Wrapper for a filled Material Symbols Rounded glyph. */
export function Icon({ name, size = 24, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded ${className ?? ""}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}
