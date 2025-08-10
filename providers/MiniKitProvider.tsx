'use client';

import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { ReactNode } from 'react';
import { base } from 'wagmi/chains';

export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  const apiKey =
    process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY ||
    process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ||
    '';
  return (
    <MiniKitProvider
      apiKey={apiKey}
      chain={base}
      config={{
        appearance: {
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
          logo: process.env.NEXT_PUBLIC_ICON_URL,
          theme: 'mini-app-theme',
          mode: 'auto',
        },
      }}
    >
      {children}
    </MiniKitProvider>
  );
} 