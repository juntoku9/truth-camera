'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { WalletIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="flex items-center">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-900/40 hover:from-blue-500 hover:to-indigo-500 transition-colors"
                    >
                      <WalletIcon className="h-4 w-4" />
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                    >
                      Wrong network
                    </button>
                  );
                }

                return (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={openChainModal}
                      style={{ display: 'flex', alignItems: 'center' }}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm text-white border border-white/10 transition-colors"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 16, height: 16 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm text-white border border-white/10 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

// Simple wallet status component for other parts of the app
export function WalletStatus() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-gray-400">
        <div className="w-2 h-2 rounded-full bg-red-400"></div>
        Wallet not connected
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-sm text-green-300">
      <div className="w-2 h-2 rounded-full bg-green-400"></div>
      Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
    </div>
  );
} 