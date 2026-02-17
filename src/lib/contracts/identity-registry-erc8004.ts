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
    type: 'event',
    name: 'MetadataSet',
    inputs: [
      { indexed: true, name: 'agentId', type: 'uint256' },
      { indexed: true, name: 'indexedMetadataKey', type: 'string' },
      { indexed: false, name: 'metadataKey', type: 'string' },
      { indexed: false, name: 'metadataValue', type: 'bytes' },
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

function parseAddressFromBytes(value: `0x${string}`): Address | null {
  if (!value || value === '0x') return null;
  const raw = value.toLowerCase().replace(/^0x/, '');
  if (raw.length < 40) return null;
  const tail = raw.slice(-40);
  const candidate = `0x${tail}`;
  return /^0x[a-f0-9]{40}$/.test(candidate) ? (candidate as Address) : null;
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

    let tokenId: bigint | undefined;
    if (registeredEvents.length > 0) {
      const latestLog = registeredEvents[registeredEvents.length - 1];
      tokenId = latestLog.args.agentId;
    }

    // Fallback path: resolve tokenId from MetadataSet(agentWallet) events.
    if (tokenId === undefined) {
      const metadataEvents = await publicClient.getContractEvents({
        address: ERC8004_CONTRACT_ADDRESS,
        abi: identityRegistryErc8004Abi,
        eventName: 'MetadataSet',
        args: { indexedMetadataKey: 'agentWallet' },
        fromBlock: 0n,
        toBlock: 'latest',
      });

      for (let i = metadataEvents.length - 1; i >= 0; i--) {
        const event = metadataEvents[i];
        const value = event.args.metadataValue;
        if (!value) continue;
        const wallet = parseAddressFromBytes(value);
        if (!wallet) continue;
        if (wallet.toLowerCase() === agentAddress.toLowerCase()) {
          tokenId = event.args.agentId;
          break;
        }
      }
    }

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
