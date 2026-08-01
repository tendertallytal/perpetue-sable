const SPIKES = 24;
const OUTER = 50;
const INNER = 37;

// Alternating long and short radii around a circle: the supermarket-flyer
// sunburst the price stickers sit on.
const points = Array.from({ length: SPIKES * 2 }, (_, i) => {
  const radius = i % 2 === 0 ? OUTER : INNER;
  const angle = (Math.PI * i) / SPIKES - Math.PI / 2;
  return `${(50 + radius * Math.cos(angle)).toFixed(2)},${(
    50 +
    radius * Math.sin(angle)
  ).toFixed(2)}`;
}).join(' ');

export default function Starburst({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={points} fill="#ffe600" stroke="#f7b500" strokeWidth="0.6" />
    </svg>
  );
}
