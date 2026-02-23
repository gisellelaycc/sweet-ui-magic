import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { ParticleBackground } from '@/components/twin-matrix/ParticleBackground';
import { TopNav } from '@/components/twin-matrix/TopNav';
import { SiteFooter } from '@/components/twin-matrix/SiteFooter';
import { useI18n } from '@/lib/i18n';

import { IdentityStep } from '@/components/twin-matrix/steps/IdentityStep';
import { CategoryStep } from '@/components/twin-matrix/steps/CategoryStep';
import { SportSetupStep } from '@/components/twin-matrix/steps/SportSetupStep';
import { SportTwinStep } from '@/components/twin-matrix/steps/SportTwinStep';
import { SoulStep } from '@/components/twin-matrix/steps/SoulStep';
import { GenerateStep } from '@/components/twin-matrix/steps/GenerateStep';
import { ReviewStep } from '@/components/twin-matrix/steps/ReviewStep';
import { OnchainIdentityStatePage } from '@/components/twin-matrix/pages/OnchainIdentityStatePage';
import { EntryPage } from '@/components/twin-matrix/pages/EntryPage';

const MatrixPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const {
    isConnected,
    openConnectModal,
    disconnect,
    walletAddress,
    isContractConfigured,
    isCheckingToken,
    contractError,
    tokenId,
    hasMintedSbt,
    latestVersion,
    versions,
    boundAgents,
    refreshOnchainState,
    state,
    setState,
    next,
    handleGenerateComplete,
    txAction,
    handleMintSbt,
    handleUpdateMatrix,
    needsMatrixUpdate,
    setNeedsMatrixUpdate,
    showAgentNudge,
    setShowAgentNudge,
    isWrongNetwork,
    isSwitchingNetwork,
    switchToBscTestnet,
  } = useTwinMatrix();

  const showIdentityFlow = !hasMintedSbt || needsMatrixUpdate;
  const showBack = showIdentityFlow && state.step > 0 && state.step < 6;

  const reviewActionLabel = useMemo(() => {
    if (needsMatrixUpdate || hasMintedSbt) return t('wizard.updateMatrix');
    return t('wizard.mintSbt');
  }, [needsMatrixUpdate, hasMintedSbt, t]);

  // Redirect to home if not connected
  if (!isConnected) {
    return (
      <div className="h-screen w-full overflow-y-auto bg-background text-foreground">
        <div className="min-h-screen flex flex-col relative" style={{ zIndex: 10 }}>
          <ParticleBackground color="cyan" />
          <TopNav
            activePage="identity"
            onNavigate={(id) => {
              if (id === null) navigate('/');
              else if (id === 'identity') navigate('/matrix');
              else if (id === 'agent') navigate('/agent');
              else if (id === 'missions') navigate('/tasks');
            }}
            hasIdentity={false}
            isWalletConnected={false}
            walletAddress={undefined}
            onConnectWallet={() => openConnectModal?.()}
            onDisconnectWallet={() => disconnect()}
          />
          <main className="flex-1 min-h-0 px-4 py-4 flex flex-col relative z-10">
            <EntryPage
              onHumanEntry={() => openConnectModal?.()}
              onAgentEntry={() => navigate('/agent')}
              locked
              onRequestConnect={() => openConnectModal?.()}
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-auto bg-background text-foreground">
      <div className="min-h-screen flex flex-col relative" style={{ zIndex: 10 }}>
        <ParticleBackground color="cyan" />

        <TopNav
          activePage="identity"
          onNavigate={(id) => {
            if (id === null) navigate('/');
            else if (id === 'identity') navigate('/matrix');
            else if (id === 'agent') navigate('/agent');
            else if (id === 'missions') navigate('/tasks');
          }}
          hasIdentity={hasMintedSbt}
          isWalletConnected={isConnected}
          walletAddress={walletAddress}
          onConnectWallet={() => openConnectModal?.()}
          onDisconnectWallet={() => disconnect()}
        />

        <main className="flex-1 min-h-0 px-4 py-4 flex flex-col relative z-10">
          {!isContractConfigured && (
            <div className="max-w-4xl mx-auto w-full mb-3 transition-all duration-300" style={{ border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: '16px', padding: '1.25rem 1.75rem', background: 'rgba(250, 204, 21, 0.06)' }}>
              <p className="text-sm text-yellow-200 text-center">⚠️ Contract address not configured — on-chain features are disabled in this preview.</p>
            </div>
          )}

          {isCheckingToken && (
            <div className="max-w-xl mx-auto w-full text-center mt-12 transition-all duration-300" style={{ border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '16px', padding: '1.75rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-heading mb-2">TwinMatrixSBT</p>
              <p className="text-base">{t('wizard.checkingIdentity')}</p>
            </div>
          )}

          {!isCheckingToken && contractError && (
            <div className="max-w-2xl mx-auto w-full mt-8 transition-all duration-300" style={{ border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '16px', padding: '1.75rem', background: 'rgba(244, 63, 94, 0.06)' }}>
              <p className="text-base text-destructive">{t('wizard.failedFetchContract')}</p>
              <p className="text-sm text-muted-foreground mt-1 break-all">{contractError}</p>
              <button onClick={() => void refreshOnchainState()} className="mt-4 py-3 px-6 rounded-xl text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors">
                {t('wizard.retry')}
              </button>
            </div>
          )}

          {!isCheckingToken && !contractError && !showIdentityFlow && hasMintedSbt && (
            <>
              {showAgentNudge && (
                <div className="max-w-6xl mx-auto w-full mb-4 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-cyan-100">{t('wizard.matrixUpdateNudge')}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setShowAgentNudge(false)} className="btn-twin btn-twin-ghost py-1.5 px-3 text-xs">
                      {t('wizard.dismiss')}
                    </button>
                    <button
                      onClick={() => {
                        setShowAgentNudge(false);
                        navigate('/agent');
                      }}
                      className="btn-twin btn-twin-primary py-1.5 px-3 text-xs"
                    >
                      {t('wizard.goToAgentTab')}
                    </button>
                  </div>
                </div>
              )}

              <OnchainIdentityStatePage
                tokenId={tokenId}
                walletAddress={walletAddress}
                latestVersion={latestVersion}
                versions={versions}
                boundAgents={boundAgents}
                onReconfigure={() => {
                  setNeedsMatrixUpdate(true);
                  setState((s) => ({ ...s, step: 2, activeModules: s.activeModules.filter((moduleId) => moduleId === 'sport') }));
                }}
                onRefresh={() => void refreshOnchainState()}
                isRefreshing={isCheckingToken}
              />
            </>
          )}

          {!isCheckingToken && !contractError && showIdentityFlow && (
            <>
              {showBack && (
                <button
                  onClick={() => setState((s) => ({ ...s, step: Math.max(0, s.step - 1) }))}
                  className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="text-lg leading-none">←</span>
                  <span>{t('common.back')}</span>
                </button>
              )}

              {state.step === 0 && (
                <EntryPage onHumanEntry={next} onAgentEntry={() => navigate('/agent')} />
              )}
              {state.step === 1 && (
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
                  onPrimaryAction={needsMatrixUpdate || hasMintedSbt ? handleUpdateMatrix : handleMintSbt}
                  primaryActionLoading={txAction !== null}
                  primaryActionDisabled={txAction !== null || isWrongNetwork || ((needsMatrixUpdate || hasMintedSbt) && state.signature.length !== 256)}
                  networkMismatch={isWrongNetwork}
                  expectedNetworkLabel="BSC Testnet (97)"
                  onSwitchNetwork={switchToBscTestnet}
                  switchingNetwork={isSwitchingNetwork}
                />
              )}
            </>
          )}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
};

export default MatrixPage;
