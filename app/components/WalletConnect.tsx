'use client';

import { usePrivy } from '@privy-io/react-auth';
import { WalletIcon } from '@heroicons/react/24/outline';

export function WalletConnect() {
  const { ready, authenticated, login, logout } = usePrivy();

  if (!ready) {
    return (
      <button className="inline-flex items-center gap-2 rounded-xl bg-gray-600 text-gray-300 px-4 py-2 cursor-not-allowed">
        <WalletIcon className="h-4 w-4" />
        Loading...
      </button>
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={() => login()}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-900/40 hover:from-blue-500 hover:to-indigo-500 transition-colors"
      >
        <WalletIcon className="h-4 w-4" />
        Connect
      </button>
    );
  }

  return (
    <button
      onClick={() => logout()}
      className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-sm text-white border border-white/10 transition-colors"
    >
      Sign out
    </button>
  );
}

export function WalletStatus() {
  const { ready, authenticated, user } = usePrivy();

  if (!ready) return null;

  if (!authenticated) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-gray-400">
        <div className="w-2 h-2 rounded-full bg-red-400"></div>
        Not connected
      </div>
    );
  }

  const linked = (user as any)?.linkedAccounts || [];
  const linkedWallet = linked.find((a: any) => a.type === 'wallet');
  const addr = ((user as any)?.wallet as any)?.address || (linkedWallet as any)?.address || '';
  const short = addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : 'Connected';
  return (
    <div className="inline-flex items-center gap-2 text-sm text-green-300">
      <div className="w-2 h-2 rounded-full bg-green-400"></div>
      {short}
    </div>
  );
} 