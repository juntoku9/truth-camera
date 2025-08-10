'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import { CameraIcon, ShieldCheckIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { WalletConnect } from './components/WalletConnect';

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const heroImage = process.env.NEXT_PUBLIC_APP_HERO_IMAGE;
  const wordmarkImage = process.env.NEXT_PUBLIC_APP_WORDMARK || process.env.NEXT_PUBLIC_APP_LOGO || '/truth-wordmark.png';

  // The setFrameReady() function is called when your mini-app is ready to be shown
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="min-h-screen tc-hero relative">
      {heroImage ? (
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      ) : null}
      <div className="relative container mx-auto px-4 py-8 sm:py-14">
        {/* Hero */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-white/10 text-white/80 bg-white/5">Research Prototype</span>
          <WalletConnect />
        </div>

        <div className="text-center mb-10 sm:mb-14">
          <div className="flex justify-center">
            <Image
              src={wordmarkImage}
              alt="Truth Camera logo"
              width={960}
              height={280}
              priority
              sizes="(min-width: 1024px) 820px, 90vw"
              className="w-[min(96%,820px)] sm:w-[min(92%,900px)] h-auto drop-shadow-[0_0_24px_rgba(255,77,0,0.28)]"
            />
          </div>
          <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
            Minimal camera-first tool for cryptographic image provenance. Capture or verify with a clean, tamper-resistant flow.
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-10 sm:mb-14">
          <Link href="/upload" className="group">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl tc-glow-orange p-6 sm:p-8 h-full">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                  <CameraIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-medium text-white mb-2 text-center">Take Photo</h3>
              <p className="text-gray-300 text-center mb-5 text-sm sm:text-base">
                Use your device camera to capture an authentic frame secured with blockchain proof.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-5 py-2.5 rounded-xl tc-btn-orange text-sm sm:text-base">Start Camera →</span>
              </div>
            </div>
          </Link>

          <Link href="/verify" className="group">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl tc-glow-blue p-6 sm:p-8 h-full">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                  <DocumentMagnifyingGlassIcon className="h-6 w-6 sm:h-8 sm:w-8 text-sky-300" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-medium text-white mb-2 text-center">Verify Image</h3>
              <p className="text-gray-300 text-center mb-5 text-sm sm:text-base">
                Check an image against blockchain proofs to confirm authenticity.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-5 py-2.5 rounded-xl tc-btn-blue text-sm sm:text-base">Verify Image →</span>
              </div>
            </div>
          </Link>
        </div>

        {/* How it Works */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8 max-w-4xl mx-auto">
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
              <h4 className="font-medium text-white mb-2 text-sm sm:text-base">Store on Blockchain</h4>
              <p className="text-gray-300 text-xs sm:text-sm">Proofs are immutably stored on-chain for verification.</p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="rounded-xl border border-white/10 bg-blue-500/10 p-4 sm:p-6">
            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base sm:text-lg font-medium text-blue-200 mb-1">Blockchain-Secured Authenticity</h4>
                <p className="text-blue-200/90 text-sm sm:text-base">Camera-first capture with immutable blockchain proofs ensures maximum authenticity and prevents tampering.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
