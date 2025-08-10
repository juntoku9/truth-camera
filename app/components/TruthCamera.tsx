'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { CameraIcon, PhotoIcon, XMarkIcon, ArrowDownTrayIcon, DocumentDuplicateIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { hashImageFile } from '../utils/crypto';
import { useBlockchain } from '../hooks/useBlockchain';
import { formatAddress, formatTimestamp, getExplorerTxUrl } from '../utils/blockchain';
import { WalletStatus } from '../components/WalletConnect';

type Props = {
  autoStart?: boolean;
};

interface BlockchainProofResult {
  hash: string;
  transactionHash: string;
  submitter: string;
  timestamp: number;
}

export function TruthCamera({ autoStart = false }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [proof, setProof] = useState<BlockchainProofResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    address,
    isLoading: isBlockchainLoading,
    submitProof,
    isContractReady,
    canSubmitProofs,
    clearError,
  } = useBlockchain();

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const constraints = { video: true, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraActive(true);
      setError(null);
      setCameraError(null);
    } catch (err: any) {
      let errorMessage = 'Camera access failed. ';
      if (err.name === 'NotAllowedError') errorMessage += 'Please allow camera permissions in your browser and refresh the page.';
      else if (err.name === 'NotFoundError') errorMessage += 'No camera found. Please connect a camera and try again.';
      else if (err.name === 'NotReadableError') errorMessage += 'Camera is busy. Please close other camera applications and try again.';
      else errorMessage += `${err.message || 'Unknown error'}.`;
      setCameraError(errorMessage);
      setIsCameraActive(false);
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
        video.setAttribute('muted', 'true');
        video.setAttribute('autoplay', 'true');
        (video as any).muted = true;
        await video.play().catch(() => {});
      } catch {}
    };
    attach();
  }, [isCameraActive]);

  useEffect(() => {
    if (!autoStart) return;
    const timer = setTimeout(() => { startCamera(); }, 400);
    return () => clearTimeout(timer);
  }, [autoStart, startCamera]);

  const stopCamera = useCallback((options?: { clearPhoto?: boolean }) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      (videoRef.current as any).srcObject = null;
      videoRef.current.load();
    }
    setIsCameraActive(false);
    if (options?.clearPhoto) setCapturedImage(null);
    setCameraError(null);
  }, []);

  const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)),
    ]) as T;
  };

  const capturePhoto = useCallback(async () => {
    try {
      setError(null);
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas) { setError('Internal error: canvas not ready.'); return; }

      const stream = streamRef.current;
      if (stream) {
        const [track] = stream.getVideoTracks();
        if (track) {
          try {
            const ImageCaptureCtor = (window as any).ImageCapture;
            if (ImageCaptureCtor && typeof ImageCaptureCtor === 'function') {
              const imageCapture = new ImageCaptureCtor(track);
              if (imageCapture.takePhoto) {
                let blob: Blob | null = null;
                try { blob = await withTimeout<Blob>(imageCapture.takePhoto(), 1500); } catch { blob = null; }
                if (blob instanceof Blob) {
                  const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                  });
                  setCapturedImage(dataUrl);
                  setTimeout(() => { previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 0);
                  stopCamera({ clearPhoto: false });
                  return;
                }
              }
              const bitmap: ImageBitmap = await withTimeout(imageCapture.grabFrame(), 1500);
              canvas.width = bitmap.width;
              canvas.height = bitmap.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) { setError('Unable to process image.'); return; }
              ctx.drawImage(bitmap, 0, 0);
              const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
              if (!imageDataUrl.startsWith('data:image/')) { setError('Failed to capture image data.'); return; }
              setCapturedImage(imageDataUrl);
              setTimeout(() => { previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 0);
              stopCamera({ clearPhoto: false });
              return;
            }
          } catch {}
        }
      }

      if (!video) { setError('Camera not ready.'); return; }
      if (video.readyState < 2) { try { await video.play(); } catch {} await new Promise((r) => setTimeout(r, 200)); }
      const width = (video as any).videoWidth || video.clientWidth || 640;
      const height = (video as any).videoHeight || video.clientHeight || 480;
      if (width <= 0 || height <= 0) { setError('Invalid camera dimensions.'); return; }
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) { setError('Unable to process image.'); return; }
      context.drawImage(video, 0, 0, width, height);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (!imageDataUrl.startsWith('data:image/')) { setError('Failed to capture image data.'); return; }
      setCapturedImage(imageDataUrl);
      setTimeout(() => { previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 0);
      stopCamera({ clearPhoto: false });
    } catch (err) {
      setError(`Capture failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [stopCamera]);

  function dataUrlToBlob(dataUrl: string): Blob {
    const [header, data] = dataUrl.split(',');
    const mimeMatch = header.match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const byteString = atob(data);
    const byteNumbers = new Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) byteNumbers[i] = byteString.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }

  const downloadWindowRef = useRef<Window | null>(null);
  const lastObjectUrlRef = useRef<string | null>(null);
  const [iosDownloadUrl, setIosDownloadUrl] = useState<string | null>(null);
  const [isDownloadHelpOpen, setIsDownloadHelpOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (downloadWindowRef.current && !downloadWindowRef.current.closed) {
        try { downloadWindowRef.current.close(); } catch {}
      }
      if (lastObjectUrlRef.current) {
        try { URL.revokeObjectURL(lastObjectUrlRef.current); } catch {}
      }
      if (iosDownloadUrl) {
        try { URL.revokeObjectURL(iosDownloadUrl); } catch {}
      }
    };
  }, [iosDownloadUrl]);

  const downloadImage = useCallback(async () => {
    if (!capturedImage) return;
    const filename = `truth-camera-${new Date().toISOString().split('T')[0]}-${Date.now()}.jpg`;
    const blob = dataUrlToBlob(capturedImage);
    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
    try {
      if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: 'Truth Camera', text: 'Captured with Truth Camera' });
        return;
      }
    } catch {}
    // iOS Safari does not honor download attr; open in a new tab
    const isIOS = (() => {
      if (typeof navigator === 'undefined') return false;
      const ua = navigator.userAgent || (navigator as any).vendor || '';
      const isAppleTouch = (navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1;
      return /iPad|iPhone|iPod/.test(ua) || isAppleTouch;
    })();
    const objectUrl = URL.createObjectURL(blob);
    lastObjectUrlRef.current = objectUrl;
    if (isIOS) {
      // Show our own lightweight modal to avoid the iOS popover getting stuck
      if (isDownloadHelpOpen) {
        // act as dismiss
        setIsDownloadHelpOpen(false);
        try { URL.revokeObjectURL(objectUrl); } catch {}
        return;
      }
      setIosDownloadUrl(objectUrl);
      setIsDownloadHelpOpen(true);
      return;
    }
    const link = document.createElement('a');
    link.href = objectUrl; link.download = filename;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }, [capturedImage]);

  const convertDataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const processCapturedImage = async () => {
    if (!capturedImage) return;
    if (!isConnected) { setError('Please connect your wallet to submit proof to blockchain.'); return; }
    if (!isContractReady()) { setError('Smart contract not configured. Please check the contract address in environment variables.'); return; }
    if (!canSubmitProofs()) { setError('Wallet not properly connected for blockchain transactions. Please reconnect your wallet.'); return; }
    setError(null); setIsProcessing(true); clearError();
    try {
      const filename = `truth-camera-${Date.now()}.jpg`;
      const file = convertDataUrlToFile(capturedImage, filename);
      const imageHash = await hashImageFile(file);
      const transactionHash = await submitProof(imageHash);
      setProof({ hash: imageHash, transactionHash, submitter: address || '', timestamp: Math.floor(Date.now() / 1000) });
      setCapturedImage(null);
    } catch (err: any) {
      if (err.message?.includes('already submitted')) setError('This image hash has already been submitted to the blockchain.');
      else if (err.message?.includes('user rejected')) setError('Transaction was cancelled by user.');
      else if (err.message?.includes('insufficient funds')) setError('Insufficient funds for transaction. Please add ETH to your wallet.');
      else setError(`Failed to submit proof to blockchain: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => { setCapturedImage(null); startCamera(); };
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="max-w-3xl mx-auto space-y-6 w-full">
      {!proof ? (
        <>
          {!isCameraActive && !capturedImage && (
            <div className="panel-dark rounded-[16px] p-8">
              <div className="text-center">
                <CameraIcon className="h-16 w-16 sm:h-20 sm:w-20 text-cyan-300 mx-auto mb-5" />
                <h3 className="text-xl sm:text-2xl font-medium text-slate-100 mt-2 sm:mt-3 mb-2">Direct Capture Only</h3>
                <p className="text-slate-300/90 mb-6 text-sm sm:text-base">Capture an authentic frame straight from your device sensor. No files, no drag-and-drop.</p>
                <div className="mb-4">
                  <WalletStatus />
                </div>
                {!isConnected && (
                  <div className="mb-6 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-yellow-300 text-sm justify-center">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      Connect wallet to submit proofs to blockchain
                    </div>
                  </div>
                )}
                <button onClick={startCamera} className="mx-auto inline-flex items-center gap-2 cta-dark px-6 sm:px-8 py-3 text-sm">
                  <CameraIcon className="h-5 w-5" /> Start Camera
                </button>
                {cameraError && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg max-w-md mx-auto">{cameraError}</div>}
              </div>
            </div>
          )}

          {isCameraActive && (
            <>
              {/* Wallet status above the camera */}
              <div className="mb-3 text-center">
                <div className="flex items-center justify-center">
                  <WalletStatus />
                </div>
                {!isConnected && (
                  <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-yellow-300 text-sm justify-center">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      Connect wallet to submit proofs to blockchain
                    </div>
                  </div>
                )}
              </div>
              <div className="card-dark overflow-hidden rounded-[16px]">
                <div className="relative">
                  <div className="panel-dark aspect-[16/10] w-full bg-black/70">
                    <video ref={videoRef} className="h-full w-full object-cover rounded-t-[16px]" playsInline muted autoPlay controls={false} />
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-t-[16px] bg-[radial-gradient(circle_at_center,transparent_0,transparent_60%,rgba(255,255,255,0.04)_100%)]" />
                  <div className="absolute top-4 left-4 text-[11px] px-2 py-1 rounded-full bg-black/60 text-white/90 border border-white/10">Camera Active</div>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                  <button onClick={capturePhoto} className="inline-flex items-center gap-2 cta-dark px-5 py-2.5 text-base">
                    <PhotoIcon className="h-5 w-5" /> Capture
                  </button>
                  <button onClick={() => stopCamera({ clearPhoto: true })} className="inline-flex items-center gap-2 pill px-5 py-2.5">
                    <XMarkIcon className="h-5 w-5" /> Cancel
                  </button>
                </div>
              </div>
            </>
          )}

          {capturedImage && (
            <div ref={previewRef} className="relative card-dark overflow-hidden rounded-[16px]">
              <div className="relative">
                <img src={capturedImage} alt="Captured authentic photo" className="w-full aspect-[16/10] object-cover rounded-t-[16px]" key={capturedImage?.slice(0, 64)} />
                <div className="pointer-events-none absolute inset-0 rounded-t-[16px] bg-[radial-gradient(circle_at_center,transparent_0,transparent_60%,rgba(255,255,255,0.04)_100%)]" />
                <div className="absolute top-4 left-4 text-[11px] px-2 py-1 rounded-full bg-black/60 text-white/90 border border-white/10">Authentic Frame</div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={downloadImage} className="p-2 rounded-lg pill" title="Download image">
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <div>
                    <div className="text-slate-400">Captured</div>
                    <div className="text-slate-100">{new Date().toLocaleTimeString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Size</div>
                    <div className="text-slate-100">{Math.round((capturedImage.length * 0.75) / 1024)} KB</div>
                  </div>
                </div>
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3 py-4 text-slate-200">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    Generating cryptographic proof…
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button onClick={downloadImage} className="inline-flex items-center justify-center gap-2 pill px-4 py-3">
                      <ArrowDownTrayIcon className="h-5 w-5" /> Download
                    </button>
                    <button onClick={processCapturedImage} disabled={isProcessing || isBlockchainLoading || !canSubmitProofs()} className={`inline-flex items-center justify-center px-4 py-3 font-medium transition-colors rounded-full ${canSubmitProofs() && !isProcessing && !isBlockchainLoading ? 'cta-dark text-white' : 'bg-gray-600 text-gray-300 cursor-not-allowed rounded-full'}`}>
                      {isProcessing || isBlockchainLoading ? (<><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2"></div> Submitting...</>) : (canSubmitProofs() ? 'Generate Proof' : 'Connect Wallet')}
                    </button>
                    <button onClick={retakePhoto} className="inline-flex items-center justify-center pill px-4 py-3">Retake</button>
                  </div>
                )}
              </div>
              {isDownloadHelpOpen && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
                  <div className="panel-dark rounded-[16px] p-5 max-w-sm mx-auto text-center">
                    <h4 className="text-slate-100 text-base mb-2">Download Image</h4>
                    <p className="text-slate-300 text-sm mb-4">Tap the button below to open the image in a new tab, then long-press to save. Tap Download again to dismiss this popup.</p>
                    <div className="flex items-center justify-center gap-3">
                      <a href={iosDownloadUrl ?? '#'} target="_blank" rel="noopener noreferrer" className="cta-dark px-4 py-2 text-sm">Open Image</a>
                      <button onClick={() => setIsDownloadHelpOpen(false)} className="pill px-4 py-2 text-sm">Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
          {error && <div className="mt-2 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm">{error}</div>}
        </>
      ) : (
        <div className="card-dark rounded-[16px] p-6 sm:p-8">
          <div className="flex items-center mb-6">
            <CheckCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 mr-3" />
            <h2 className="text-xl sm:text-2xl font-medium text-slate-100">Authentic Photo Proof Generated</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Image Hash (SHA-256)</label>
              <div className="flex items-center space-x-2">
                <code className="code-block flex-1 text-xs sm:text-sm">{proof.hash}</code>
                <button onClick={() => copyToClipboard(proof.hash)} className="flex-shrink-0 p-2 text-slate-300 hover:text-white" title="Copy hash">
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-1">Transaction Hash</label>
              <div className="flex items-center gap-2">
                <code className="code-block flex-1 text-emerald-200 text-xs sm:text-sm">{proof.transactionHash}</code>
                <a href={getExplorerTxUrl(proof.transactionHash)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-full cta-dark" title="Open in Basescan">Open</a>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Submitter</label>
                <p className="text-slate-100 text-sm sm:text-base font-mono">{formatAddress(proof.submitter)}</p>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Timestamp</label>
                <p className="text-slate-100 text-sm sm:text-base">{formatTimestamp(proof.timestamp)}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Authenticity Status</label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">Blockchain Verified ✓</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


