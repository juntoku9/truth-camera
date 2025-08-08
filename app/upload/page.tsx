'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CameraIcon, CheckCircleIcon, DocumentDuplicateIcon, PhotoIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { createProofRecord, saveProof, type ProofRecord } from '../utils/crypto';

export default function UploadPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [proof, setProof] = useState<ProofRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [captureLog, setCaptureLog] = useState<string>('');
  const [videoDebug, setVideoDebug] = useState<{readyState:number; vw:number; vh:number; track?:string}>({readyState: -1, vw: 0, vh: 0});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Live debug for video/track state
  useEffect(() => {
    if (!isCameraActive) return;
    const id = setInterval(() => {
      const v = videoRef.current;
      const s = streamRef.current;
      const track = s?.getVideoTracks?.()[0];
      setVideoDebug({
        readyState: v ? v.readyState : -1,
        vw: v?.videoWidth || 0,
        vh: v?.videoHeight || 0,
        track: track ? `${track.readyState}${track.muted ? ' (muted)' : ''}` : 'none',
      });
    }, 500);
    return () => clearInterval(id);
  }, [isCameraActive]);

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
      
      if (videoRef.current) {
        console.log('Setting video source...');
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        // Simple play attempt
        try {
          await videoRef.current.play();
          console.log('Video playing');
        } catch (playError) {
          console.warn('Play failed, but continuing:', playError);
        }
      }
      
      // Set camera as active
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
      setCaptureLog('');
      setCaptureLog('capture clicked');

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas) {
        setError('Internal error: canvas not ready.');
        setCaptureLog('Canvas not ready');
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
                setCaptureLog('Using ImageCapture.takePhoto');
                console.log('Using ImageCapture.takePhoto');
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
                  console.log('Captured (takePhoto) size:', Math.round(dataUrl.length / 1024), 'KB');
                  setCaptureLog(`takePhoto OK (${Math.round(dataUrl.length / 1024)} KB)`);
                  setCapturedImage(dataUrl);
                  stopCamera({ clearPhoto: false });
                  return;
                }
              }

              setCaptureLog('Using ImageCapture.grabFrame');
              console.log('Using ImageCapture.grabFrame');
              const bitmap: ImageBitmap = await withTimeout(imageCapture.grabFrame(), 1500, 'grabFrame');

              canvas.width = bitmap.width;
              canvas.height = bitmap.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                setError('Unable to process image. Please try again.');
                setCaptureLog('No 2D context');
                return;
              }
              ctx.drawImage(bitmap, 0, 0);
              const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
              console.log('Captured (ImageCapture) size:', Math.round(imageDataUrl.length / 1024), 'KB');
              if (!imageDataUrl.startsWith('data:image/')) {
                setError('Failed to capture image data.');
                setCaptureLog('Invalid data from grabFrame');
                return;
              }
              setCapturedImage(imageDataUrl);
              setCaptureLog(`grabFrame OK (${Math.round(imageDataUrl.length / 1024)} KB)`);
              stopCamera({ clearPhoto: false });
              return;
            } else {
              console.log('ImageCapture API not available; falling back to canvas draw from <video>.');
              setCaptureLog('ImageCapture not available');
            }
          } catch (icErr) {
            console.warn('ImageCapture failed, falling back to canvas draw:', icErr);
            setCaptureLog(`ImageCapture error: ${icErr instanceof Error ? icErr.message : String(icErr)}`);
          }
        }
      }

      // Fallback: draw from <video>
      if (!video) {
        setError('Camera not ready. Please try again.');
        setCaptureLog('No video element');
        return;
      }

      // Ensure the video has current data
      if (video.readyState < 2) {
        console.log('Video not ready (readyState:', video.readyState, ') attempting to play...');
        try { await video.play(); } catch {}
        // Wait briefly for a frame
        await new Promise(res => setTimeout(res, 200));
      }

      const width = video.videoWidth || video.clientWidth || 640;
      const height = video.videoHeight || video.clientHeight || 480;
      console.log('Fallback capture from <video> at', width, 'x', height);

      if (width <= 0 || height <= 0) {
        setError('Invalid camera dimensions. Please refresh camera.');
        setCaptureLog(`Invalid dimensions ${width}x${height}`);
        return;
      }

      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        setError('Unable to process image. Please try again.');
        setCaptureLog('No 2D context fallback');
        return;
      }
      context.drawImage(video, 0, 0, width, height);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      console.log('Captured (fallback) size:', Math.round(imageDataUrl.length / 1024), 'KB');
      if (!imageDataUrl.startsWith('data:image/')) {
        setError('Failed to capture image data.');
        setCaptureLog('Invalid data from fallback');
        return;
      }
      setCapturedImage(imageDataUrl);
      setCaptureLog(`fallback OK (${Math.round(imageDataUrl.length / 1024)} KB)`);
      stopCamera({ clearPhoto: false });
    } catch (err) {
      console.error('Error during photo capture:', err);
      setError(`Capture failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setCaptureLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [stopCamera]);

  const downloadImage = useCallback(() => {
    if (!capturedImage) return;

    // Create download link
    const link = document.createElement('a');
    link.download = `truth-camera-${new Date().toISOString().split('T')[0]}-${Date.now()}.jpg`;
    link.href = capturedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

    setError(null);
    setIsProcessing(true);

    try {
      const filename = `truth-camera-${Date.now()}.jpg`;
      const file = convertDataUrlToFile(capturedImage, filename);
      const proofRecord = await createProofRecord(file);
      saveProof(proofRecord);
      setProof(proofRecord);
      setCapturedImage(null);
    } catch (err) {
      setError('Failed to process captured image. Please try again.');
      console.error('Error creating proof:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          <Link
            href="/"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mr-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Take Authentic Photo
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
            <strong>Debug Info:</strong>
            <div>Camera Active: {isCameraActive ? 'Yes' : 'No'}</div>
            <div>Captured Image: {capturedImage ? `Yes (${Math.round(capturedImage.length / 1024)}KB)` : 'No'}</div>
            <div>Processing: {isProcessing ? 'Yes' : 'No'}</div>
            <div>Proof Generated: {proof ? 'Yes' : 'No'}</div>
            <div>Error: {error || 'None'}</div>
            <div>Camera Error: {cameraError || 'None'}</div>
            {captureLog && <div>Capture: {captureLog}</div>}
            <div>Video Debug: {JSON.stringify(videoDebug)}</div>
          </div>

          {!proof ? (
            <>
              {/* Camera Interface */}
              {!isCameraActive && !capturedImage && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                  <div className="text-center">
                    <CameraIcon className="h-16 w-16 sm:h-20 sm:w-20 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                      Truth Camera - Direct Capture Only
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base">
                      Capture an authentic image directly from your camera. No file uploads allowed to ensure maximum security and prevent tampering.
                    </p>
                    <button
                      onClick={startCamera}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto text-lg"
                    >
                      <CameraIcon className="h-6 w-6" />
                      Start Camera
                    </button>
                    
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        🔒 <strong>Security Note:</strong> This app only accepts direct camera capture to ensure image authenticity. 
                        Pre-existing files cannot be uploaded to prevent manipulation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Camera Error */}
              {cameraError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    Camera Access Required
                  </h3>
                  <p className="text-red-600 dark:text-red-400 text-sm sm:text-base mb-4">
                    {cameraError}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setCameraError(null);
                        startCamera();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Try Camera Again
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Refresh Page
                    </button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200 text-xs sm:text-sm">
                      <strong>Need help?</strong> Make sure your browser has camera permissions enabled and no other apps are using your camera.
                    </p>
                  </div>
                </div>
              )}

              {/* Camera View */}
              {isCameraActive && (
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-64 sm:h-80 bg-gray-800 object-cover"
                      playsInline
                      muted
                      autoPlay
                      controls={false}
                      style={{ minHeight: '200px', display: 'block' }}
                    />
                    <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/70 m-4 rounded-lg"></div>
                    
                    {/* Camera info overlay */}
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                      Camera Active
                    </div>
                    
                    {/* Refresh button overlay */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={refreshVideo}
                        className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg transition-colors text-sm"
                        title="Refresh video if black"
                      >
                        🔄 Refresh
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-center text-gray-600 dark:text-gray-300 mb-4 text-sm">
                      Position yourself in the frame and click capture when ready. If the video is black, click the refresh button above.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={capturePhoto}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-lg"
                      >
                        <PhotoIcon className="h-6 w-6" />
                        Capture Photo
                      </button>
                      <button
                        onClick={() => stopCamera({ clearPhoto: true })}
                        className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <XMarkIcon className="h-5 w-5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Captured Image Preview */}
              {capturedImage && (
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                  <div className="relative group">
                    <img
                      src={capturedImage}
                      alt="Captured authentic photo"
                      className="w-full h-64 sm:h-80 object-cover"
                      onLoad={() => console.log('Captured image loaded successfully')}
                      onError={(e) => {
                        console.error('Error loading captured image:', e);
                        console.error('Image src length:', capturedImage?.length);
                        console.error('Image src preview:', capturedImage?.substring(0, 100));
                      }}
                    />
                    {/* Image info overlay */}
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                      Authentic Photo Captured
                    </div>
                    {/* Download overlay button */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={downloadImage}
                        className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                        title="Download image"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                      Review Your Authentic Photo
                    </h3>
                    
                    {/* Image details */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block">Captured</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block">Size</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {Math.round((capturedImage.length * 0.75) / 1024)} KB
                          </span>
                        </div>
                      </div>
                    </div>

                    {isProcessing ? (
                      <div className="flex flex-col items-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                        <p className="text-gray-600 dark:text-gray-300">Generating cryptographic proof...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          onClick={downloadImage}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                          Download
                        </button>
                        <button
                          onClick={processCapturedImage}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-center"
                        >
                          Generate Proof
                        </button>
                        <button
                          onClick={retakePhoto}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-center"
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
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">{error}</p>
                </div>
              )}
            </>
          ) : (
            /* Proof Results */
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400 mr-3" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Authentic Photo Verified
                </h2>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Image Hash */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image Hash (SHA-256)
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs sm:text-sm font-mono break-all">
                      {proof.imageHash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(proof.imageHash)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      title="Copy hash"
                    >
                      <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Proof ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Proof ID
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs sm:text-sm font-mono break-all">
                      {proof.id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(proof.id)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      title="Copy ID"
                    >
                      <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* File Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Name
                    </label>
                    <p className="text-gray-900 dark:text-white text-sm sm:text-base">{proof.fileName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Size
                    </label>
                    <p className="text-gray-900 dark:text-white text-sm sm:text-base">{formatFileSize(proof.fileSize)}</p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timestamp
                    </label>
                    <p className="text-gray-900 dark:text-white text-sm sm:text-base">{formatDate(proof.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Authenticity Status
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Camera Verified ✓
                    </span>
                  </div>
                </div>

                {/* Verification URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs sm:text-sm font-mono break-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/verify/${proof.imageHash}` : ''}
                    </code>
                    <button
                      onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${proof.imageHash}`)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      title="Copy verification link"
                    >
                      <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                  <button
                    onClick={() => setProof(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Take Another Photo
                  </button>
                  <Link
                    href="/verify"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
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