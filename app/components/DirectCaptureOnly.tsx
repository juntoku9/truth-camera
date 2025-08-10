'use client';

import { CameraIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { WalletStatus } from '../components/WalletConnect';

type Props = {
  onStart: () => void;
  isConnected: boolean;
  cameraError?: string | null;
};

export default function DirectCaptureOnly({ onStart, isConnected, cameraError }: Props) {
  return (
    <div className="text-center py-6">
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
      <button onClick={onStart} className="mx-auto inline-flex items-center gap-2 cta-dark px-6 sm:px-8 py-3 text-sm">
        <CameraIcon className="h-5 w-5" /> Start Camera
      </button>
      {cameraError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg max-w-md mx-auto">{cameraError}</div>
      )}
    </div>
  );
}


