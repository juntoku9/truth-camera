'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { CameraIcon, ShieldCheckIcon, DocumentMagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useMiniKit } from '@coinbase/onchainkit/minikit';

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
      <div className="container mx-auto px-6 sm:px-8 py-24 sm:py-32">
        {/* Hero */}
        <div className="text-center relative mb-16 sm:mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_0_1px_rgba(34,211,238,0.2),0_10px_30px_rgba(34,211,238,0.25)]">
              <CameraIcon className="h-6 w-6 text-cyan-300" />
            </div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_10px_30px_rgba(16,185,129,0.25)]">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-300" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white/90">
            Truth Camera
          </h1>
          <div className="underline-accent" />
          <p className="mt-6 text-xl sm:text-2xl leading-relaxed text-slate-300/90 max-w-4xl mx-auto">
            Advanced cryptographic verification for uncompromising image authenticity
          </p>
          <p className="mt-3 text-lg sm:text-xl font-medium"><span className="text-accent-gradient">Every pixel secured. Every hash verified.</span> <span className="text-slate-300/90">Every truth protected.</span></p>
        </div>

        {/* Main Actions */}
        {/* Feature trio (icon + label only for airy spacing) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto mt-6 sm:mt-10">
          <Link href="/start?tab=capture" className="text-center card-dark p-6">
            <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 flex items-center justify-center">
              <CameraIcon className="h-6 w-6" />
            </div>
            <div className="text-slate-200 font-medium">Direct Capture</div>
          </Link>
          <Link href="/start?tab=verify" className="text-center card-dark p-6">
            <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div className="text-slate-200 font-medium">SHA-256 Hash</div>
          </Link>
          <div className="text-center card-dark p-6">
            <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-300 flex items-center justify-center">
              <DocumentMagnifyingGlassIcon className="h-6 w-6" />
            </div>
            <div className="text-slate-200 font-medium">Tamper Proof</div>
          </div>
          <Link href="/start?tab=verify" className="text-center card-dark p-6">
            <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-400/30 text-teal-300 flex items-center justify-center">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <div className="text-slate-200 font-medium">Verification</div>
          </Link>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <Link href="/start?tab=capture" className="inline-flex items-center gap-2 text-white/90 px-7 py-4 rounded-full shadow-xl cta-dark">
            Enter Secure Zone
            <CameraIcon className="h-5 w-5 text-white/90" />
          </Link>
          <p className="mt-3 text-slate-400 text-sm">Zero-knowledge cryptographic verification · No data leaves your device</p>
        </div>

        {/* How it Works */}
        <div className="mt-12 sm:mt-16 relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/60 p-10 sm:p-12 max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-6 sm:mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 bg-blue-50 text-blue-600 border border-blue-100">
                <span className="font-semibold text-base sm:text-lg">1</span>
              </div>
              <h4 className="font-medium text-slate-800 mb-2 text-sm sm:text-base">Capture with Camera</h4>
              <p className="text-slate-600 text-xs sm:text-sm">Direct sensor capture prevents pre-manipulation.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="font-semibold text-base sm:text-lg">2</span>
              </div>
              <h4 className="font-medium text-slate-800 mb-2 text-sm sm:text-base">Generate Hash</h4>
              <p className="text-slate-600 text-xs sm:text-sm">We compute a SHA-256 fingerprint in-browser.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 bg-violet-50 text-violet-600 border border-violet-100">
                <span className="font-semibold text-base sm:text-lg">3</span>
              </div>
              <h4 className="font-medium text-slate-800 mb-2 text-sm sm:text-base">Store Proof</h4>
              <p className="text-slate-600 text-xs sm:text-sm">Proofs are stored locally for later verification.</p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
          <div className="rounded-xl border border-white/10 bg-blue-500/10 p-4 sm:p-6">
            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base sm:text-lg font-medium text-blue-200 mb-1">Camera-first Security</h4>
                <p className="text-blue-200/90 text-sm sm:text-base">Requiring direct capture reduces the attack surface and prevents pre-edited submissions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
