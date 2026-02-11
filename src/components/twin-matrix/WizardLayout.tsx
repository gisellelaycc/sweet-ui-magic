import { useState, useCallback } from 'react';
import type { WizardState } from '@/types/twin-matrix';
import { StepIndicator } from './StepIndicator';
import { WelcomeStep } from './steps/WelcomeStep';
import { IdentityStep } from './steps/IdentityStep';
import { CategoryStep } from './steps/CategoryStep';
import { SportTwinStep } from './steps/SportTwinStep';
import { SoulStep } from './steps/SoulStep';
import { GenerateStep } from './steps/GenerateStep';
import { ReviewStep } from './steps/ReviewStep';
import { AuthStep } from './steps/AuthStep';
import { CompleteStep } from './steps/CompleteStep';

const TOTAL_STEPS = 8; // excluding welcome (step 0)

const initialState: WizardState = {
  step: 0,
  profile: { username: '', heightBin: '', weightBin: '', ageBin: '' },
  sportSetup: { frequency: '', duration: '' },
  sportTwin: { sportRanking: [], outfitStyle: '', brands: [] },
  soul: { sentence: '', tags: [] },
  signature: [],
};

export const WizardLayout = () => {
  const [state, setState] = useState<WizardState>(initialState);

  const next = () => setState(s => ({ ...s, step: s.step + 1 }));

  const handleGenerateComplete = useCallback((sig: string[]) => {
    setState(s => ({ ...s, signature: sig, step: s.step + 1 }));
  }, []);

  const showIndicator = state.step > 0 && state.step < 8;

  return (
    <div className="h-full flex flex-col relative z-10">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center text-sm">
            ◈
          </div>
          <span className="font-semibold tracking-tight">Twin Matrix</span>
        </div>
        {showIndicator && (
          <StepIndicator current={state.step} total={TOTAL_STEPS} />
        )}
        {state.step > 0 && state.step < 5 && (
          <button
            onClick={() => setState(s => ({ ...s, step: s.step - 1 }))}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 上一步
          </button>
        )}
        {(!showIndicator || state.step >= 5) && <div />}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide">
        {state.step === 0 && <WelcomeStep onNext={next} />}
        {state.step === 1 && (
          <IdentityStep
            data={state.profile}
            onUpdate={p => setState(s => ({ ...s, profile: p }))}
            onNext={next}
          />
        )}
        {state.step === 2 && (
          <CategoryStep
            data={state.sportSetup}
            onUpdate={d => setState(s => ({ ...s, sportSetup: d }))}
            onNext={next}
          />
        )}
        {state.step === 3 && (
          <SportTwinStep
            data={state.sportTwin}
            onUpdate={d => setState(s => ({ ...s, sportTwin: d }))}
            onNext={next}
          />
        )}
        {state.step === 4 && (
          <SoulStep
            data={state.soul}
            onUpdate={d => setState(s => ({ ...s, soul: d }))}
            onNext={next}
          />
        )}
        {state.step === 5 && <GenerateStep onComplete={handleGenerateComplete} />}
        {state.step === 6 && (
          <ReviewStep
            signature={state.signature}
            username={state.profile.username}
            tags={state.soul.tags}
            onNext={next}
          />
        )}
        {state.step === 7 && <AuthStep onNext={next} />}
        {state.step === 8 && (
          <CompleteStep signature={state.signature} username={state.profile.username} />
        )}
      </main>
    </div>
  );
};
