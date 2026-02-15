import type { Address, PublicClient } from 'viem';

const DATA_URI_JSON_BASE64_PREFIX = 'data:application/json;base64,';

function parseAddress(value: string | undefined): Address | null {
  const raw = (value ?? '').trim();
  return /^0x[a-fA-F0-9]{40}$/.test(raw) ? (raw as Address) : null;
}

export const ERC8004_CONTRACT_ADDRESS = parseAddress(import.meta.env.ERC8004_CONTRACT_ADDRESS);

const identityRegistryErc8004Abi = [
  {
    type: 'event',
    name: 'Registered',
    inputs: [
      { indexed: true, name: 'agentId', type: 'uint256' },
      { indexed: false, name: 'agentURI', type: 'string' },
      { indexed: true, name: 'owner', type: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'tokenURI',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'string' }],
  },
] as const;

interface Erc8004TokenMetadata {
  name?: string;
}

export interface Erc8004AgentProfile {
  tokenId: bigint;
  name: string | null;
}

function decodeBase64Utf8(base64: string): string {
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return '';
}

function parseMetadataFromTokenUri(tokenUri: string): Erc8004TokenMetadata | null {
  if (!tokenUri.startsWith(DATA_URI_JSON_BASE64_PREFIX)) return null;
  const payload = tokenUri.slice(DATA_URI_JSON_BASE64_PREFIX.length);
  if (!payload) return null;

  try {
    const decoded = decodeBase64Utf8(payload);
    if (!decoded) return null;
    return JSON.parse(decoded) as Erc8004TokenMetadata;
  } catch {
    return null;
  }
}

export async function resolveAgentProfileFromErc8004(
  publicClient: PublicClient,
  agentAddress: Address,
): Promise<Erc8004AgentProfile | null> {
  if (!ERC8004_CONTRACT_ADDRESS) return null;

  try {
    const registeredEvents = await publicClient.getContractEvents({
      address: ERC8004_CONTRACT_ADDRESS,
      abi: identityRegistryErc8004Abi,
      eventName: 'Registered',
      args: { owner: agentAddress },
      fromBlock: 0n,
      toBlock: 'latest',
    });

    if (registeredEvents.length === 0) return null;

    const latestLog = registeredEvents[registeredEvents.length - 1];
    const tokenId = latestLog.args.agentId;
    if (tokenId === undefined) return null;

    const tokenUri = await publicClient.readContract({
      address: ERC8004_CONTRACT_ADDRESS,
      abi: identityRegistryErc8004Abi,
      functionName: 'tokenURI',
      args: [tokenId],
    });

    const metadata = parseMetadataFromTokenUri(tokenUri);
    const name = metadata?.name?.trim() || null;

    return {
      tokenId,
      name,
    };
  } catch {
    return null;
  }
}
