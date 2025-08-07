'use client';

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Loading verification details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          <Link
            href="/verify"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mr-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Back to Verify</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Verification Details
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            {proof ? (
              <>
                {/* Status Header */}
                <div className="flex items-center mb-6 sm:mb-8">
                  <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400 mr-3" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      ✅ Verified Image
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                      This image is authentic and has been verified in our database.
                    </p>
                  </div>
                </div>

                {/* Proof Details */}
                <div className="space-y-6 sm:space-y-8">
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

                  {/* File Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      File Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          File Name
                        </label>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm sm:text-base">
                          {proof.fileName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          File Size
                        </label>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm sm:text-base">
                          {formatFileSize(proof.fileSize)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Timestamp Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Upload Date
                        </label>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm sm:text-base">
                          {formatDate(proof.createdAt)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Original Timestamp
                        </label>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm sm:text-base">
                          {formatDate(proof.metadata.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Device Information
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        User Agent
                      </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-xs sm:text-sm font-mono break-all">
                        {proof.metadata.deviceInfo}
                      </p>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <h4 className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-200">
                        Verification Status
                      </h4>
                    </div>
                    <p className="text-green-700 dark:text-green-300 text-sm sm:text-base">
                      This image has been successfully verified. The cryptographic hash matches our database records, 
                      confirming that this image has not been tampered with since its original upload.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Not Found */}
                <div className="flex items-center mb-6 sm:mb-8">
                  <XCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400 mr-3" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                      ❌ Image Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                      This hash was not found in our authenticity database.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Hash Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Searched Hash
                    </label>
                    <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs sm:text-sm font-mono break-all">
                      {hash}
                    </code>
                  </div>

                  {/* Not Found Message */}
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
                      What does this mean?
                    </h4>
                    <p className="text-red-700 dark:text-red-300 mb-4 text-sm sm:text-base">
                      This hash was not found in our authenticity database. This could indicate:
                    </p>
                    <ul className="text-red-700 dark:text-red-300 text-sm list-disc list-inside space-y-1">
                      <li>The image has never been uploaded to Truth Camera</li>
                      <li>The image has been modified, compressed, or altered in some way</li>
                      <li>The hash was incorrectly generated or copied</li>
                      <li>The image format or metadata has changed</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/verify"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Verify Another Image
              </Link>
              <Link
                href="/upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Take Photo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 