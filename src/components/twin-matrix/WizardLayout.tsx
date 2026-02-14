import { useState, useCallback } from 'react';
import { Home } from 'lucide-react';
import { toast } from 'sonner';
import type { WizardState } from '@/types/twin-matrix';
import { validateBaseline } from '@/lib/twin-encoder';
import logo from '@/assets/twin3-logo.svg';
import { StepIndicator } from './StepIndicator';
import { MainMenu } from './MainMenu';
import { ParticleBackground } from './ParticleBackground';
import { WelcomeStep } from './steps/WelcomeStep';
import { IdentityStep } from './steps/IdentityStep';
import { CategoryStep } from './steps/CategoryStep';
import { SportSetupStep } from './steps/SportSetupStep';
import { SportTwinStep } from './steps/SportTwinStep';
import { SoulStep } from './steps/SoulStep';
import { GenerateStep } from './steps/GenerateStep';
import { ReviewStep } from './steps/ReviewStep';
import { AuthStep } from './steps/AuthStep';
import { CompleteStep } from './steps/CompleteStep';

import { MyIdentityPage } from './pages/MyIdentityPage';
import { UpdateIdentityPage } from './pages/UpdateIdentityPage';
import { ActiveAuthorizationsPage } from './pages/ActiveAuthorizationsPage';
import { MissionsPage } from './pages/MissionsPage';
import { SettingsPage } from './pages/SettingsPage';

const TOTAL_STEPS = 9;

type MenuPage = 'identity' | 'update' | 'auth' | 'agent' | 'missions' | 'settings' | null;

const initialState: WizardState = {
  step: 0,
  profile: { username: '', heightBin: '', weightBin: '', ageBin: '', gender: '', education: '', income: '', maritalStatus: '', occupation: '', livingType: '' },
  activeModules: [],
  sportSetup: { frequency: '', duration: '', dailySteps: '' },
  sportTwin: { sportRanking: [], outfitStyle: [], brands: [] },
  soul: {
    bars: [
      { id: 'BAR_OUTCOME_EXPERIENCE', label: 'Performance Orientation', left: 'I train to improve performance', right: 'I train for the experience', value: null },
      { id: 'BAR_CONTROL_RELEASE', label: 'Structure Preference', left: 'I prefer structured training', right: 'I prefer spontaneous movement', value: null },
      { id: 'BAR_SOLO_GROUP', label: 'Social Preference', left: 'I prefer training alone', right: 'I prefer training with others', value: null },
      { id: 'BAR_PASSIVE_ACTIVE', label: 'Engagement Mode', left: 'I mostly consume sports content', right: 'I actively track or share my activity', value: null },
    ],
    confirmed: false,
  },
  signature: [],
  agentSetup: {
    agent: { name: '', taskTypes: [], matchingStrategy: [], behaviorMode: 'Active search' },
    permission: { identityScope: 'Core', tradingAuthority: 'Manual Only', authorizationDuration: '', customDurationDays: '', maxPerTask: '', dailyCap: '', weeklyCap: '', spendResetPolicy: [], taskTypeBound: false, brandRestriction: false },
  },
};

