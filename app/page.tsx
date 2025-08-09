'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { CameraIcon, ShieldCheckIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 sm:py-14">
        {/* Hero */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div/>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Research Prototype</span>
        </div>

        <div className="text-center mb-10 sm:mb-14">
          <div className="flex justify-center mb-4 sm:mb-5">
            <CameraIcon className="h-12 w-12 sm:h-14 sm:w-14 text-blue-400/90" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">Truth Camera</h1>
          <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
            Minimal camera-first tool for cryptographic image provenance. Capture or verify with a clean, tamper-resistant flow.
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-10 sm:mb-14">
          <Link href="/upload" className="group">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8 h-full">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <CameraIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-medium text-white mb-2 text-center">Take Photo</h3>
              <p className="text-gray-300 text-center mb-5 text-sm sm:text-base">
                Use your device camera to capture an authentic frame secured with a cryptographic fingerprint.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-900/40 group-hover:from-blue-500 group-hover:to-indigo-500 transition-colors text-sm sm:text-base">
                  Start Camera →
                </span>
              </div>
            </div>
          </Link>

          <Link href="/verify" className="group">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8 h-full">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <DocumentMagnifyingGlassIcon className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-300" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-medium text-white mb-2 text-center">Verify Image</h3>
              <p className="text-gray-300 text-center mb-5 text-sm sm:text-base">
                Check an image against locally stored proofs to confirm authenticity.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-lg shadow-emerald-900/40 group-hover:from-emerald-400 group-hover:to-teal-500 transition-colors text-sm sm:text-base">
                  Verify Image →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* How it Works */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-medium text-white mb-6 sm:mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 bg-blue-500/10 border border-blue-500/20">
                <span className="text-blue-300 font-semibold text-base sm:text-lg">1</span>
              </div>
              <h4 className="font-medium text-white mb-2 text-sm sm:text-base">Capture with Camera</h4>
              <p className="text-gray-300 text-xs sm:text-sm">Direct sensor capture prevents pre-manipulation.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-300 font-semibold text-base sm:text-lg">2</span>
              </div>
              <h4 className="font-medium text-white mb-2 text-sm sm:text-base">Generate Hash</h4>
              <p className="text-gray-300 text-xs sm:text-sm">We compute a SHA-256 fingerprint in-browser.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 bg-violet-500/10 border border-violet-500/20">
                <span className="text-violet-300 font-semibold text-base sm:text-lg">3</span>
              </div>
              <h4 className="font-medium text-white mb-2 text-sm sm:text-base">Store Proof</h4>
              <p className="text-gray-300 text-xs sm:text-sm">Proofs are stored locally for later verification.</p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 max-w-4xl mx-auto">
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
