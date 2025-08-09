'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CameraIcon, CheckCircleIcon, DocumentDuplicateIcon, PhotoIcon, XMarkIcon, ArrowDownTrayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { hashImageFile } from '../utils/crypto';
import { useBlockchain } from '../hooks/useBlockchain';
import { WalletConnect, WalletStatus } from '../components/WalletConnect';
import { formatAddress, formatTimestamp } from '../utils/blockchain';

interface BlockchainProofResult {
  hash: string;
  transactionHash: string;
  submitter: string;
  timestamp: number;
}

export default function UploadPage() {
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

  // Blockchain hook
  const {
    isConnected,
    address,
    isLoading: isBlockchainLoading,
    error: blockchainError,
    submitProof,
    isContractReady,
    canSubmitProofs,
    getContractAddress,
    clearError
  } = useBlockchain();

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Debug captured image state
  useEffect(() => {
    if (capturedImage) {
      console.log('Captured image state updated, length:', capturedImage.length);
      console.log('Image preview (first 100 chars):', capturedImage.substring(0, 100));
    } else {
      console.log('Captured image state cleared');
    }
  }, [capturedImage]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    
    try {
      console.log('Starting camera...');
      
      const constraints = { 
        video: true,
        audio: false 
      };

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got stream with', stream.getVideoTracks().length, 'video tracks');
      
      streamRef.current = stream;
      
      // Mark camera as active so the <video> mounts, then an effect will attach the stream
      setIsCameraActive(true);
      setError(null);
      setCameraError(null);
      
      console.log('Camera setup complete');
    } catch (err: any) {
      console.error('Camera error:', err);
      
      let errorMessage = 'Camera access failed. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions in your browser and refresh the page.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found. Please connect a camera and try again.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is busy. Please close other camera applications and try again.';
      } else {
        errorMessage += `${err.message || 'Unknown error'}. Please check your camera and browser settings.`;
      }
      
      setCameraError(errorMessage);
      setIsCameraActive(false);
    }
  }, []);

  // Attach stream to video element after it mounts to ensure preview is visible
  useEffect(() => {
    const attach = async () => {
      const video = videoRef.current;
      const stream = streamRef.current;
      if (!isCameraActive || !video || !stream) return;
      try {
        console.log('Attaching stream to video...');
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.setAttribute('autoplay', 'true');
        video.muted = true;
        await video.play().catch((e) => console.warn('Video play warning:', e));
        console.log('Video preview should be visible now');
      } catch (e) {
        console.warn('Failed to attach stream to video:', e);
      }
    };
    attach();
  }, [isCameraActive]);

  // Auto-start camera when component mounts
  useEffect(() => {
    console.log('Auto-start camera effect triggered');
    const timer = setTimeout(() => {
      console.log('Auto-starting camera...');
      startCamera();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const stopCamera = useCallback((options?: { clearPhoto?: boolean }) => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
    setIsCameraActive(false);
    if (options?.clearPhoto) {
      setCapturedImage(null);
    }
    setCameraError(null);
  }, []);

  const capturePhoto = useCallback(async () => {
    try {
      setError(null);

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas) {
        setError('Internal error: canvas not ready.');
        return;
      }

      // Prefer grabbing a frame directly from the MediaStream track (works even if <video> is black)
      const stream = streamRef.current;
      if (stream) {
        const [track] = stream.getVideoTracks();
        if (track) {
          try {
            // @ts-ignore - ImageCapture may not be typed in TS lib
            const ImageCaptureCtor = (window as any).ImageCapture;
            if (ImageCaptureCtor && typeof ImageCaptureCtor === 'function') {
              const imageCapture = new ImageCaptureCtor(track);
              // Try takePhoto first (Blob), then fall back to grabFrame
              if (imageCapture.takePhoto) {
                let blob: Blob | null = null;
                try {
                  blob = await withTimeout<Blob>(imageCapture.takePhoto(), 1500, 'takePhoto');
                } catch {
                  blob = null;
                }
                if (blob instanceof Blob) {
                  const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                  });
                  setCapturedImage(dataUrl);
                  // Bring preview into view and ensure render
                  setTimeout(() => {
                    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 0);
                  stopCamera({ clearPhoto: false });
                  return;
                }
              }

              const bitmap: ImageBitmap = await withTimeout(imageCapture.grabFrame(), 1500, 'grabFrame');

              canvas.width = bitmap.width;
              canvas.height = bitmap.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                setError('Unable to process image. Please try again.');
                return;
              }
              ctx.drawImage(bitmap, 0, 0);
              const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
              if (!imageDataUrl.startsWith('data:image/')) {
                setError('Failed to capture image data.');
                return;
              }
              setCapturedImage(imageDataUrl);
              // Bring preview into view and ensure render
              setTimeout(() => {
                previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 0);
              stopCamera({ clearPhoto: false });
              return;
            } else {
            }
          } catch (icErr) {
            console.warn('ImageCapture failed, falling back to canvas draw:', icErr);
          }
        }
      }

      // Fallback: draw from <video>
      if (!video) {
        setError('Camera not ready. Please try again.');
        return;
      }

      // Ensure the video has current data
      if (video.readyState < 2) {
        try { await video.play(); } catch {}
        // Wait briefly for a frame
        await new Promise(res => setTimeout(res, 200));
      }

      const width = video.videoWidth || video.clientWidth || 640;
      const height = video.videoHeight || video.clientHeight || 480;

      if (width <= 0 || height <= 0) {
        setError('Invalid camera dimensions. Please refresh camera.');
        return;
      }

      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        setError('Unable to process image. Please try again.');
        return;
      }
      context.drawImage(video, 0, 0, width, height);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (!imageDataUrl.startsWith('data:image/')) {
        setError('Failed to capture image data.');
        return;
      }
      setCapturedImage(imageDataUrl);
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
      stopCamera({ clearPhoto: false });
    } catch (err) {
      setError(`Capture failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [stopCamera]);

  function isIOS(): boolean {
    if (typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent || (navigator as any).vendor || '';
    const isAppleTouchDevice = navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1;
    return /iPad|iPhone|iPod/.test(userAgent) || isAppleTouchDevice;
  }

  function dataUrlToBlob(dataUrl: string): Blob {
    const [header, data] = dataUrl.split(',');
    const mimeMatch = header.match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const byteString = atob(data);
    const byteNumbers = new Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteNumbers[i] = byteString.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }

  const downloadImage = useCallback(async () => {
    if (!capturedImage) return;

    const filename = `truth-camera-${new Date().toISOString().split('T')[0]}-${Date.now()}.jpg`;
    const blob = dataUrlToBlob(capturedImage);
    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });

    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Truth Camera', text: 'Captured with Truth Camera' });
        return;
      }
    } catch {
      // Ignore and fall through to link-based download
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    if (isIOS()) {
      link.target = '_blank';
      link.rel = 'noopener';
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }, [capturedImage]);

  const convertDataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Utility to timeout a promise
  const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)),
    ]) as T;
  };

  const processCapturedImage = async () => {
    if (!capturedImage) return;

    if (!isConnected) {
      setError('Please connect your wallet to submit proof to blockchain.');
      return;
    }

    if (!isContractReady()) {
      setError('Smart contract not configured. Please check the contract address in environment variables.');
      return;
    }

    if (!canSubmitProofs()) {
      setError('Wallet not properly connected for blockchain transactions. Please reconnect your wallet.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    clearError();

    try {
      const filename = `truth-camera-${Date.now()}.jpg`;
      const file = convertDataUrlToFile(capturedImage, filename);
      const imageHash = await hashImageFile(file);
      
      // Submit to blockchain
      const transactionHash = await submitProof(imageHash);
      
      setProof({
        hash: imageHash,
        transactionHash,
        submitter: address || '',
        timestamp: Math.floor(Date.now() / 1000)
      });
      setCapturedImage(null);
    } catch (err: any) {
      if (err.message.includes('already submitted')) {
        setError('This image hash has already been submitted to the blockchain.');
      } else if (err.message.includes('user rejected')) {
        setError('Transaction was cancelled by user.');
      } else if (err.message.includes('insufficient funds')) {
        setError('Insufficient funds for transaction. Please add ETH to your wallet.');
      } else {
        setError(`Failed to submit proof to blockchain: ${err.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const refreshVideo = () => {
    if (videoRef.current && streamRef.current) {
      const video = videoRef.current;
      console.log('Refreshing video display...');
      
      // Force video refresh
      video.style.display = 'none';
      video.offsetHeight; // Trigger reflow
      video.style.display = 'block';
      
      // Try to restart playback
      video.play().catch(console.warn);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Hero Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <Link
            href="/"
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Research Prototype
            </span>
            <WalletConnect />
          </div>
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">Truth Camera</h1>
          <p className="mt-3 text-sm sm:text-base text-gray-300">
            Minimal capture tool for blockchain-secured image provenance. Camera-only. No uploads.
          </p>
          <div className="mt-4">
            <WalletStatus />
          </div>
          {!isConnected && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg max-w-md mx-auto">
              <div className="flex items-center gap-2 text-yellow-300 text-sm">
                <ExclamationTriangleIcon className="h-4 w-4" />
                Connect wallet to submit proofs to blockchain
              </div>
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Contract Info */}
          {isContractReady() && (
            <div className="text-center text-xs text-gray-400">
              Contract: {formatAddress(getContractAddress())}
            </div>
          )}
          {!proof ? (
            <>
              {/* Idle State */}
              {!isCameraActive && !capturedImage && (
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] p-8">
                  <div className="text-center">
                    <CameraIcon className="h-16 w-16 sm:h-20 sm:w-20 text-blue-400/90 mx-auto mb-5" />
                    <h3 className="text-xl sm:text-2xl font-medium text-white mb-2">
                      Direct Capture Only
                    </h3>
                    <p className="text-gray-300/90 mb-6 text-sm sm:text-base">
                      Capture an authentic frame straight from your device sensor. No files, no drag-and-drop.
                    </p>
                    <button
                      onClick={startCamera}
                      className="mx-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-3 text-white font-medium shadow-lg shadow-blue-900/40 hover:from-blue-500 hover:to-indigo-500 transition-colors"
                    >
                      <CameraIcon className="h-5 w-5" />
                      Start Camera
                    </button>
                    <div className="mt-6 text-xs text-blue-300/80">
                      This is a minimal, tamper-resistant capture flow.
                    </div>
                  </div>
                </div>
              )}

              {/* Camera View */}
              {isCameraActive && (
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)]">
                  <div className="relative">
                    <div className="aspect-[16/10] w-full bg-black/70">
                      <video
                        ref={videoRef}
                        className="h-full w-full object-cover rounded-t-2xl"
                        playsInline
                        muted
                        autoPlay
                        controls={false}
                      />
                    </div>
                    {/* Subtle grid overlay */}
                    <div className="pointer-events-none absolute inset-0 rounded-t-2xl bg-[radial-gradient(circle_at_center,transparent_0,transparent_60%,rgba(255,255,255,0.04)_100%)]" />
                    <div className="absolute top-4 left-4 text-[11px] px-2 py-1 rounded-full bg-black/60 text-white/90 border border-white/10">
                      Camera Active
                    </div>
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={refreshVideo}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 border border-white/10"
                        title="Refresh video"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Sticky Action Bar */}
                  <div className="flex items-center justify-center gap-3 p-4 border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                    <button
                      onClick={capturePhoto}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-white font-medium shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-violet-500 transition-colors text-base"
                    >
                      <PhotoIcon className="h-5 w-5" />
                      Capture
                    </button>
                    <button
                      onClick={() => stopCamera({ clearPhoto: true })}
                      className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 border border-white/10"
                    >
                      <XMarkIcon className="h-5 w-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Captured Image Preview */}
              {capturedImage && (
                <div ref={previewRef} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)]">
                  <div className="relative">
                    <img
                      src={capturedImage}
                      alt="Captured authentic photo"
                      className="w-full aspect-[16/10] object-cover rounded-t-2xl"
                      key={capturedImage?.slice(0, 64)}
                      onLoad={() => console.log('Captured image loaded successfully')}
                      onError={(e) => {
                        console.error('Error loading captured image:', e);
                        console.error('Image src length:', capturedImage?.length);
                        console.error('Image src preview:', capturedImage?.substring(0, 100));
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-t-2xl bg-[radial-gradient(circle_at_center,transparent_0,transparent_60%,rgba(255,255,255,0.04)_100%)]" />
                    <div className="absolute top-4 left-4 text-[11px] px-2 py-1 rounded-full bg-black/60 text-white/90 border border-white/10">
                      Authentic Frame
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={downloadImage}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10"
                        title="Download image"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                      <div>
                        <div className="text-gray-400">Captured</div>
                        <div className="text-white/90">{new Date().toLocaleTimeString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Size</div>
                        <div className="text-white/90">{Math.round((capturedImage.length * 0.75) / 1024)} KB</div>
                      </div>
                    </div>
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-3 py-4 text-gray-200">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                        Generating cryptographic proof…
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          onClick={downloadImage}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white px-4 py-3 border border-white/10"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                          Download
                        </button>
                        <button
                          onClick={processCapturedImage}
                          disabled={isProcessing || isBlockchainLoading || !canSubmitProofs()}
                          className={`inline-flex items-center justify-center rounded-xl px-4 py-3 font-medium shadow-lg transition-colors ${
                            canSubmitProofs() && !isProcessing && !isBlockchainLoading
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-900/40'
                              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {isProcessing || isBlockchainLoading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2"></div>
                              Submitting...
                            </>
                          ) : canSubmitProofs() ? (
                            'Generate Proof'
                          ) : (
                            'Connect Wallet'
                          )}
                        </button>
                        <button
                          onClick={retakePhoto}
                          className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white px-4 py-3 border border-white/10"
                        >
                          Retake
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hidden canvas for image processing */}
              <canvas ref={canvasRef} className="hidden" />

              {error && (
                <div className="mt-2 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm">
                  {error}
                </div>
              )}
            </>
          ) : (
            /* Proof Results */
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <CheckCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 mr-3" />
                <h2 className="text-xl sm:text-2xl font-medium text-white">
                  Authentic Photo Verified
                </h2>
              </div>

              <div className="space-y-5">
                {/* Image Hash */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Image Hash (SHA-256)
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-xs sm:text-sm font-mono break-all text-gray-100">
                      {proof.hash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(proof.hash)}
                      className="flex-shrink-0 p-2 text-gray-300 hover:text-white"
                      title="Copy hash"
                    >
                      <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Transaction Hash */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Transaction Hash
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-xs sm:text-sm font-mono break-all text-gray-100">
                      {proof.transactionHash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(proof.transactionHash)}
                      className="flex-shrink-0 p-2 text-gray-300 hover:text-white"
                      title="Copy transaction hash"
                    >
                      <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Blockchain Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                      Submitter
                    </label>
                    <p className="text-gray-100 text-sm sm:text-base font-mono">{formatAddress(proof.submitter)}</p>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                      Timestamp
                    </label>
                    <p className="text-gray-100 text-sm sm:text-base">{formatTimestamp(proof.timestamp)}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Authenticity Status
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                    Blockchain Verified ✓
                  </span>
                </div>

                {/* Verification URL */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Verification Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-xs sm:text-sm font-mono break-all text-gray-100">
                      {typeof window !== 'undefined' ? `${window.location.origin}/verify/${proof.hash}` : ''}
                    </code>
                    <button
                      onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${proof.hash}`)}
                      className="flex-shrink-0 p-2 text-gray-300 hover:text-white"
                      title="Copy verification link"
                    >
                      <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                  <button
                    onClick={() => setProof(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors text-center"
                  >
                    Take Another Photo
                  </button>
                  <Link
                    href="/verify"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white transition-colors text-center"
                  >
                    Verify an Image
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 