export const WizardLayout = () => {
  const [state, setState] = useState<WizardState>(initialState);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState<MenuPage>(null);

  const next = () => {
    if (state.step === 5) {
      const err = validateBaseline(state);
      if (err) {
        toast.error(err.message, { description: `Error: ${err.code}` });
        return;
      }
    }
    setState(s => ({ ...s, step: s.step + 1 }));
  };

  const handleGenerateComplete = useCallback((sig: number[]) => {
    setState(s => ({ ...s, signature: sig, step: s.step + 1 }));
  }, []);

  const hasIdentity = state.step >= 9;

  const handleMenuNavigate = (id: string) => setActivePage(id as MenuPage);
  const handlePageNavigate = (id: string) => setActivePage(id as MenuPage);

  const showIndicator = !activePage && state.step > 0 && state.step < 9;
  const showBack = !activePage && state.step > 0 && state.step < 6;
  const showPageBack = activePage !== null;

  return (
    <div className="h-full flex flex-col relative z-10">
      <ParticleBackground color={state.step >= 8 ? 'red' : 'cyan'} />

      <header className="flex items-center justify-between px-6 py-4 border-b border-foreground/5 relative z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(true)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-foreground/10 transition-colors">
            <img src={logo} alt="Twin Matrix" className="w-6 h-6" />
          </button>
          <span className="font-semibold tracking-tight">Twin Matrix</span>
        </div>
        {showIndicator && <StepIndicator current={state.step} total={TOTAL_STEPS} />}
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => setState(s => ({ ...s, step: s.step - 1 }))} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
          )}
          {showPageBack && (
            <button onClick={() => setActivePage(null)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
          )}
          {(showBack || showPageBack) && (
            <button onClick={() => { setActivePage(null); setState(s => ({ ...s, step: 0, signature: [], agentSetup: initialState.agentSetup })); }} className="text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-4 h-4" />
            </button>
          )}
          {!showBack && !showPageBack && <div className="w-12" />}
        </div>
      </header>

      <main className="flex-1 min-h-0 px-4 py-4 flex flex-col relative z-10">
        {activePage === 'identity' && (
          <MyIdentityPage username={state.profile.username} activeModules={state.activeModules} signature={state.signature} onNavigate={handlePageNavigate} />
        )}
        {activePage === 'update' && (
          <UpdateIdentityPage username={state.profile.username} activeModules={state.activeModules} tags={[]} onNavigate={handlePageNavigate} />
        )}
        {activePage === 'auth' && <ActiveAuthorizationsPage />}
        {activePage === 'missions' && <MissionsPage />}
        {activePage === 'settings' && <SettingsPage />}

        {!activePage && (
          <>
            {state.step === 0 && (
              <WelcomeStep username={state.profile.username} onUpdateUsername={name => setState(s => ({ ...s, profile: { ...s.profile, username: name } }))} onNext={next} />
            )}
            {state.step === 1 && (
              <IdentityStep data={state.profile} onUpdate={p => setState(s => ({ ...s, profile: p }))} onNext={next} />
            )}
            {state.step === 2 && (
              <CategoryStep activeModules={state.activeModules} onUpdate={m => setState(s => ({ ...s, activeModules: m }))} onNext={next} />
            )}
            {state.step === 3 && (
              <SportSetupStep data={state.sportSetup} onUpdate={d => setState(s => ({ ...s, sportSetup: d }))} onNext={next} />
            )}
            {state.step === 4 && (
              <SportTwinStep data={state.sportTwin} onUpdate={d => setState(s => ({ ...s, sportTwin: d }))} onNext={next} />
            )}
            {state.step === 5 && (
              <SoulStep data={state.soul} onUpdate={d => setState(s => ({ ...s, soul: d }))} onNext={next} />
            )}
            {state.step === 6 && <GenerateStep wizardState={state} onComplete={handleGenerateComplete} />}
            {state.step === 7 && (
              <ReviewStep signature={state.signature} username={state.profile.username} tags={[]} activeModules={state.activeModules} onNext={next} onBack={() => setState(s => ({ ...s, step: 5 }))} />
            )}
            {state.step === 8 && (
              <CompleteStep
                username={state.profile.username}
                signature={state.signature}
                agentName={state.agentSetup.agent.name}
                onActivateAgent={next}
                onDashboard={() => { setActivePage(null); setState(s => ({ ...s, step: 0, signature: [], agentSetup: initialState.agentSetup })); }}
              />
            )}
            {state.step === 9 && (
              <AuthStep
                data={state.agentSetup}
                onUpdate={d => setState(s => ({ ...s, agentSetup: d }))}
                onNext={next}
                onDashboard={() => { setActivePage(null); setState(s => ({ ...s, step: 0, signature: [], agentSetup: initialState.agentSetup })); }}
              />
            )}
          </>
        )}
      </main>

      <MainMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={handleMenuNavigate} hasIdentity={hasIdentity} />
    </div>
  );
};
