import styles from "./BanterLoader.module.css";

/**
 * Initial page loader — the banter loader: a 3×3 grid of boxes that slide
 * around. Self-centers, so it renders inside any full-screen overlay (see
 * AppBootLoader). Pure markup + CSS animation — safe as a server component.
 */
export function BanterLoader({ label }: { label: string }) {
  return (
    <div className={styles.loader} role="status" aria-label={label}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className={styles.box} />
      ))}
    </div>
  );
}
