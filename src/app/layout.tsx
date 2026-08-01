import type { Metadata } from 'next';
import { Oswald, Pinyon_Script } from 'next/font/google';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['200', '300', '400'],
  variable: '--font-oswald',
});

const pinyon = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pinyon',
});

export const metadata: Metadata = {
  title: 'Perpétue Sablé',
  description:
    'Perpétue Sablé, called the Abnomaly, called Patient S. She is missing her brain. It is always 4 November 1953.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${oswald.variable} ${pinyon.variable}`}>
      <body>{children}</body>
    </html>
  );
}
