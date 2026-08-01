'use client';

import React, { useRef, useState } from 'react';

/**
 * Lets anything be pushed around the scene with the cursor. The offset is a
 * displacement from wherever the layout put the element, so the responsive
 * default placement survives and only the delta is tracked.
 */
export function useDraggable(options?: { ignoreSelector?: string }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const origin = useRef({ pointerX: 0, pointerY: 0, x: 0, y: 0 });
  // Lets a draggable button tell a real click from the end of a drag.
  const moved = useRef(false);
  // Whether a drag is underway, held in a ref rather than read off `dragging`:
  // a pointer that moves in the same tick as the press would otherwise be
  // dropped, because the re-render carrying the new state hasn't happened yet.
  const active = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    // Typing and scrolling inside a dragged panel shouldn't move it.
    if (
      options?.ignoreSelector &&
      (e.target as HTMLElement).closest(options.ignoreSelector)
    ) {
      return;
    }

    origin.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      x: offset.x,
      y: offset.y,
    };
    moved.current = false;
    active.current = true;
    setDragging(true);
    // Capture keeps the gesture with this element even if the pointer outruns
    // it; it throws if the pointer is already gone, which we don't care about.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* dragging still works, just without capture */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!active.current) return;
    const o = origin.current;
    const dx = e.clientX - o.pointerX;
    const dy = e.clientY - o.pointerY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved.current = true;
    setOffset({ x: o.x + dx, y: o.y + dy });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!active.current) return;
    active.current = false;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* nothing to release */
    }
  };

  return {
    offset,
    dragging,
    // True when the pointer travelled far enough that the gesture was a drag,
    // not a click — so a draggable button can ignore the trailing click.
    // Reading it clears it: otherwise a later keyboard activation of the button,
    // which has no pointerdown to reset the flag, would be swallowed too.
    takeDragged: () => {
      const dragged = moved.current;
      moved.current = false;
      return dragged;
    },
    dragProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      style: { transform: `translate(${offset.x}px, ${offset.y}px)` },
    },
  };
}
