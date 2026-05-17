export function Marquee() {
  const message = "SYSTEM STATUS: DUALITY ACTIVE — ARCHIVE LOADED — SCROLL TO DECRYPT — SYSTEM STATUS: DUALITY ACTIVE — ARCHIVE LOADED — SCROLL TO DECRYPT — ";

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black/80 border-t border-[var(--accent-color)] overflow-hidden h-10 flex items-center z-50 backdrop-blur-sm">
      <div className="marquee-content font-mono text-[var(--accent-color)] text-sm tracking-wider whitespace-nowrap">
        {message}
      </div>
    </div>
  );
}
