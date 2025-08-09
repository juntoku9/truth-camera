'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CameraIcon, PhotoIcon, XMarkIcon, ArrowLeftIcon, ArrowDownTrayIcon, DocumentMagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, DocumentDuplicateIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { createProofRecord, saveProof, hashImageFile, findProofByHash, type ProofRecord } from '../utils/crypto';

type Tab = 'capture' | 'verify';

export default function StartPage() {
  const router = useRouter();
  const search = useSearchParams();
  const initialTab = (search.get('tab') as Tab) || 'capture';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Keep URL and state in sync
  useEffect(() => {
    const tab = (search.get('tab') as Tab) || 'capture';
    if (tab !== activeTab) setActiveTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const selectTab = (tab: Tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    router.replace(`/start?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-hero-dark">
      {/* Top nav */}
      <div className="sticky top-0 z-30 border-b border-slate-800/50 bg-slate-900/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shadow-sm">
              <CameraIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-slate-100 font-semibold leading-none">Truth Camera</div>
              <div className="text-[11px] text-slate-400 -mt-0.5">Cryptographic Verification</div>
            </div>
          </Link>
          <div className="hidden sm:flex items-center">
            <div className="tab-container-dark">
              <button onClick={() => selectTab('capture')} className={`tab-btn ${activeTab === 'capture' ? 'tab-btn-active' : ''}`}>
                <span className="inline-flex items-center gap-1.5"><CameraIcon className="h-4 w-4" /> Start Camera</span>
              </button>
              <button onClick={() => selectTab('verify')} className={`tab-btn ${activeTab === 'verify' ? 'tab-btn-active' : ''}`}>
                <span className="inline-flex items-center gap-1.5"><ShieldCheckIcon className="h-4 w-4" /> Verify Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Section header matching Figma */}
        <div className="card-dark p-6 sm:p-8 mb-6 sm:mb-10">
          <div className="flex items-center gap-3 justify-center">
            <div className={`h-10 w-10 rounded-2xl border ${activeTab === 'capture' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-400/30' : 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30'} flex items-center justify-center`}>
              {activeTab === 'capture' ? <CameraIcon className="h-6 w-6" /> : <ShieldCheckIcon className="h-6 w-6" />}
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">
              {activeTab === 'capture' ? 'Secure Capture' : 'Secure Verification'}
            </h2>
          </div>
          <p className="mt-3 text-center text-slate-400">{activeTab === 'capture' ? 'Direct sensor → SHA‑256 hash → zero‑knowledge storage' : 'Upload or drop → SHA‑256 hash → local proof match'}</p>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-8 tab-container-dark">
            <button
              onClick={() => selectTab('capture')}
              className={`tab-btn ${activeTab === 'capture' ? 'tab-btn-active' : ''}`}
            >
              Start Camera
            </button>
            <button
              onClick={() => selectTab('verify')}
              className={`tab-btn ${activeTab === 'verify' ? 'tab-btn-active' : ''}`}
            >
              Verify Image
            </button>
          </div>

          {activeTab === 'capture' ? <CaptureTab /> : <VerifyTab />}
        </div>
      </div>
    </div>
  );
}

function CaptureTab() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [proof, setProof] = useState<ProofRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to access camera');
    }
  }, []);

  useEffect(() => {
    const attach = async () => {
      const video = videoRef.current;
      const stream = streamRef.current;
      if (!isCameraActive || !video || !stream) return;
      try {
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;
        await video.play().catch(() => {});
      } catch {}
    };
    attach();
  }, [isCameraActive]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  }, [stopCamera]);

  function dataUrlToFile(dataUrl: string, filename: string): File {
    const [header, data] = dataUrl.split(',');
    const mimeMatch = header.match(/data:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(data);
    const u8 = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
    return new File([u8], filename, { type: mime });
  }

  const createProof = useCallback(async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    setError(null);
    try {
      const file = dataUrlToFile(capturedImage, `truth-camera-${Date.now()}.jpg`);
      const record = await createProofRecord(file);
      saveProof(record);
      setProof(record);
      setCapturedImage(null);
    } catch (e) {
      setError('Failed to generate proof');
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage]);

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="space-y-6">
      {!proof ? (
        <div className="relative card-dark p-6 sm:p-8">
          {/* Camera area or captured preview */}
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full aspect-[16/10] object-cover rounded-xl" />
          ) : (
            <div className="aspect-[16/10] w-full panel-dark flex items-center justify-center rounded-xl">
              {isCameraActive ? (
                <video ref={videoRef} className="h-full w-full object-cover rounded-xl" playsInline muted autoPlay />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-600">
                  <div className="flex flex-col items-center">
                    <CameraIcon className="h-8 w-8 mb-2 text-indigo-500" />
                    Ready to Capture
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 p-4">
            {!isCameraActive && !capturedImage && (
              <button onClick={startCamera} className="inline-flex items-center gap-2 rounded-full cta-gradient px-5 py-2.5 text-white font-medium shadow-md">
                <CameraIcon className="h-5 w-5" /> Start Camera
              </button>
            )}
            {isCameraActive && (
              <>
                <button onClick={capturePhoto} className="inline-flex items-center gap-2 rounded-full cta-gradient px-5 py-2.5 text-white font-medium">
                  <PhotoIcon className="h-5 w-5" /> Capture
                </button>
                <button onClick={() => stopCamera()} className="inline-flex items-center gap-2 rounded-full pill px-5 py-2.5">
                  <XMarkIcon className="h-5 w-5" /> Stop
                </button>
              </>
            )}
            {capturedImage && (
              <>
                <button onClick={createProof} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 font-medium shadow-md">
                  Generate Proof
                </button>
                <button onClick={() => { setCapturedImage(null); startCamera(); }} className="inline-flex items-center justify-center rounded-full pill px-4 py-2.5">
                  Retake
                </button>
              </>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
          {error && <div className="p-4 text-sm text-red-200 bg-red-500/10 border border-red-500/20">{error}</div>}
        </div>
      ) : (
        <div className="relative card-dark p-6">
          <div className="flex items-center mb-4">
            <CheckCircleIcon className="h-6 w-6 text-emerald-400 mr-3" />
            <h2 className="text-lg sm:text-xl font-medium text-white">Authentic Photo Verified</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Image Hash (SHA-256)</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-xs sm:text-sm font-mono break-all text-gray-100">{proof.imageHash}</code>
                <button onClick={() => copy(proof.imageHash)} className="p-2 text-gray-300 hover:text-white" title="Copy hash">
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setProof(null)} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10">Take Another Photo</button>
              <Link href="/verify" className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white">Verify an Image</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VerifyTab() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [proof, setProof] = useState<ProofRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const h = await hashImageFile(file);
      setHash(h);
      setProof(findProofByHash(h));
    } catch (e) {
      setError('Failed to verify image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  return (
    <div className="space-y-6">
      {!hash ? (
        <div
          className={`rounded-2xl p-10 text-center border transition-all duration-300 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] ${
            isDragging ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:bg-white/7'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={onDrop}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white mb-4"></div>
              <p className="text-base sm:text-lg text-gray-200">Verifying image…</p>
              <p className="text-sm text-gray-400 mt-2">Checking against local proofs</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <DocumentMagnifyingGlassIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-white mb-2">Drop your image here to verify</h3>
              <p className="text-gray-300 mb-6 text-sm sm:text-base">Or click to browse files</p>
              <label className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-6 py-3 font-medium shadow-lg shadow-emerald-900/40 w-full sm:w-auto">
                Choose File
                <input type="file" className="hidden" accept="image/*" onChange={onInput} />
              </label>
              <p className="text-xs sm:text-sm text-gray-400 mt-4">Supports: JPG, PNG, GIF, WEBP (Max: 10MB)</p>
            </div>
          )}
          {error && <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm">{error}</div>}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] p-6">
          <div className="flex items-center mb-6">
            {proof ? (
              <>
                <CheckCircleIcon className="h-6 w-6 text-emerald-400 mr-3" />
                <h2 className="text-xl font-medium text-emerald-300">Image is Authentic</h2>
              </>
            ) : (
              <>
                <XCircleIcon className="h-6 w-6 text-red-400 mr-3" />
                <h2 className="text-xl font-medium text-red-300">Image Not Found</h2>
              </>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Image Hash (SHA-256)</label>
              <code className="block bg-black/40 border border-white/10 p-3 rounded-lg text-xs sm:text-sm font-mono break-all text-gray-100">{hash}</code>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setHash(null); setProof(null); }} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10">Verify Another</button>
              <Link href="/upload" className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">Take Photo</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


