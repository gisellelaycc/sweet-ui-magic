import logo from '@/assets/twin3-logo.svg';

interface Props { onNext: () => void }

export const WelcomeStep = ({ onNext }: Props) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
    <div className="mb-8">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center">
        <img src={logo} alt="Twin Matrix" className="w-12 h-12" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Forge Your Identity
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
        Mint an authorizable identity state — unique, composable, and fully yours.
      </p>
    </div>
    <button onClick={onNext} className="btn-twin btn-twin-primary btn-glow text-base px-10 py-3">
      Start Minting →
    </button>
    <p className="text-muted-foreground/50 text-xs mt-6">Takes about 2 minutes</p>
  </div>
);
