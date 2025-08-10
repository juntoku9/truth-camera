'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { WalletConnect } from '../components/WalletConnect';
import { TruthCamera } from '../components/TruthCamera';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-hero-dark">
      <div className="page-container mx-auto max-w-5xl py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <Link href="/" className="flex items-center text-cyan-300 hover:text-cyan-200 transition-colors">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-4"><WalletConnect /></div>
        </div>
        <TruthCamera autoStart={true} />
      </div>
    </div>
  );
}