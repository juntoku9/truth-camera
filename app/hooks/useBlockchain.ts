"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import {
  TruthCameraContract,
  BlockchainProof,
  TRUTH_CAMERA_CONTRACT_ADDRESS,
} from "../utils/blockchain";

const BASE_CHAIN_ID_HEX = "0x2105";
const BASE_RPC_URL = "https://mainnet.base.org";
const BASE_EXPLORER = "https://basescan.org";

export function useBlockchain() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();

  // Privy connection state
  const connectedWallet = wallets?.[0];
  const privyAddress = connectedWallet?.address ?? "";
  const isPrivyConnected = !!(ready && authenticated && connectedWallet);

  // Injected provider (Coinbase Wallet / Smart Wallet inside Base App) state
  const [injectedConnected, setInjectedConnected] = useState(false);
  const [injectedAddress, setInjectedAddress] = useState("");

  const [contract, setContract] = useState<TruthCameraContract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: robustly get an EIP-1193 provider from Privy wallet
  const getWalletEip1193 = useCallback(async () => {
    if (!connectedWallet) return null;
    const w: any = connectedWallet;
    if (typeof w.getEIP1193Provider === "function") {
      try { return await w.getEIP1193Provider(); } catch {}
    }
    if (typeof w.getEthereumProvider === "function") {
      try { return await w.getEthereumProvider(); } catch {}
    }
    if (typeof w.getProvider === "function") {
      try { return await w.getProvider(); } catch {}
    }
    return null;
  }, [connectedWallet]);

  // Helper: get injected EIP-1193 provider (window.ethereum)
  const getInjectedEip1193 = useCallback((): any | null => {
    if (typeof window === "undefined") return null;
    const eth = (window as any).ethereum;
    if (eth && typeof eth.request === "function") return eth;
    return null;
  }, []);

  // Build an ethers Provider from Privy or injected provider, else fallback to public Base RPC
  const buildProvider = useCallback(async () => {
    const eip1193 = await getWalletEip1193();
    if (eip1193) {
      return new ethers.BrowserProvider(eip1193 as any);
    }
    const injected = getInjectedEip1193();
    if (injected) {
      return new ethers.BrowserProvider(injected as any);
    }
    // Fallback read-only provider for Base
    return new ethers.JsonRpcProvider(BASE_RPC_URL);
  }, [getWalletEip1193, getInjectedEip1193]);

  // Ensure Base mainnet on the connected wallet (no-ops for read-only)
  const ensureBase = useCallback(async (): Promise<boolean> => {
    try {
      const eip1193 = (await getWalletEip1193()) || getInjectedEip1193();
      if (!eip1193) return true; // read-only or no wallet provider; allow read
      const chainIdHex = await (eip1193 as any).request({ method: "eth_chainId" });
      if (chainIdHex?.toLowerCase() === BASE_CHAIN_ID_HEX.toLowerCase()) return true;
      try {
        await (eip1193 as any).request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BASE_CHAIN_ID_HEX }],
        });
        return true;
      } catch (switchErr: any) {
        if (switchErr?.code === 4902) {
          await (eip1193 as any).request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BASE_CHAIN_ID_HEX,
                chainName: "Base",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: [BASE_RPC_URL],
                blockExplorerUrls: [BASE_EXPLORER],
              },
            ],
          });
          await (eip1193 as any).request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_CHAIN_ID_HEX }],
          });
          return true;
        }
        throw switchErr;
      }
    } catch (err) {
      console.warn("Failed to ensure Base network:", err);
      setError("Wrong network. Please switch your wallet to Base.");
      return false;
    }
  }, [getWalletEip1193, getInjectedEip1193]);

  // Track injected provider connection state
  useEffect(() => {
    const injected = getInjectedEip1193();
    if (!injected) {
      setInjectedConnected(false);
      setInjectedAddress("");
      return;
    }

    let active = true;

    const updateFromAccounts = (accounts: string[]) => {
      if (!active) return;
      const addr = accounts?.[0] || "";
      setInjectedConnected(!!addr);
      setInjectedAddress(addr);
    };

    // Try passive read of accounts (won't prompt)
    injected.request({ method: "eth_accounts" })
      .then((accounts: string[]) => updateFromAccounts(accounts))
      .catch(() => updateFromAccounts([]));

    const onAccountsChanged = (accounts: string[]) => updateFromAccounts(accounts);
    injected.on?.("accountsChanged", onAccountsChanged);

    return () => {
      active = false;
      try { injected.removeListener?.("accountsChanged", onAccountsChanged); } catch {}
    };
  }, [getInjectedEip1193]);

  // Initialize (or reinitialize) the contract whenever connection changes
  useEffect(() => {
    const init = async () => {
      if (!TRUTH_CAMERA_CONTRACT_ADDRESS) {
        setError(
          "Contract address not configured. Set NEXT_PUBLIC_TRUTH_CAMERA_CONTRACT_ADDRESS in .env.local"
        );
        setContract(null);
        return;
      }
      try {
        const provider = await buildProvider();
        // Prioritize Privy signer if connected
        if (isPrivyConnected) {
          const eip1193 = await getWalletEip1193();
          if (eip1193) {
            const signer = await (new ethers.BrowserProvider(eip1193 as any)).getSigner();
            setContract(new TruthCameraContract(provider, signer));
          } else {
            setContract(new TruthCameraContract(provider));
          }
        } else if (injectedConnected) {
          const injected = getInjectedEip1193();
          if (injected) {
            const signer = await (new ethers.BrowserProvider(injected as any)).getSigner();
            setContract(new TruthCameraContract(provider, signer));
          } else {
            setContract(new TruthCameraContract(provider));
          }
        } else {
          setContract(new TruthCameraContract(provider));
        }
        setError(null);
      } catch (e: any) {
        console.error("Contract init error:", e);
        setError(e?.message || "Failed to initialize contract");
        setContract(null);
      }
    };
    init();
  }, [isPrivyConnected, connectedWallet, injectedConnected, buildProvider, getWalletEip1193, getInjectedEip1193]);

  // Submit proof to blockchain using Privy wallet signer
  const submitProof = useCallback(
    async (imageHash: string): Promise<string> => {
      if (!contract) throw new Error("Contract not initialized.");
      if (!isPrivyConnected && !injectedConnected) throw new Error("Wallet not connected.");

      const ok = await ensureBase();
      if (!ok) throw new Error("Please switch your wallet to Base.");

      // Sanity: ensure contract exists at address
      try {
        const provider = await buildProvider();
        const code = await provider.getCode(TRUTH_CAMERA_CONTRACT_ADDRESS);
        if (!code || code === "0x") {
          throw new Error(
            "Contract not found at configured address on Base. Please check NEXT_PUBLIC_TRUTH_CAMERA_CONTRACT_ADDRESS."
          );
        }
      } catch (existErr: any) {
        setError(existErr?.message || "Failed to verify contract deployment.");
        throw existErr;
      }

      setIsLoading(true);
      setError(null);
      try {
        const txHash = await contract.submitProof(imageHash);
        return txHash;
      } catch (err: any) {
        let errorMessage = "Transaction failed";
        if (err.message?.includes("user rejected")) errorMessage = "Transaction rejected by user";
        else if (err.message?.includes("already")) errorMessage = "This hash was already submitted";
        else if (err.message?.includes("insufficient funds")) errorMessage = "Insufficient funds for gas on Base";
        else if (err.reason) errorMessage = err.reason;
        else if (err.message) errorMessage = err.message;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [contract, isPrivyConnected, injectedConnected, ensureBase, buildProvider]
  );

  // Verify proof (read-only is fine)
  const verifyProof = useCallback(
    async (imageHash: string): Promise<BlockchainProof> => {
      if (!contract) throw new Error("Contract not initialized");
      setIsLoading(true);
      setError(null);
      try {
        const proof = await contract.verifyProof(imageHash);
        return proof;
      } catch (err: any) {
        const errorMessage = err.reason || err.message || "Verification failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const isContractReady = useCallback(
    () => !!(contract && TRUTH_CAMERA_CONTRACT_ADDRESS),
    [contract]
  );

  // Keep API shape stable: function that returns boolean
  const canSubmitProofs = useCallback(
    () => !!(contract && (isPrivyConnected || injectedConnected) && (privyAddress || injectedAddress)),
    [contract, isPrivyConnected, injectedConnected, privyAddress, injectedAddress]
  );

  const getContractAddress = useCallback(
    () => TRUTH_CAMERA_CONTRACT_ADDRESS,
    []
  );

  const isConnected = isPrivyConnected || injectedConnected;
  const address = (privyAddress || injectedAddress) as string;

  return {
    isConnected,
    address,
    isLoading,
    error,
    contract,
    submitProof,
    verifyProof,
    isContractReady,
    canSubmitProofs,
    getContractAddress,
    clearError: () => setError(null),
  };
} 