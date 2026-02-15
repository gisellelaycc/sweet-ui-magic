/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RPC_URL?: string;
  readonly ERC8004_CONTRACT_ADDRESS?: string;
  readonly TWIN_MATRIX_SBT_ADDRESS?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
