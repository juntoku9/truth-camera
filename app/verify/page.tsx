'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, DocumentMagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { hashImageFile } from '../utils/crypto';
import { useBlockchain } from '../hooks/useBlockchain';
import { WalletConnect, WalletStatus } from '../components/WalletConnect';
import { formatAddress, formatTimestamp, type BlockchainProof } from '../utils/blockchain';

interface VerificationResult {
  isAuthentic: boolean;
  proof?: BlockchainProof;
  hash: string;
}

export default function VerifyPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Blockchain hook
  const {
    isConnected,
    isLoading: isBlockchainLoading,
    error: blockchainError,
    verifyProof,
    isContractReady,
    getContractAddress,
    clearError
  } = useBlockchain();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    if (!isContractReady()) {
      setError('Smart contract not configured. Please check the contract address.');
      return;
    }

    setError(null);
    setResult(null);
    setIsProcessing(true);
    clearError();

    try {
      const hash = await hashImageFile(file);
      const proof = await verifyProof(hash);
      
      setResult({
        isAuthentic: proof.exists,
        proof: proof.exists ? proof : undefined,
        hash
      });
    } catch (err: any) {
      setError(`Failed to verify image: ${err.message}`);
      console.error('Error verifying image:', err);
    } finally {
      setIsProcessing(false);
    }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
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
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">Verify Image</h1>
          <p className="mt-3 text-sm sm:text-base text-gray-300">
            Upload an image to verify its authenticity against blockchain proofs.
          </p>
          <div className="mt-4">
            <WalletStatus />
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Contract Info */}
          {isContractReady() && (
            <div className="text-center text-xs text-gray-400">
              Contract: {formatAddress(getContractAddress())}
            </div>
          )}

          {/* Upload Area */}
          <div
            className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-500/5'
                : 'border-white/20 bg-white/5'
            } backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] p-8 sm:p-12`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <DocumentMagnifyingGlassIcon className="h-16 w-16 sm:h-20 sm:w-20 text-emerald-400/90 mx-auto mb-5" />
              <h3 className="text-xl sm:text-2xl font-medium text-white mb-2">
                Verify Image Authenticity
              </h3>
              <p className="text-gray-300/90 mb-6 text-sm sm:text-base">
                Drag and drop an image here, or click to select a file to verify against blockchain proofs.
              </p>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 sm:px-8 py-3 text-white font-medium shadow-lg shadow-emerald-900/40 hover:from-emerald-400 hover:to-teal-500 transition-colors cursor-pointer"
              >
                <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                Select Image to Verify
              </label>
              
              <div className="mt-6 text-xs text-emerald-300/80">
                Supports JPG, PNG, WebP (max 10MB)
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-300 font-medium">Verification Error</h4>
                  <p className="text-red-200 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing State */}
          {(isProcessing || isBlockchainLoading) && (
            <div className="text-center py-8">
              <div className="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-2 border-white/20 border-t-white mb-4 mx-auto"></div>
              <p className="text-gray-300 text-sm sm:text-base">Verifying image on blockchain...</p>
            </div>
          )}

          {/* Verification Result */}
          {result && (
            <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8 ${
              result.isAuthentic
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-red-500/20 bg-red-500/5'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border ${
                  result.isAuthentic
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  {result.isAuthentic ? (
                    <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
                  ) : (
                    <XCircleIcon className="h-8 w-8 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl sm:text-2xl font-medium mb-2 ${
                    result.isAuthentic ? 'text-emerald-200' : 'text-red-200'
                  }`}>
                    {result.isAuthentic ? 'Image Verified ✓' : 'Image Not Found ✗'}
                  </h3>
                  <p className={`mb-6 text-sm sm:text-base ${
                    result.isAuthentic 
                      ? 'text-emerald-200/90' 
                      : 'text-red-200/90'
                  }`}>
                    {result.isAuthentic
                      ? 'This image has been verified and exists on the blockchain with authentic proof.'
                      : 'This image was not found in the blockchain records. It may not be authentic or was not registered.'}
                  </p>

                  {/* Image Hash */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Image Hash (SHA-256)</label>
                    <code className={`block px-3 py-2 rounded-lg text-xs sm:text-sm font-mono break-all border ${
                      result.isAuthentic
                        ? 'bg-black/20 border-emerald-500/20 text-emerald-200'
                        : 'bg-black/20 border-red-500/20 text-red-200'
                    }`}>
                      {result.hash}
                    </code>
                  </div>

                  {/* Proof Details */}
                  {result.isAuthentic && result.proof && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-emerald-300 mb-1">Submitter</label>
                          <div className="px-3 py-2 bg-black/20 border border-emerald-500/20 rounded-lg text-emerald-200 text-xs sm:text-sm font-mono">
                            {formatAddress(result.proof.submitter)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-emerald-300 mb-1">Timestamp</label>
                          <div className="px-3 py-2 bg-black/20 border border-emerald-500/20 rounded-lg text-emerald-200 text-xs sm:text-sm">
                            {formatTimestamp(result.proof.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Try Another */}
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setResult(null);
                        setError(null);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 text-white px-4 py-2 border border-white/10"
                    >
                      Verify Another Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 