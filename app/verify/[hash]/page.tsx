"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { findProofByHash, type ProofRecord } from '../../utils/crypto';

export default function VerifyHashPage() {
  const params = useParams();
  const hash = params.hash as string;
  const [proof, setProof] = useState<ProofRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hash) {
      const foundProof = findProofByHash(hash);
      setProof(foundProof);
      setIsLoading(false);
    }
  }, [hash]);

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-2 border-white/20 border-t-white mb-4 mx-auto"></div>
          <p className="text-gray-300 text-sm sm:text-base">Loading verification details…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-dark">
      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <Link
            href="/verify"
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Back to Verify</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Details
          </span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative card-dark p-6 sm:p-8">
            {proof ? (
              <>
                {/* Status Header */}
                <div className="flex items-center mb-6 sm:mb-8">
                  <CheckCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 mr-3" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-medium text-emerald-300">✅ Verified Image</h2>
                    <p className="text-gray-300 mt-1 text-sm sm:text-base">
                      This image is authentic and has been verified in your local store.
                    </p>
                  </div>
                </div>

                {/* Proof Details */}
                <div className="space-y-6 sm:space-y-8">
                  {/* Image Hash */}
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Image Hash (SHA-256)</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-xs sm:text-sm font-mono break-all text-gray-100">
                        {proof.imageHash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(proof.imageHash)}
                        className="flex-shrink-0 p-2 text-gray-300 hover:text-white"
                        title="Copy hash"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Proof ID */}
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Proof ID</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-xs sm:text-sm font-mono break-all text-gray-100">
                        {proof.id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(proof.id)}
                        className="flex-shrink-0 p-2 text-gray-300 hover:text-white"
                        title="Copy ID"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* File Information */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">File Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">File Name</label>
                        <p className="text-gray-100 bg-black/40 border border-white/10 p-3 rounded-lg text-sm sm:text-base">{proof.fileName}</p>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">File Size</label>
                        <p className="text-gray-100 bg-black/40 border border-white/10 p-3 rounded-lg text-sm sm:text-base">{formatFileSize(proof.fileSize)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp Information */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Timestamp Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Upload Date</label>
                        <p className="text-gray-100 bg-black/40 border border-white/10 p-3 rounded-lg text-sm sm:text-base">{formatDate(proof.createdAt)}</p>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Original Timestamp</label>
                        <p className="text-gray-100 bg-black/40 border border-white/10 p-3 rounded-lg text-sm sm:text-base">{formatDate(proof.metadata.timestamp)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Device Information</h3>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">User Agent</label>
                      <p className="text-gray-100 bg-black/40 border border-white/10 p-3 rounded-lg text-xs sm:text-sm font-mono break-all">{proof.metadata.deviceInfo}</p>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:p-6 text-emerald-200">
                    <div className="flex items-center mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-300 mr-2" />
                      <h4 className="text-base sm:text-lg font-medium">Verification Status</h4>
                    </div>
                    <p className="text-sm sm:text-base">This image is verified. The cryptographic hash matches your stored record.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Not Found */}
                <div className="flex items-center mb-6 sm:mb-8">
                  <XCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-red-400 mr-3" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-medium text-red-300">❌ Image Not Found</h2>
                    <p className="text-gray-300 mt-1 text-sm sm:text-base">This hash was not found in your local authenticity store.</p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Hash Display */}
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Searched Hash</label>
                    <code className="block bg-black/40 border border-white/10 p-3 rounded-lg text-xs sm:text-sm font-mono break-all text-gray-100">{hash}</code>
                  </div>

                  {/* Not Found Message */}
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 sm:p-6 text-red-200">
                    This hash was not found in your authenticity store.
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
              <Link href="/verify" className="px-4 py-2 rounded-full pill text-white/90 text-center">
                Verify Another Image
              </Link>
              <Link href="/start?tab=capture" className="px-4 py-2 rounded-full cta-dark text-white text-center">
                Take Photo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 