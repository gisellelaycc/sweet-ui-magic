import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { useI18n } from '@/lib/i18n';
import { PageLayout } from '@/components/twin-matrix/PageLayout';

import { IdentityStep } from '@/components/twin-matrix/steps/IdentityStep';
import { CategoryStep } from '@/components/twin-matrix/steps/CategoryStep';
import { SportSetupStep } from '@/components/twin-matrix/steps/SportSetupStep';
import { SportTwinStep } from '@/components/twin-matrix/steps/SportTwinStep';
import { SoulStep } from '@/components/twin-matrix/steps/SoulStep';
import { GenerateStep } from '@/components/twin-matrix/steps/GenerateStep';
import { ReviewStep } from '@/components/twin-matrix/steps/ReviewStep';

const MintPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const {
    isConnected,
    openConnectModal,
    hasMintedSbt,
    state,
    setState,
    next,
    handleGenerateComplete,
    txAction,
    handleMintSbt,
    handleUpdateMatrix,
    needsMatrixUpdate,
    isWrongNetwork,
    isSwitchingNetwork,
    switchToBscTestnet,
  } = useTwinMatrix();

  const showBack = state.step > 0 && state.step < 6;

  const reviewActionLabel = useMemo(() => {
    if (needsMatrixUpdate || hasMintedSbt) return t('wizard.updateMatrix');
    return t('wizard.mintSbt');
  }, [needsMatrixUpdate, hasMintedSbt, t]);

  // After successful mint/update, redirect to /matrix
  const handleMintAndRedirect = async () => {
    await handleMintSbt();
    navigate('/matrix');
  };

  const handleUpdateAndRedirect = async () => {
    await handleUpdateMatrix();
    navigate('/matrix');
  };

  if (!isConnected) {
    return (
      <PageLayout activePage="identity">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center space-y-6">
            <h1 className="text-2xl font-heading font-bold">Connect Wallet</h1>
            <p className="text-muted-foreground">Connect your wallet to create or update your Twin Matrix.</p>
            <button onClick={() => openConnectModal?.()} className="btn-twin btn-twin-primary py-4 px-8 text-base">
              Connect Wallet
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activePage="identity">
      {showBack && (
        <button
          onClick={() => setState((s) => ({ ...s, step: Math.max(0, s.step - 1) }))}
          className="absolute top-20 left-6 z-20 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-lg leading-none">←</span>
          <span>{t('common.back')}</span>
        </button>
      )}

      {state.step <= 1 && (
        <IdentityStep data={state.profile} onUpdate={(p) => setState((s) => ({ ...s, profile: p }))} onNext={next} />
      )}
      {state.step === 2 && (
        <CategoryStep activeModules={state.activeModules} onUpdate={(m) => setState((s) => ({ ...s, activeModules: m }))} onNext={next} />
      )}
      {state.step === 3 && (
        <SportSetupStep data={state.sportSetup} onUpdate={(d) => setState((s) => ({ ...s, sportSetup: d }))} onNext={next} />
      )}
      {state.step === 4 && (
        <SportTwinStep data={state.sportTwin} onUpdate={(d) => setState((s) => ({ ...s, sportTwin: d }))} onNext={next} />
      )}
      {state.step === 5 && (
        <SoulStep data={state.soul} onUpdate={(d) => setState((s) => ({ ...s, soul: d }))} onNext={next} />
      )}
      {state.step === 6 && <GenerateStep wizardState={state} onComplete={handleGenerateComplete} />}
      {state.step === 7 && (
        <ReviewStep
          signature={state.signature}
          tags={[]}
          activeModules={state.activeModules}
          onNext={next}
          onBack={() => setState((s) => ({ ...s, step: 5 }))}
          primaryActionLabel={reviewActionLabel}
          onPrimaryAction={needsMatrixUpdate || hasMintedSbt ? handleUpdateAndRedirect : handleMintAndRedirect}
          primaryActionLoading={txAction !== null}
          primaryActionDisabled={txAction !== null || isWrongNetwork || ((needsMatrixUpdate || hasMintedSbt) && state.signature.length !== 256)}
          networkMismatch={isWrongNetwork}
          expectedNetworkLabel="BSC Testnet (97)"
          onSwitchNetwork={switchToBscTestnet}
          switchingNetwork={isSwitchingNetwork}
        />
      )}
    </PageLayout>
  );
};

export default MintPage;
