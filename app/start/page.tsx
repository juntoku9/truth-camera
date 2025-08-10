'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletConnect, WalletStatus } from '../components/WalletConnect';
import { CameraIcon, ShieldCheckIcon, DocumentMagnifyingGlassIcon, PhotoIcon, EyeIcon, LockClosedIcon, ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TruthCamera } from '../components/TruthCamera';
import { useBlockchain } from '../hooks/useBlockchain';
import { hashImageFile } from '../utils/crypto';
import { formatAddress, formatTimestamp, type BlockchainProof } from '../utils/blockchain';

type TabKey = 'capture' | 'verify';

export default function StartPage() {
  const [tab, setTab] = useState<TabKey>('capture');
  const { isConnected } = useBlockchain();

  return (
    <div className="min-h-screen bg-hero-dark">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 backdrop-blur border-b border-white/10">
        <div className="page-container mx-auto max-w-6xl py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-orange-500/10 border border-orange-400/30 shadow-[0_0_20px_rgba(249,115,22,0.25)]">
              <CameraIcon className="h-5 w-5 text-orange-400" />
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-400/30">
              <ShieldCheckIcon className="h-5 w-5 text-blue-300" />
            </div>
            <Link href="/" className="hidden sm:inline text-sm font-semibold neon-text-orange hover:opacity-95">Truth Camera</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="pill px-2.5 py-1 text-xs">Secure Zone</span>
            <WalletConnect />
          </div>
        </div>
      </div>

      <div className="page-container mx-auto max-w-6xl py-8 sm:py-12">
        {/* Tabs */}
        <div className="relative mb-8">
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <Link href="/" className="flex items-center text-cyan-300 hover:text-cyan-200 transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="hidden sm:inline ml-1">Back</span>
            </Link>
          </div>
          <div className="flex justify-center">
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
              
            </div>

            {/* Wallet status moved inside TruthCamera */}

            <div className="panel-dark rounded-b-[16px] px-6 pb-6">
              <TruthCamera autoStart={false} />
              <div className="mt-4 text-[12px] tracking-widest text-slate-400 flex items-center justify-center gap-2">
                <LockClosedIcon className="h-3.5 w-3.5" /> PRIVACY GUARANTEED · LOCAL PROCESSING ONLY
              </div>
            </div>
          </div>
        )}

        {/* Verify Section */}
        {tab === 'verify' && (
          <div className="card-dark rounded-[16px] overflow-hidden">
            {/* Header bar */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-300/20 flex items-center justify-center" style={{ boxShadow: 'var(--tc-shadow-glow-cyan-soft)' }}>
                  <ShieldCheckIcon className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <div className="text-slate-100 text-xl font-semibold">Verify Authenticity</div>
                  <div className="text-slate-400 text-[12px] tracking-widest mt-1">
                    UPLOAD <span className="mx-2">→</span> HASH <span className="mx-2">→</span> COMPARE <span className="mx-2">→</span> VERIFY <span className="mx-2">→</span> AUTHENTICATE
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-sm uppercase tracking-wider">
                <EyeIcon className="h-4 w-4" /> ANALYZE
              </div>
            </div>
            <VerifyInline />
          </div>
        )}
      </div>
    </div>
  );
}

function VerifyInline() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<null | { isAuthentic: boolean; proof?: BlockchainProof; hash: string }>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputId = 'inline-verify-file';
  const { verifyProof, isContractReady, clearError } = useBlockchain();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB.'); return; }
    if (!isContractReady()) { setError('Smart contract not configured.'); return; }
    setError(null); setResult(null); setIsProcessing(true); clearError();
    try {
      const hash = await hashImageFile(file);
      const proof = await verifyProof(hash);
      setResult({ isAuthentic: proof.exists, proof: proof.exists ? proof : undefined, hash });
    } catch (e: any) {
      setError(e?.message || 'Failed to verify image.');
    } finally { setIsProcessing(false); }
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  return (
    <div className="p-10">
      <div className="mx-auto w-full max-w-2xl">
        {!result ? (
          <div
            className={`relative overflow-hidden rounded-[16px] border-2 border-dashed transition-colors text-center ${
              isDragging ? 'border-emerald-400/40 bg-emerald-500/5' : 'border-white/20 bg-white/5'
            } backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] p-10`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={onDrop}
          >
            {isProcessing ? (
              <div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-2 border-white/20 border-t-white mb-4 mx-auto"></div>
                <p className="text-slate-300 text-sm sm:text-base">Verifying image on blockchain...</p>
              </div>
            ) : (
              <div>
                <DocumentMagnifyingGlassIcon className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                <h2 className="text-slate-100 text-xl sm:text-2xl mb-2">Verify Image Authenticity</h2>
                <p className="text-slate-300 text-sm sm:text-base mb-6">Drag and drop an image here, or click to select a file to verify against blockchain proofs.</p>
                <input id={fileInputId} type="file" accept="image/*" className="hidden" onChange={onInput} />
                <label htmlFor={fileInputId} className="inline-flex items-center gap-2 cta-dark px-6 py-3 text-sm cursor-pointer">
                  <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                  Select Image to Verify
                </label>
                <div className="mt-6 text-xs text-emerald-300/80">Supports JPG, PNG, WebP (max 10MB)</div>
                {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg max-w-md mx-auto">{error}</div>}
              </div>
            )}
          </div>
        ) : (
          <div className={`relative overflow-hidden rounded-[16px] border backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8 ${
            result.isAuthentic ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border ${result.isAuthentic ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                {result.isAuthentic ? '✅' : '❌'}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl sm:text-2xl font-medium mb-2 ${result.isAuthentic ? 'text-emerald-200' : 'text-red-200'}`}>
                  {result.isAuthentic ? 'Image Verified ✓' : 'Image Not Found ✗'}
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Image Hash</label>
                  <code className={`code-block block text-xs sm:text-sm ${result.isAuthentic ? 'text-emerald-200' : 'text-red-200'}`}>{result.hash}</code>
                </div>
                {result.isAuthentic && result.proof && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-300 mb-1">Submitter</label>
                      <div className="code-block text-emerald-200 text-xs sm:text-sm font-mono">{formatAddress(result.proof.submitter)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-300 mb-1">Timestamp</label>
                      <div className="code-block text-emerald-200 text-xs sm:text-sm">{formatTimestamp(result.proof.timestamp)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Removed inline camera component to rely on the stable /upload flow

