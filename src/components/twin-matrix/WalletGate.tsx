interface Props {
  openConnectModal?: () => void;
}

export const WalletGate = ({ openConnectModal }: Props) => (
  <div className="absolute inset-0 z-40 flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
    <div className="relative z-10 glass-card w-full max-w-lg text-center space-y-4">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Wallet Required</p>
      <h2 className="text-2xl font-semibold tracking-tight">Connect Wallet to Continue</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        You need to connect a wallet before entering Twin Matrix. All actions are locked until a wallet is connected.
      </p>
      <div className="pt-3">
        <button
          onClick={() => openConnectModal?.()}
          disabled={!openConnectModal}
          className="btn-twin btn-twin-primary btn-glow px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  </div>
);
