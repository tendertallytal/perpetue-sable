import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Perpétue Sablé',
};

/**
 * The landing page: one fixed screen, nothing in it yet.
 *
 * `data-fullscreen` is what pins the document — see globals.css. Drop that
 * attribute the day this page grows past the fold and it will scroll normally.
 *
 * This is a server component (no 'use client'), so it ships no JavaScript and
 * can export its own metadata. Add 'use client' at the top only once something
 * here actually needs state or an event handler.
 */
export default function Landing() {
  return (
    <main
      data-fullscreen
      className="relative h-dvh w-screen overflow-hidden bg-white font-oswald"
    >
      {/* Build the scene here. */}

      {/* Placeholder so the chat stays reachable — restyle it or delete it. */}
      <Link
        href="/chat"
        className="absolute bottom-6 right-6 text-sm lowercase text-hotpink underline underline-offset-4"
      >
        speak to her
      </Link>
    </main>
  );
}
