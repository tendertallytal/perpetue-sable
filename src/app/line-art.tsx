/**
 * Dotted magenta line art that fills the empty left side of the scene.
 * Drawn as stippled strokes (a dash pattern of near-zero-length round dashes)
 * so the flowers read as loose dotted outlines rather than solid drawings.
 */
export default function LineArt() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 2000 1125"
      preserveAspectRatio="xMinYMid slice"
      aria-hidden="true"
      fill="none"
      stroke="#ec13d2"
      strokeLinecap="round"
    >
      <g strokeWidth="7" strokeDasharray="0.5 13" opacity="0.85">
        {/* tulip, upper left */}
        <path d="M232 470 C 226 400 220 340 214 268" />
        <path d="M214 268 C 150 262 112 196 140 148 c 24 -40 74 -30 80 12 c 14 -46 68 -52 88 -12 c 26 52 -14 118 -94 120 z" />
        <path d="M232 380 C 170 372 130 330 128 276" />
        <path d="M234 400 C 292 388 320 344 318 300" />

        {/* open rose, middle left */}
        <path d="M300 690 c -40 -52 26 -104 78 -66 c 58 42 14 122 -64 122 c -96 0 -142 -96 -78 -166 c 76 -84 212 -32 226 70 c 16 122 -122 212 -244 168" />
        <path d="M232 856 c -70 -34 -112 -104 -110 -178" />

        {/* smaller bud, below */}
        <path d="M470 828 c -28 -36 18 -72 54 -46 c 40 30 10 86 -44 86 c -66 0 -98 -66 -54 -116" />
        <path d="M426 752 c 52 -46 132 -30 164 26" />

        {/* stray blossom, right of the rose */}
        <path d="M600 620 c -22 -28 14 -56 42 -36 c 32 24 8 68 -34 68 c -52 0 -78 -52 -42 -92" />
      </g>

      {/* scattered stipple, echoing the sketch's stray dots */}
      <g strokeWidth="8" strokeDasharray="0.5 94" opacity="0.65">
        <path d="M110 320 C 300 274 520 344 762 296" />
        <path d="M78 548 C 262 498 486 566 706 518" />
        <path d="M152 786 C 322 738 546 802 782 758" />
        <path d="M196 1004 C 366 958 562 1012 742 982" />
      </g>
    </svg>
  );
}
