'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CloudArrowUpIcon, CheckCircleIcon, XCircleIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    // Validate file size (10MB max)
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
            Verify Image Authenticity
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {!result ? (
            <>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mb-4"></div>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                      Verifying image...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Checking against authenticity database
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <DocumentMagnifyingGlassIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Drop your image here to verify
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base">
                      Or click to browse files
                    </p>
                    <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto text-center">
                      Choose File
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileInput}
                      />
                    </label>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Supports: JPG, PNG, GIF, WEBP (Max: 10MB)
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">{error}</p>
                </div>
              )}
            </>
          ) : (
            /* Verification Results */
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                {result.isAuthentic ? (
                  <>
                    <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400 mr-3" />
                    <h2 className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      ✅ Image is Authentic
                    </h2>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400 mr-3" />
                    <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                      ❌ Image Not Found
                    </h2>
                  </>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6">
                {result.isAuthentic && result.proof ? (
                  <>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-green-800 dark:text-green-200 text-sm sm:text-base">
                        This image has been verified and exists in our authenticity database. 
                        It has not been tampered with since it was originally uploaded.
                      </p>
                    </div>

                    {/* Original Proof Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Original Proof Details
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            File Name
                          </label>
                          <p className="text-gray-900 dark:text-white text-sm sm:text-base">{result.proof.fileName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            File Size
                          </label>
                          <p className="text-gray-900 dark:text-white text-sm sm:text-base">{formatFileSize(result.proof.fileSize)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Upload Date
                          </label>
                          <p className="text-gray-900 dark:text-white text-sm sm:text-base">{formatDate(result.proof.createdAt)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Proof ID
                          </label>
                          <p className="text-gray-900 dark:text-white font-mono text-xs sm:text-sm break-all">{result.proof.id}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200 mb-4 text-sm sm:text-base">
                      This image was not found in our authenticity database. This could mean:
                    </p>
                    <ul className="text-red-700 dark:text-red-300 text-sm list-disc list-inside space-y-1">
                      <li>The image has never been uploaded to Truth Camera</li>
                      <li>The image has been modified or tampered with</li>
                      <li>The image is a different format or resolution than the original</li>
                    </ul>
                  </div>
                )}

                {/* Image Hash */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image Hash (SHA-256)
                  </label>
                  <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs sm:text-sm font-mono break-all">
                    {result.hash}
                  </code>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                  <button
                    onClick={() => setResult(null)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                  >
                    Verify Another Image
                  </button>
                  <Link
                    href="/upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
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