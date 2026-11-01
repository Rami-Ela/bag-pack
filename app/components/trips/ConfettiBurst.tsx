import type { CSSProperties } from "react";

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#ef4444",
  "#a855f7",
  "#f97316",
];
const PIECE_COUNT = 28;

// Deterministic spread (golden angle) keeps render pure while still looking random
const PIECES = Array.from({ length: PIECE_COUNT }, (_, i) => {
  const angle = (i * 137.5 * Math.PI) / 180;
  const distance = 50 + ((i * 53) % 80);
  return {
    color: COLORS[i % COLORS.length],
    dx: Math.cos(angle) * distance * 1.6,
    dy: Math.sin(angle) * distance * 0.6 + 30,
    rotation: ((i * 97) % 720) - 360,
    delay: (i % 5) * 20,
  };
});

export function ConfettiBurst() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 z-10 motion-reduce:hidden"
    >
      {PIECES.map((piece, i) => (
        <span
          key={i}
          className="absolute h-2.5 w-1.5 rounded-sm opacity-0"
          style={
            {
              backgroundColor: piece.color,
              "--confetti-dx": `${piece.dx}px`,
              "--confetti-dy": `${piece.dy}px`,
              "--confetti-rotation": `${piece.rotation}deg`,
              animation: `confetti-burst 900ms ease-out ${piece.delay}ms forwards`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
