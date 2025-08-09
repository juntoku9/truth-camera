'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletConnect } from '../components/WalletConnect';
import { CameraIcon, ShieldCheckIcon, DocumentMagnifyingGlassIcon, PhotoIcon } from '@heroicons/react/24/outline';

type TabKey = 'capture' | 'verify';

export default function StartPage() {
  const [tab, setTab] = useState<TabKey>('capture');

  return (
    <div className="min-h-screen bg-hero-dark">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 backdrop-blur border-b border-white/10">
        <div className="page-container mx-auto max-w-6xl py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-300/20">
              <CameraIcon className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-300/20">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-300" />
            </div>
            <span className="hidden sm:inline text-slate-200 text-sm font-medium">Truth Camera</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="pill px-2.5 py-1 text-xs">Secure Zone</span>
            <WalletConnect />
          </div>
        </div>
      </div>

      <div className="page-container mx-auto max-w-6xl py-8 sm:py-12">
        {/* Tabs */}
        <div className="flex items-center justify-center mb-8">
          <div className="tab-container-dark inline-flex">
            <button
              className={`tab-btn ${tab === 'capture' ? 'tab-btn-active' : ''}`}
              onClick={() => setTab('capture')}
            >
              capture
            </button>
            <button
              className={`tab-btn ${tab === 'verify' ? 'tab-btn-active' : ''}`}
              onClick={() => setTab('verify')}
            >
              verify
            </button>
          </div>
        </div>

        {/* Capture Section */}
        {tab === 'capture' && (
          <div className="card-dark rounded-[16px] overflow-hidden">
            {/* Header bar */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-300/20 flex items-center justify-center" style={{ boxShadow: 'var(--tc-shadow-glow-cyan-soft)' }}>
                  <CameraIcon className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <div className="text-slate-100 text-xl font-semibold">Capture Authenticity</div>
                  <div className="text-slate-400 text-[12px] tracking-widest mt-1">
                    CAPTURE <span className="mx-2">→</span> HASH <span className="mx-2">→</span> STORE
                  </div>
                </div>
              </div>
              <div className="text-cyan-300 text-sm uppercase tracking-wider">LIVE</div>
            </div>

            <div className="panel-dark aspect-[16/10] flex items-center justify-center">
              <div className="text-center px-6">
                <CameraIcon className="h-12 w-12 text-cyan-300 mx-auto mb-4" />
                <h2 className="text-slate-100 text-xl sm:text-2xl mb-2">Camera Capture</h2>
                <p className="text-slate-300 text-sm max-w-md mx-auto">Direct sensor capture prevents pre-manipulation and ensures integrity from the source.</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent">
              <Link href="/upload" className="inline-flex">
                <span className="cta-dark px-5 py-2.5 text-sm inline-flex items-center gap-2"><PhotoIcon className="h-5 w-5" /> Open Capture</span>
              </Link>
              <Link href="/verify" className="inline-flex">
                <span className="pill px-5 py-2.5 text-sm">Go to Verify</span>
              </Link>
            </div>
          </div>
        )}

        {/* Verify Section */}
        {tab === 'verify' && (
          <div className="card-dark rounded-[16px] p-10 text-center">
            <div className="mx-auto w-full max-w-xl">
              <div className="mb-6">
                <DocumentMagnifyingGlassIcon className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                <h2 className="text-slate-100 text-xl sm:text-2xl mb-2">Verify Image Authenticity</h2>
                <p className="text-slate-300 text-sm">Drag-and-drop verification is available in the Verify flow.</p>
              </div>
              <Link href="/verify" className="inline-flex">
                <span className="cta-dark px-6 py-3 text-sm">Open Verify</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

