import type { Metadata } from 'next';
import { Newsreader, Albert_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
  adjustFontFallback: false,
});

const albertSans = Albert_Sans({
  subsets: ['latin'],
  variable: '--font-albert',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cairn — Onchain Priority Claims & Attestation Primitive',
  description:
    'An open onchain primitive on Monad that proves who documented something first, without revealing it. Privacy-preserving, composable, impossible for a single platform to capture.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${albertSans.variable} ${ibmPlexMono.variable} dark`}
    >
      <body className="min-h-screen bg-graphite-950 text-stone-warm-100 font-sans antialiased selection:bg-ochre selection:text-white">
        {/* Subtle Film Grain Noise Overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-50 grain-overlay"
          aria-hidden="true"
        />

        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>

          <footer className="border-t border-hairline py-8 px-6 text-xs text-stone-warm-400">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="font-serif italic text-stone-warm-200 text-sm">
                  Cairn
                </span>
                <span>— Time is sediment. Built on Monad Testnet (Chain 10143).</span>
              </div>
              <div className="flex items-center gap-6 font-mono text-[11px]">
                <a
                  href="https://testnet.monadscan.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-stone-warm-200 transition-colors"
                >
                  MonadScan
                </a>
                <a
                  href="https://github.com/SomSatwik/cairn"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-stone-warm-200 transition-colors"
                >
                  GitHub
                </a>
                <span className="text-ochre">Immutable &amp; Permissionless</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
