'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CameraIcon, CheckCircleIcon, DocumentDuplicateIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createProofRecord, saveProof, type ProofRecord } from '../utils/crypto';

export default function UploadPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [proof, setProof] = useState<ProofRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
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

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setVideoLoaded(false);
    
    try {
      console.log('Starting camera...');
      
      // Try the most basic constraints first
      const constraints = { 
        video: true,
        audio: false 
      };

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got stream:', stream);
      console.log('Video tracks:', stream.getVideoTracks().length);
      
      if (stream.getVideoTracks().length === 0) {
        throw new Error('No video tracks available');
      }
      
      streamRef.current = stream;
      setIsCameraActive(true);
      
      if (videoRef.current) {
        console.log('Setting video srcObject...');
        videoRef.current.srcObject = stream;
        
        // Set up a simple timeout to mark video as loaded
        const loadTimeout = setTimeout(() => {
          console.log('Video load timeout - marking as loaded');
          setVideoLoaded(true);
        }, 3000);
        
        // Try to detect when video is actually playing
        const checkVideoReady = () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            console.log('Video ready state:', videoRef.current.readyState);
            console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            clearTimeout(loadTimeout);
            setVideoLoaded(true);
          }
        };

        // Multiple event listeners to catch video ready state
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          checkVideoReady();
        };
        
        videoRef.current.onloadeddata = () => {
          console.log('Video data loaded');
          checkVideoReady();
        };
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play');
          checkVideoReady();
        };

        videoRef.current.onplaying = () => {
          console.log('Video is playing');
          clearTimeout(loadTimeout);
          setVideoLoaded(true);
        };

        videoRef.current.onerror = (err) => {
          console.error('Video error:', err);
          clearTimeout(loadTimeout);
          setCameraError('Video playback error. Please try again.');
        };

        // Force play the video
        console.log('Attempting to play video...');
        try {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('Video play succeeded');
          }
        } catch (playError) {
          console.warn('Video play failed:', playError);
          // Don't throw error, just log it - video might still work
        }

        // Additional check after a short delay
        setTimeout(checkVideoReady, 1000);
      }
      
      setError(null);
      setCameraError(null);
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

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Reset video element
    }
    setIsCameraActive(false);
    setCapturedImage(null);
    setCameraError(null);
    setVideoLoaded(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas not available');
      setError('Camera not ready. Please try again.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Canvas context not available');
      setError('Unable to process image. Please try again.');
      return;
    }

    // Use actual video dimensions or fallback
    const width = video.videoWidth || video.clientWidth || 640;
    const height = video.videoHeight || video.clientHeight || 480;
    
    console.log('Capturing photo with dimensions:', width, 'x', height);

    canvas.width = width;
    canvas.height = height;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, width, height);

    // Get the image data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    console.log('Image captured, size:', Math.round(imageDataUrl.length / 1024), 'KB');
    
    if (imageDataUrl.length < 1000) {
      setError('Failed to capture image. Please ensure your camera is working and try again.');
      return;
    }
    
    setCapturedImage(imageDataUrl);
    stopCamera();
  }, [stopCamera]);

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
                      className="w-full h-64 sm:h-80 bg-gray-900 object-cover"
                      playsInline
                      muted
                      autoPlay
                      style={{ minHeight: '200px' }}
                    />
                    {!videoLoaded && (
                      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2 mx-auto"></div>
                          <p className="text-sm">Loading camera...</p>
                          <p className="text-xs mt-1 text-gray-300">This may take a few seconds</p>
                        </div>
                      </div>
                    )}
                    {videoLoaded && (
                      <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/70 m-4 rounded-lg"></div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-lg"
                    >
                      <PhotoIcon className="h-6 w-6" />
                      {videoLoaded ? 'Capture Photo' : 'Loading...'}
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <XMarkIcon className="h-5 w-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Captured Image Preview */}
              {capturedImage && (
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                      Review Your Authentic Photo
                    </h3>
                    {isProcessing ? (
                      <div className="flex flex-col items-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                        <p className="text-gray-600 dark:text-gray-300">Generating cryptographic proof...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={processCapturedImage}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg"
                        >
                          Generate Proof
                        </button>
                        <button
                          onClick={retakePhoto}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          Retake Photo
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