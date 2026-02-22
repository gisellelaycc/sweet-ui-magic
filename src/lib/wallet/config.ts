import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bscTestnet } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'REPLACE_WITH_WALLETCONNECT_PROJECT_ID';
const rpcUrl = (import.meta.env.RPC_URL ?? '').trim();

const chain = rpcUrl
  ? {
      ...bscTestnet,
      rpcUrls: {
        ...bscTestnet.rpcUrls,
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
      },
    }
  : bscTestnet;

export const BSC_TESTNET_CHAIN_ID = chain.id;

export const wagmiConfig = getDefaultConfig({
  appName: 'Twin Matrix',
  projectId,
  chains: [chain],
  ssr: false,
});
