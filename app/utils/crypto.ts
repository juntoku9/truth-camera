// Utility functions for image hashing and verification

export interface ProofRecord {
  id: string;
  imageHash: string;
  fileName: string;
  fileSize: number;
  metadata: {
    timestamp: string;
    deviceInfo: string;
  };
  createdAt: string;
}

// Generate SHA-256 hash of image file
export async function hashImageFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

// Mock database operations using localStorage
const STORAGE_KEY = 'truth-camera-proofs';

export function saveProof(proof: ProofRecord): void {
  const existingProofs = getStoredProofs();
  const updatedProofs = [...existingProofs, proof];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProofs));
}

export function getStoredProofs(): ProofRecord[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function findProofByHash(hash: string): ProofRecord | null {
  const proofs = getStoredProofs();
  return proofs.find(proof => proof.imageHash === hash) || null;
}

export function getAllProofs(): ProofRecord[] {
  return getStoredProofs();
}

// Create proof record from file
export async function createProofRecord(file: File): Promise<ProofRecord> {
  const hash = await hashImageFile(file);
  const id = generateId();
  
  return {
    id,
    imageHash: hash,
    fileName: file.name,
    fileSize: file.size,
    metadata: {
      timestamp: new Date().toISOString(),
      deviceInfo: navigator.userAgent,
    },
    createdAt: new Date().toISOString(),
  };
} 