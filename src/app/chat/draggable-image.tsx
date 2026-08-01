/* eslint-disable @next/next/no-img-element */
'use client';

import { useDraggable } from './use-draggable';

/**
 * A piece of the collage the viewer can rearrange. `draggable={false}` turns off
 * the browser's own image dragging, which would otherwise fight ours.
 */
export default function DraggableImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const { dragging, dragProps } = useDraggable();

  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt === '' ? true : undefined}
      draggable={false}
      className={`${className} pointer-events-auto touch-none select-none ${
        dragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      {...dragProps}
    />
  );
}
