"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CloudArrowUpIcon, CheckCircleIcon, XCircleIcon, DocumentMagnifyingGlassIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { hashImageFile, findProofByHash, type ProofRecord } from '../utils/crypto';

interface VerificationResult {
  isAuthentic: boolean;
  proof?: ProofRecord;
  hash: string;
}

export default function VerifyPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    setError(null);
    setResult(null);
    setIsProcessing(true);

    try {
      const hash = await hashImageFile(file);
      const proof = findProofByHash(hash);
      
      setResult({
        isAuthentic: proof !== null,
        proof: proof || undefined,
        hash
      });
    } catch (err) {
      setError('Failed to verify image. Please try again.');
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

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  return (
    <div className="min-h-screen bg-hero-dark">
      <div className="container mx-auto px-4 py-8 sm:py-12">
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
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Verify
          </span>
        </div>

        <div className="max-w-3xl mx-auto">
          {!result ? (
            <>
              {/* Upload Area */}
              <div
                className={`card-dark p-10 text-center transition-all duration-300 ${
                  isDragging
                    ? 'ring-2 ring-emerald-400/40'
                    : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-2 border-white/20 border-t-white mb-4"></div>
                    <p className="text-base sm:text-lg text-slate-200">Verifying image…</p>
                    <p className="text-sm text-slate-400 mt-2">Checking against local proofs</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <DocumentMagnifyingGlassIcon className="h-12 w-12 sm:h-14 sm:w-14 text-cyan-300 mb-4" />
                    <h3 className="text-lg sm:text-xl font-medium text-slate-100 mb-2">Drop your image here to verify</h3>
                    <p className="text-slate-300 mb-6 text-sm sm:text-base">Or click to browse files</p>
                    <label className="cursor-pointer inline-flex items-center justify-center rounded-full cta-dark text-white px-6 py-3 font-medium w-full sm:w-auto">
                      Choose File
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileInput} />
                    </label>
                    <p className="text-xs sm:text-sm text-slate-400 mt-4">Supports: JPG, PNG, GIF, WEBP (Max: 10MB)</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm">
                  {error}
                </div>
              )}
            </>
          ) : (
            /* Verification Results */
            <div className="relative card-dark p-6 sm:p-8">
              <div className="flex items-center mb-6">
                {result.isAuthentic ? (
                  <>
                    <CheckCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 mr-3" />
                    <h2 className="text-xl sm:text-2xl font-medium text-emerald-300">✅ Image is Authentic</h2>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-red-400 mr-3" />
                    <h2 className="text-xl sm:text-2xl font-medium text-red-300">❌ Image Not Found</h2>
                  </>
                )}
              </div>

              <div className="space-y-5">
                {result.isAuthentic && result.proof ? (
                  <>
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200">
                      This image has been verified and exists in your local authenticity store.
                    </div>

                    {/* Original Proof Details */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Original Proof Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">File Name</label>
                          <p className="text-gray-100 text-sm sm:text-base">{result.proof.fileName}</p>
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">File Size</label>
                          <p className="text-gray-100 text-sm sm:text-base">{formatFileSize(result.proof.fileSize)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Upload Date</label>
                          <p className="text-gray-100 text-sm sm:text-base">{formatDate(result.proof.createdAt)}</p>
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Proof ID</label>
                          <p className="text-gray-100 font-mono text-xs sm:text-sm break-all">{result.proof.id}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200">
                    This image was not found in your local authenticity store.
                  </div>
                )}

                {/* Image Hash */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Image Hash (SHA-256)</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-xs sm:text-sm font-mono break-all text-gray-100">
                      {result.hash}
                    </code>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                  <button
                    onClick={() => setResult(null)}
                    className="px-4 py-2 rounded-full pill text-white/90 transition-colors text-center"
                  >
                    Verify Another Image
                  </button>
                  <Link
                    href="/start?tab=capture"
                    className="px-4 py-2 rounded-full cta-dark text-white transition-colors text-center"
                  >
                    Take Photo
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