interface Props { onNext: () => void }

export const WelcomeStep = ({ onNext }: Props) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
    <div className="mb-8">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-foreground/10 border border-foreground/10 flex items-center justify-center">
        <span className="text-3xl">◈</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Twin Matrix
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
        建立你的數位分身，探索屬於你的 256 維度身份矩陣
      </p>
    </div>
    <button onClick={onNext} className="btn-twin btn-twin-primary text-base px-10 py-3">
      開始建立 →
    </button>
    <p className="text-muted-foreground/50 text-xs mt-6">約需 2 分鐘完成</p>
  </div>
);
