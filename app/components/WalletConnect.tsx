"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { WalletIcon } from "@heroicons/react/24/outline";
import { useBlockchain } from "../hooks/useBlockchain";

export function WalletConnect() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { isConnected, address } = useBlockchain();

  const [hasInjected, setHasInjected] = useState(false);

  useEffect(() => {
    setHasInjected(typeof window !== "undefined" && !!(window as any).ethereum);
  }, []);

  const connectInjected = useCallback(async () => {
    const eth: any = (window as any).ethereum;
    if (!eth) return;
    try {
      await eth.request({ method: "eth_requestAccounts" });
    } catch {}
  }, []);

  if (!ready) {
    return (
      <button className="inline-flex items-center gap-2 rounded-xl bg-gray-600 text-gray-300 px-4 py-2 cursor-not-allowed">
        <WalletIcon className="h-4 w-4" />
        Loading...
      </button>
    );
  }

  // Show connected state (works for both Privy and injected)
  if (isConnected && address) {
    const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          {short}
        </div>
        {authenticated && (
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-sm text-white border border-white/10 transition-colors"
          >
            Sign out
          </button>
        )}
      </div>
    );
  }

  // Not connected: prefer injected wallet if available, else Privy login
  return (
    <div className="flex items-center gap-2">
      {hasInjected && (
        <button
          onClick={connectInjected}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-900/40 hover:from-blue-500 hover:to-indigo-500 transition-colors"
        >
          <WalletIcon className="h-4 w-4" />
          Connect Wallet
        </button>
      )}
      {!authenticated && (
        <button
          onClick={() => login()}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-sm text-white border border-white/10 transition-colors"
        >
          Sign in (Privy)
        </button>
      )}
    </div>
  );
}

export function WalletStatus() {
  const { ready } = usePrivy();
  const { isConnected, address } = useBlockchain();
  if (!ready) return null;
  if (!isConnected || !address) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-gray-400">
        <div className="w-2 h-2 rounded-full bg-red-400"></div>
        Not connected
      </div>
    );
  }
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return (
    <div className="inline-flex items-center gap-2 text-sm text-green-300">
      <div className="w-2 h-2 rounded-full bg-green-400"></div>
      {short}
    </div>
  );
}