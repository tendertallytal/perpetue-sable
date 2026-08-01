// The soft bumped cloud the flyer puts its endorsement in. Drawn in a 0..1 box
// so the same path can both paint the shape and clip the text scrolling inside
// it — otherwise long replies spill past the curves.
const CLOUD =
  'M0.1 0.2696 C0.1125 0.087 0.2625 0.0217 0.325 0.1739 C0.4 0.0217 0.6 0.0217 0.675 0.1739 C0.7375 0.0217 0.8875 0.087 0.9 0.2696 C1 0.3261 1 0.6739 0.9 0.7304 C0.8875 0.913 0.7375 0.9783 0.675 0.8261 C0.6 0.9783 0.4 0.9783 0.325 0.8261 C0.2625 0.9783 0.1125 0.913 0.1 0.7304 C0 0.6739 0 0.3261 0.1 0.2696 Z';

export const CLOUD_CLIP_ID = 'cloud-clip';

export default function CloudBlob({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={CLOUD_CLIP_ID} clipPathUnits="objectBoundingBox">
          <path d={CLOUD} />
        </clipPath>
      </defs>
      <path
        d={CLOUD}
        fill="#f472b6"
        fillOpacity="0.6"
        stroke="#ec4899"
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
