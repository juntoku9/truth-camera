'use client';

import { useEffect } from 'react';
import Link from "next/link";
import {
  CameraIcon,
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon,
  LockClosedIcon,
  EyeIcon,
  HashtagIcon,
  CircleStackIcon
} from "@heroicons/react/24/outline";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { WalletConnect } from './components/WalletConnect';

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  // The setFrameReady() function is called when your mini-app is ready to be shown
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="min-h-screen bg-hero-dark">
      <div className="page-container mx-auto max-w-6xl py-8 sm:py-12">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <span className="pill px-3 py-1 text-xs">Research Prototype</span>
          <WalletConnect />
        </div>

        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex justify-center mb-6">
            <div className="hero-lens" />
          </div>
          <h1 className="hero-title text-4xl sm:text-5xl tracking-tight">
            <span className="neon-text-orange">TRUTH</span> <span className="neon-text-blue">CAMERA</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Minimal camera-first tool for cryptographic image provenance. Capture or verify with a clean, tamper-resistant flow.
          </p>
        </div>

        {/* Feature tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-10 sm:mb-14">
          {[{title:'Direct Capture', icon: CameraIcon, color:'text-cyan-300'}, {title:'SHA-256 Hash', icon: DocumentMagnifyingGlassIcon, color:'text-emerald-300'}, {title:'Tamper Proof', icon: ShieldCheckIcon, color:'text-blue-300'}, {title:'Verification', icon: DocumentMagnifyingGlassIcon, color:'text-violet-300'}].map((t, i) => (
            <div key={i} className="tile-outline rounded-[16px] p-5 flex items-center gap-3">
              <t.icon className={`icon-6 ${t.color}`} />
              <div className="text-slate-200 text-sm">{t.title}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mb-12">
          <Link href="/start" className="inline-flex">
            <span className="cta-hero px-7 sm:px-8 py-3.5 text-base font-medium">Enter Secure Zone</span>
          </Link>
          <div className="text-slate-400 text-xs mt-3">Zero-knowledge cryptographic verification • No data leaves your device</div>
        </div>

        {/* Security Protocol heading */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <LockClosedIcon className="icon-6 text-cyan-300" />
            <ShieldCheckIcon className="icon-6 text-emerald-300" />
            <EyeIcon className="icon-6 text-blue-300" />
          </div>
          <h2 className="text-slate-100 text-2xl sm:text-3xl font-semibold">Security Protocol</h2>
          <p className="text-slate-300 mt-2 max-w-3xl mx-auto text-sm sm:text-base">
            Three-layer cryptographic verification system ensuring uncompromising image authenticity
          </p>
          <div className="text-[11px] mt-3 tracking-wider text-slate-400">ZERO–KNOWLEDGE • END–TO–END • TAMPER–PROOF</div>
        </div>

        {/* Protocol cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-protocol text-center">
            <div className="mx-auto mb-3 w-14 h-14 rounded-2xl flex items-center justify-center border border-cyan-300/20 bg-gradient-to-br from-cyan-500/15 to-emerald-500/10">
              <CameraIcon className="icon-7 text-cyan-300" />
            </div>
            <div className="badge-step mx-auto mb-3">1</div>
            <h3 className="text-slate-100 text-base sm:text-lg mb-1">Secure Capture</h3>
            <p className="text-slate-400 text-sm">Direct sensor capture prevents pre-manipulation and ensures data integrity from source.</p>
            <div className="divider mt-4"></div>
            <div className="text-[11px] mt-3 text-emerald-300/90">SECURED</div>
          </div>
          <div className="card-protocol text-center">
            <div className="mx-auto mb-3 w-14 h-14 rounded-2xl flex items-center justify-center border border-emerald-300/20 bg-gradient-to-br from-emerald-500/15 to-cyan-500/10">
              <HashtagIcon className="icon-7 text-emerald-300" />
            </div>
            <div className="badge-step mx-auto mb-3">2</div>
            <h3 className="text-slate-100 text-base sm:text-lg mb-1">Cryptographic Hash</h3>
            <p className="text-slate-400 text-sm">Military-grade SHA-256 fingerprint computed locally in your secure browser environment.</p>
            <div className="divider mt-4"></div>
            <div className="text-[11px] mt-3 text-emerald-300/90">SECURED</div>
          </div>
          <div className="card-protocol text-center">
            <div className="mx-auto mb-3 w-14 h-14 rounded-2xl flex items-center justify-center border border-violet-300/20 bg-gradient-to-br from-violet-500/15 to-blue-500/10">
              <CircleStackIcon className="icon-7 text-violet-300" />
            </div>
            <div className="badge-step mx-auto mb-3">3</div>
            <h3 className="text-slate-100 text-base sm:text-lg mb-1">Secure Storage</h3>
            <p className="text-slate-400 text-sm">Cryptographic proofs stored locally with zero-knowledge architecture for maximum privacy.</p>
            <div className="divider mt-4"></div>
            <div className="text-[11px] mt-3 text-emerald-300/90">SECURED</div>
          </div>
        </div>

        {/* Cryptographic Guarantee */}
        <div className="mt-10 sm:mt-14 card-dark rounded-[20px] p-6 sm:p-8">
          <div className="text-center mb-5 sm:mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheckIcon className="icon-6 text-emerald-300" />
              <ShieldCheckIcon className="icon-6 text-cyan-300" />
            </div>
            <h2 className="text-slate-100 text-xl sm:text-2xl font-semibold">Cryptographic Guarantee</h2>
            <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-3xl mx-auto">
              Our zero-knowledge cryptographic approach ensures that every image captured through Truth Camera has a
              unique digital fingerprint that cannot be replicated, forged, or compromised.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-cyan-300 text-sm font-semibold tracking-wide">PRIVACY</div>
              <div className="text-slate-400 text-xs mt-1">Zero data transmission</div>
            </div>
            <div className="text-center">
              <div className="text-emerald-300 text-sm font-semibold tracking-wide">INTEGRITY</div>
              <div className="text-slate-400 text-xs mt-1">Tamper detection</div>
            </div>
            <div className="text-center">
              <div className="text-blue-300 text-sm font-semibold tracking-wide">AUTHENTICITY</div>
              <div className="text-slate-400 text-xs mt-1">Source verification</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
