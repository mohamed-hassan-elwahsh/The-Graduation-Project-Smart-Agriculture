import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgroSat — Satellite Agriculture Platform',
  description: 'AI-powered satellite imagery analysis for agricultural insights',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}