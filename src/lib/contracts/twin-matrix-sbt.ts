import { BaseError, ContractFunctionRevertedError, type Address, type Hex } from 'viem';

const twinMatrixSbtAddress = (import.meta.env.TWIN_MATRIX_SBT_ADDRESS ?? '').trim();

if (!/^0x[a-fA-F0-9]{40}$/.test(twinMatrixSbtAddress)) {
  throw new Error('Missing or invalid TWIN_MATRIX_SBT_ADDRESS in .env');
}

export const TWIN_MATRIX_SBT_ADDRESS: Address = twinMatrixSbtAddress as Address;

export const twinMatrixSbtAbi = [
  { type: 'error', name: 'TokenNotFound', inputs: [] },
  { type: 'error', name: 'AlreadyMinted', inputs: [{ name: 'owner', type: 'address' }] },
  { type: 'error', name: 'NotTokenOwner', inputs: [] },
  { type: 'error', name: 'VersionOutOfRange', inputs: [] },
  { type: 'error', name: 'AgentNotBound', inputs: [] },
  { type: 'error', name: 'InvalidAgent', inputs: [] },
  { type: 'error', name: 'EmptyPermission', inputs: [] },
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'updateMatrix',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'newMatrix', type: 'bytes32[8]' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'tokenIdOf',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'latestVersion',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'uint32' }],
  },
  {
    type: 'function',
    name: 'getVersionCount',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getVersionMeta',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'version', type: 'uint32' },
    ],
    outputs: [
      { name: 'digest', type: 'bytes32' },
      { name: 'blockNumber', type: 'uint64' },
    ],
  },
  {
    type: 'function',
    name: 'getMatrixAtVersion',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'version', type: 'uint32' },
    ],
    outputs: [{ type: 'bytes32[8]' }],
  },
  {
    type: 'function',
    name: 'getLatestMatrix',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'bytes32[8]' }],
  },
  {
    type: 'function',
    name: 'getBoundAgents',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: 'agents', type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'permissionMaskOf',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'agent', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const;

export interface OnchainVersion {
  version: number;
  blockNumber: number;
  digest: Hex;
  matrix: number[];
}

export interface OnchainBoundAgent {
  name: string;
  address: Address;
  tokenId: bigint | null;
  permissionMask: bigint;
  permissionMaskBinary256: string;
  scopeGranted: number[];
  active: boolean;
}

export function permissionMaskToBinary256(mask: bigint): string {
  return mask.toString(2).padStart(256, '0');
}

export function permissionMaskToGrantedScope(mask: bigint): number[] {
  const granted: number[] = [];
  for (let bit = 0; bit < 256; bit++) {
    if (((mask >> BigInt(bit)) & 1n) === 1n) granted.push(bit);
  }
  return granted;
}

function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 255) return 255;
  return Math.round(value);
}

export function encodeSignatureToMatrix(signature: number[]): [Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex] {
  const normalized = Array.from({ length: 256 }, (_, i) => clampByte(signature[i] ?? 0));
  const words: Hex[] = [];

  for (let w = 0; w < 8; w++) {
    const start = w * 32;
    const bytes = normalized.slice(start, start + 32);
    const hex = `0x${bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')}` as Hex;
    words.push(hex);
  }

  return words as [Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex];
}

export function decodeMatrixToSignature(matrix: readonly Hex[]): number[] {
  const out: number[] = [];

  for (const word of matrix) {
    const raw = word.slice(2).padStart(64, '0');
    for (let i = 0; i < 64; i += 2) {
      out.push(parseInt(raw.slice(i, i + 2), 16));
    }
  }

  return out.slice(0, 256);
}

export function isTokenNotFoundError(error: unknown): boolean {
  if (error instanceof BaseError) {
    const reverted = error.walk((item) => item instanceof ContractFunctionRevertedError) as
      | ContractFunctionRevertedError
      | undefined;
    if (reverted?.data?.errorName === 'TokenNotFound') return true;
  }
  const text = String(error);
  return text.includes('TokenNotFound') || text.includes('0xcbdb7b30');
}
