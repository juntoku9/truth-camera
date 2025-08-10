import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpenIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Docs',
  description: 'Vision, principles, and technical notes for Truth Camera.',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen tc-hero relative">
      <div className="relative container mx-auto px-4 py-8 sm:py-14">
        {/* Hero */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <BookOpenIcon className="h-4 w-4" /> Docs
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold text-white">Truth Camera Documentation</h1>
          <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
            Vision, principles, and implementation details that power authentic image capture and verification.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Content */}
          <main className="space-y-6 sm:space-y-8">
            <section id="vision" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-electric-blue)] to-[var(--tc-electric-cyan)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">Vision</h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Truth Camera is a minimal, camera-first tool for cryptographic image provenance. It enables creators
                and investigators to capture sensor-originated frames that are fingerprinted and anchored on-chain for
                verifiable authenticity.
              </p>
            </section>

            <section id="principles" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-orange">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-neon-orange)] to-[var(--tc-neon-orange-2)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">Principles</h2>
              <ul className="list-disc pl-5 text-gray-300 text-sm sm:text-base space-y-2">
                <li>Camera-first: capture at the sensor to minimize manipulation risk.</li>
                <li>Local hashing: compute fingerprints in-browser; raw pixels never leave the device.</li>
                <li>Public verification: proofs anchored on-chain for independent validation.</li>
              </ul>
            </section>

            <section id="how" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-electric-blue)] to-[var(--tc-electric-cyan)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">How it works</h2>
              <ol className="list-decimal pl-5 text-gray-300 text-sm sm:text-base space-y-2">
                <li>Capture a frame directly from the device camera (no uploads).</li>
                <li>Compute a SHA-256 hash of the file bytes entirely in-browser.</li>
                <li>Submit the bytes32 hash to the TruthCamera smart contract on Base.</li>
                <li>Verify by re-hashing the file and calling <code className="text-white/90">verify(bytes32)</code>.</li>
              </ol>
            </section>

            <section id="current" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-orange">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-neon-orange)] to-[var(--tc-neon-orange-2)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">Current Implementation (MVP)</h2>
              <ul className="list-disc pl-5 text-gray-300 text-sm sm:text-base space-y-2">
                <li>Frontend: Next.js (PWA), Tailwind utilities, Heroicons.</li>
                <li>Wallets: Privy auth plus injected wallets (incl. Coinbase Wallet) via EIP‑1193.</li>
                <li>Network: Base Mainnet with automatic chain switching when possible.</li>
                <li>Crypto: SHA‑256 hashing in the browser using Web Crypto API.</li>
                <li>Contracts: Minimal registry mapping <code className="text-white/90">bytes32</code> → {`{ submitter, timestamp }`}.</li>
                <li>Verification: Re-hash locally, read contract with <code className="text-white/90">verify</code>.</li>
                <li>Out of scope for MVP: metadata/EXIF, device attestation, Onramp API, AI/AgentKit.</li>
              </ul>
            </section>

            <section id="api" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-electric-blue)] to-[var(--tc-electric-cyan)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">API & Contracts</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-2">
                <p>
                  Contract source: <code className="text-white/90">base-solidity/contracts/Camera.sol</code>
                  with <code className="text-white/90">submit(bytes32)</code>, <code className="text-white/90">verify(bytes32)</code>, and <code className="text-white/90">ProofSubmitted</code> event.
                </p>
                <p>
                  Frontend utilities: <code className="text-white/90">app/utils/blockchain.ts</code> and hook <code className="text-white/90">app/hooks/useBlockchain.ts</code> (ethers v6).
                </p>
                <p>
                  Configure address via <code className="text-white/90">NEXT_PUBLIC_TRUTH_CAMERA_CONTRACT_ADDRESS</code> in <code className="text-white/90">.env.local</code>.
                </p>
                <div className="pt-2">
                  <Link href="/upload" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg tc-btn-orange text-sm">
                    Try Capture <ArrowUpRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>

            <section id="roadmap" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-orange">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-neon-orange)] to-[var(--tc-neon-orange-2)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">Roadmap</h2>
              <ul className="list-disc pl-5 text-gray-300 text-sm sm:text-base space-y-2">
                <li>Wallet-signed payloads (file hash + metadata) stored off-chain for richer proofs</li>
                <li>Device attestation (iOS/Android), EXIF/GPS capture, and environmental checks</li>
                <li>Onramp API for frictionless gas funding; Coinbase Wallet SDK integration</li>
                <li>Batch proofs, events-first indexing, and enterprise verification APIs</li>
                <li>AI/AgentKit-powered confidence scoring and verification badges</li>
              </ul>
            </section>
          </main>

          {/* Table of contents (right rail) */}
          <aside className="hidden lg:block">
            <nav className="sticky top-6 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-4 tc-glow-blue">
              <div className="text-xs uppercase tracking-wide text-white/60 mb-2">On this page</div>
              <div className="space-y-1">
                {[
                  { href: '#vision', label: 'Vision' },
                  { href: '#principles', label: 'Principles' },
                  { href: '#how', label: 'How it works' },
                  { href: '#api', label: 'API & Contracts' },
                  { href: '#roadmap', label: 'Roadmap' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}


