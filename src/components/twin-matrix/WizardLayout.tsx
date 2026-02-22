import { useCallback, useEffect, useMemo, useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { BaseError } from 'viem';
import { toast } from 'sonner';
import { useAccount, useChainId, useDisconnect, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi';
import type { WizardState } from '@/types/twin-matrix';
import { validateBaseline } from '@/lib/twin-encoder';
import {
  decodeMatrixToSignature,
  erc20BalanceAbi,
  encodeSignatureToMatrix,
  isContractConfigured,
  isTokenNotFoundError,
  permissionMaskToBinary256,
  permissionMaskToGrantedScope,
  TWIN_MATRIX_SBT_ADDRESS,
  twinMatrixSbtAbi,
  type OnchainBoundAgent,
  type OnchainVersion,
} from '@/lib/contracts/twin-matrix-sbt';
import { resolveAgentProfileFromErc8004 } from '@/lib/contracts/identity-registry-erc8004';
import { BSC_TESTNET_CHAIN_ID } from '@/lib/wallet/config';
import { useI18n } from '@/lib/i18n';
import { MainMenu } from './MainMenu';
import { TopNav } from './TopNav';
import { ParticleBackground } from './ParticleBackground';
import { WelcomeStep } from './steps/WelcomeStep';
import { EntryPage } from './pages/EntryPage';
import { IdentityStep } from './steps/IdentityStep';
import { CategoryStep } from './steps/CategoryStep';
import { SportSetupStep } from './steps/SportSetupStep';
import { SportTwinStep } from './steps/SportTwinStep';
import { SoulStep } from './steps/SoulStep';
import { GenerateStep } from './steps/GenerateStep';
import { ReviewStep } from './steps/ReviewStep';
import { AuthStep } from './steps/AuthStep';
import { AgentStudioPage } from './pages/AgentStudioPage';
import { AgentPermissionEditPage } from './pages/AgentPermissionEditPage';
import { UpdateIdentityPage } from './pages/UpdateIdentityPage';
import { SignalRecordsPage } from './pages/SignalRecordsPage';
import { SettingsPage } from './pages/SettingsPage';
import { OnchainIdentityStatePage } from './pages/OnchainIdentityStatePage';

type MenuPage = 'identity' | 'update' | 'auth' | 'agent' | 'missions' | 'settings';
type TxAction = 'mint' | 'update' | null;
type AuthView = 'records' | 'form' | 'editPermission';
const MENU_PAGE_STORAGE_KEY = 'twin-matrix.active-page';
const MENU_PAGES: MenuPage[] = ['identity', 'update', 'auth', 'agent', 'missions', 'settings'];

const EMPTY_SIGNATURE = Array.from({ length: 256 }, () => 0);
const usdtContractAddress = (import.meta.env.USDT_CONTRACT_ADDRESS ?? '').trim();
const hasValidUsdtAddress = /^0x[a-fA-F0-9]{40}$/.test(usdtContractAddress);

const initialState: WizardState = {
  step: 0,
  profile: { username: '', heightBin: '', weightBin: '', ageBin: '', gender: '', education: '', income: '', maritalStatus: '', occupation: '', livingType: '' },
  activeModules: [],
  sportSetup: { frequency: '', duration: '', dailySteps: '' },
  sportTwin: { sportRanking: [], outfitStyle: [], brands: [] },
  soul: {
    bars: [
      { id: 'BAR_OUTCOME_EXPERIENCE', label: 'soul.bar.performanceOrientation', left: 'soul.bar.performanceLeft', right: 'soul.bar.performanceRight', value: null },
      { id: 'BAR_CONTROL_RELEASE', label: 'soul.bar.structurePreference', left: 'soul.bar.structureLeft', right: 'soul.bar.structureRight', value: null },
      { id: 'BAR_SOLO_GROUP', label: 'soul.bar.socialPreference', left: 'soul.bar.socialLeft', right: 'soul.bar.socialRight', value: null },
      { id: 'BAR_PASSIVE_ACTIVE', label: 'soul.bar.engagementMode', left: 'soul.bar.engagementLeft', right: 'soul.bar.engagementRight', value: null },
    ],
    confirmed: false,
  },
  signature: [],
  agentSetup: {
    agent: { name: '', taskTypes: [], matchingStrategy: [], behaviorMode: 'Active search' },
    permission: { identityScope: 'Physical', tradingAuthority: 'Manual Only', authorizationDuration: '', customDurationDays: '', maxPerTask: '', dailyCap: '', weeklyCap: '', spendResetPolicy: [], taskTypeBound: false, brandRestriction: false },
  },
};

export const WizardLayout = () => {
  const { t } = useI18n();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient({ chainId: BSC_TESTNET_CHAIN_ID });
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [state, setState] = useState<WizardState>(initialState);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState<MenuPage>(() => {
    if (typeof window === 'undefined') return 'identity';
    const stored = window.localStorage.getItem(MENU_PAGE_STORAGE_KEY);
    if (stored && MENU_PAGES.includes(stored as MenuPage)) return stored as MenuPage;
    return 'identity';
  });
  const [txAction, setTxAction] = useState<TxAction>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [latestVersion, setLatestVersion] = useState(0);
  const [versions, setVersions] = useState<OnchainVersion[]>([]);
  const [boundAgents, setBoundAgents] = useState<OnchainBoundAgent[]>([]);
  const [contractError, setContractError] = useState<string | null>(null);
  const [needsMatrixUpdate, setNeedsMatrixUpdate] = useState(false);
  const [showAgentNudge, setShowAgentNudge] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('records');
  const [editingAgentAddress, setEditingAgentAddress] = useState<string | null>(null);

  const walletAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : undefined;
  const hasMintedSbt = tokenId !== null;
  const isWrongNetwork = isConnected && chainId !== BSC_TESTNET_CHAIN_ID;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(MENU_PAGE_STORAGE_KEY, activePage);
  }, [activePage]);

  const next = () => {
    if (state.step === 5) {
      const err = validateBaseline(state);
      if (err) {
        toast.error(err.message, { description: `Error: ${err.code}` });
        return;
      }
    }
    setState((s) => ({ ...s, step: s.step + 1 }));
  };

  const handleGenerateComplete = useCallback((sig: number[]) => {
    setState((s) => ({ ...s, signature: sig, step: s.step + 1 }));
  }, []);

  const refreshOnchainState = useCallback(async () => {
    if (!publicClient || !address || !isContractConfigured) return;

    setIsCheckingToken(true);
    setContractError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentTokenId = await (publicClient.readContract as any)({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'tokenIdOf',
        args: [address],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const versionCountRaw = await (publicClient.readContract as any)({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'getVersionCount',
        args: [currentTokenId],
      });
      const versionCount = Number(versionCountRaw);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const latestVersionRaw = await (publicClient.readContract as any)({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'latestVersion',
        args: [currentTokenId],
      });
      const latestVersionNumber = Number(latestVersionRaw);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rc = publicClient.readContract as any;
      const versionRows: OnchainVersion[] = [];
      for (let version = versionCount; version >= 1; version--) {
        const [digest, blockNumber] = await rc({
          address: TWIN_MATRIX_SBT_ADDRESS,
          abi: twinMatrixSbtAbi,
          functionName: 'getVersionMeta',
          args: [currentTokenId, version],
        });
        const matrixAtVersion = await rc({
          address: TWIN_MATRIX_SBT_ADDRESS,
          abi: twinMatrixSbtAbi,
          functionName: 'getMatrixAtVersion',
          args: [currentTokenId, version],
        });
        versionRows.push({
          version,
          blockNumber: Number(blockNumber),
          digest,
          matrix: decodeMatrixToSignature(matrixAtVersion),
        });
      }

      const boundAgentAddresses = await rc({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'getBoundAgents',
        args: [currentTokenId],
      });

      const usdtDecimals = hasValidUsdtAddress
        ? Number(await rc({
            address: usdtContractAddress as `0x${string}`,
            abi: erc20BalanceAbi,
            functionName: 'decimals',
          }))
        : 18;

      const boundAgentRows: OnchainBoundAgent[] = await Promise.all(
        boundAgentAddresses.map(async (agentAddress: `0x${string}`) => {
          const [permissionMask, permissionExpiry, profile, usdtBalanceWei] = await Promise.all([
            rc({
              address: TWIN_MATRIX_SBT_ADDRESS,
              abi: twinMatrixSbtAbi,
              functionName: 'permissionMaskOf',
              args: [currentTokenId, agentAddress],
            }),
            rc({
              address: TWIN_MATRIX_SBT_ADDRESS,
              abi: twinMatrixSbtAbi,
              functionName: 'permissionExpiryOf',
              args: [currentTokenId, agentAddress],
            }),
            resolveAgentProfileFromErc8004(publicClient, agentAddress),
            hasValidUsdtAddress
              ? rc({
                  address: usdtContractAddress as `0x${string}`,
                  abi: erc20BalanceAbi,
                  functionName: 'balanceOf',
                  args: [agentAddress],
                })
              : Promise.resolve(null),
          ]);

          const short = `${agentAddress.slice(0, 6)}…${agentAddress.slice(-4)}`;
          const scopeGranted = permissionMaskToGrantedScope(permissionMask);
          return {
            name: profile?.name ?? `Agent ${short}`,
            address: agentAddress,
            tokenId: profile?.tokenId ?? null,
            permissionMask,
            permissionExpiry,
            usdtBalanceWei,
            usdtDecimals,
            permissionMaskBinary256: permissionMaskToBinary256(permissionMask),
            scopeGranted,
            active: permissionMask > 0n,
          };
        }),
      );

      setTokenId(currentTokenId);
      setLatestVersion(latestVersionNumber);
      setVersions(versionRows);
      setBoundAgents(boundAgentRows);
    } catch (error) {
      if (isTokenNotFoundError(error)) {
        setTokenId(null);
        setLatestVersion(0);
        setVersions([]);
        setBoundAgents([]);
        setNeedsMatrixUpdate(false);
      } else {
        const message = error instanceof BaseError ? error.shortMessage : String(error);
        setContractError(message);
        toast.error('Failed to load TwinMatrixSBT state');
      }
    } finally {
      setIsCheckingToken(false);
    }
  }, [publicClient, address]);

  useEffect(() => {
    if (!isConnected || !address) {
      setTokenId(null);
      setLatestVersion(0);
      setVersions([]);
      setBoundAgents([]);
      setContractError(null);
      return;
    }

    void refreshOnchainState();
  }, [isConnected, address, refreshOnchainState]);

  const handleMintSbt = useCallback(async () => {
    if (!publicClient || !isConnected) return;
    if (isWrongNetwork) {
      toast.error(t('review.wrongNetwork').replace('{network}', 'BSC Testnet (97)'));
      return;
    }

    try {
      setTxAction('mint');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hash = await (writeContractAsync as any)({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'mint',
        chainId: BSC_TESTNET_CHAIN_ID,
      });
      toast.info(t('wizard.mintSubmitted'));
      await publicClient.waitForTransactionReceipt({ hash });
      await refreshOnchainState();
      setNeedsMatrixUpdate(true);
      toast.success(t('wizard.mintSuccess'), {
        description: (
          <a
            href={`https://testnet.bscscan.com/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            View tx on BscScan
          </a>
        ),
      });
    } catch (error) {
      const message = error instanceof BaseError ? error.shortMessage : String(error);
      toast.error(`Mint failed: ${message}`);
    } finally {
      setTxAction(null);
    }
  }, [publicClient, isConnected, refreshOnchainState, writeContractAsync, isWrongNetwork]);

  const handleUpdateMatrix = useCallback(async () => {
    if (!publicClient || tokenId === null) return;
    if (isWrongNetwork) {
      toast.error(t('review.wrongNetwork').replace('{network}', 'BSC Testnet (97)'));
      return;
    }
    if (state.signature.length !== 256) {
      toast.error(t('wizard.matrixNotReady'));
      return;
    }

    try {
      setTxAction('update');
      const matrix = encodeSignatureToMatrix(state.signature);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hash = await (writeContractAsync as any)({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'updateMatrix',
        args: [tokenId, matrix],
        chainId: BSC_TESTNET_CHAIN_ID,
      });
      toast.info(t('wizard.updateSubmitted'));
      await publicClient.waitForTransactionReceipt({ hash });
      await refreshOnchainState();
      setNeedsMatrixUpdate(false);
      setState((s) => ({ ...s, step: 0 }));
      setShowAgentNudge(true);
      toast.success(t('wizard.updateSuccess'), {
        description: (
          <a
            href={`https://testnet.bscscan.com/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            View tx on BscScan
          </a>
        ),
      });
    } catch (error) {
      const message = error instanceof BaseError ? error.shortMessage : String(error);
      toast.error(`Update failed: ${message}`);
    } finally {
      setTxAction(null);
    }
  }, [publicClient, tokenId, state.signature, writeContractAsync, refreshOnchainState, isWrongNetwork]);

  const handleSwitchToBscTestnet = useCallback(() => {
    switchChain({ chainId: BSC_TESTNET_CHAIN_ID });
  }, [switchChain]);

  const showIdentityFlow = !hasMintedSbt || needsMatrixUpdate;
  const showBack = activePage === 'identity' && showIdentityFlow && state.step > 0 && state.step < 6;

  const reviewActionLabel = useMemo(() => {
    if (needsMatrixUpdate || hasMintedSbt) return t('wizard.updateMatrix');
    return t('wizard.mintSbt');
  }, [needsMatrixUpdate, hasMintedSbt, t]);

  return (
    <div className="flex-1 flex flex-col relative" style={{ zIndex: 10 }}>
      <ParticleBackground color="cyan" />

      <TopNav
        activePage={activePage}
        onNavigate={(id) => {
          const nextPage = (id ?? 'identity') as MenuPage;
          setActivePage(nextPage);
          if (nextPage === 'auth' || nextPage === 'agent') {
            setAuthView('records');
            setEditingAgentAddress(null);
          }
        }}
        hasIdentity={hasMintedSbt}
        isWalletConnected={isConnected}
        walletAddress={walletAddress}
        onConnectWallet={() => openConnectModal?.()}
        onDisconnectWallet={() => disconnect()}
      />

      <main className="flex-1 min-h-0 px-4 py-4 flex flex-col relative z-10">
        {!isContractConfigured && (
          <div className="max-w-4xl mx-auto w-full mb-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 text-center">
            <p className="text-xs text-yellow-200">⚠️ Contract address not configured — on-chain features are disabled in this preview.</p>
          </div>
        )}
        {!isConnected && (
          <EntryPage
            onHumanEntry={() => openConnectModal?.()}
            onAgentEntry={() => {}}
            locked
            onRequestConnect={() => openConnectModal?.()}
          />
        )}

        {isConnected && activePage === 'identity' && (
          <>
            {isCheckingToken && (
              <div className="glass-card max-w-xl mx-auto w-full text-center mt-12">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">TwinMatrixSBT</p>
                <p className="text-base">{t('wizard.checkingIdentity')}</p>
              </div>
            )}

            {!isCheckingToken && contractError && (
              <div className="glass-card max-w-2xl mx-auto w-full mt-8">
                <p className="text-sm text-destructive">{t('wizard.failedFetchContract')}</p>
                <p className="text-xs text-muted-foreground mt-1 break-all">{contractError}</p>
                <button onClick={() => void refreshOnchainState()} className="btn-twin btn-twin-primary mt-4 py-2 px-3 text-xs">
                  {t('wizard.retry')}
                </button>
              </div>
            )}

            {!isCheckingToken && !contractError && !showIdentityFlow && hasMintedSbt && (
              <>
                {showAgentNudge && (
                  <div className="max-w-6xl mx-auto w-full mb-4 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-cyan-100">
                      {t('wizard.matrixUpdateNudge')}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setShowAgentNudge(false)}
                        className="btn-twin btn-twin-ghost py-1.5 px-3 text-xs"
                      >
                        {t('wizard.dismiss')}
                      </button>
                      <button
                        onClick={() => {
                          setShowAgentNudge(false);
                          setActivePage('agent');
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
                  <EntryPage
                    onHumanEntry={next}
                    onAgentEntry={() => {}}
                  />
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
                    onSwitchNetwork={handleSwitchToBscTestnet}
                    switchingNetwork={isSwitchingNetwork}
                  />
                )}
              </>
            )}
          </>
        )}

        {isConnected && activePage === 'update' && (
          <UpdateIdentityPage activeModules={state.activeModules} tags={[]} onNavigate={(id) => setActivePage(id as MenuPage)} />
        )}
        {isConnected && activePage === 'agent' && (
          <>
            {authView === 'form' ? (
              <AuthStep
                data={state.agentSetup}
                onUpdate={(d) => setState((s) => ({ ...s, agentSetup: d }))}
                onNext={() => {}}
                onDashboard={() => {
                  void refreshOnchainState();
                  setAuthView('records');
                  setActivePage('agent');
                }}
                ownerAddress={address}
                tokenId={tokenId}
              />
            ) : authView === 'editPermission' && editingAgentAddress && tokenId !== null ? (
              (() => {
                const editingAgent = boundAgents.find((item) => item.address.toLowerCase() === editingAgentAddress.toLowerCase());
                if (!editingAgent) {
                  return (
                    <div className="max-w-3xl mx-auto w-full mt-8">
                      <p className="text-sm text-muted-foreground">{t('agent.selectedNotFound')}</p>
                    </div>
                  );
                }
                return (
                  <AgentPermissionEditPage
                    tokenId={tokenId}
                    agent={editingAgent}
                    isWrongNetwork={isWrongNetwork}
                    isSwitchingNetwork={isSwitchingNetwork}
                    onSwitchNetwork={handleSwitchToBscTestnet}
                    onBack={() => {
                      setAuthView('records');
                      setEditingAgentAddress(null);
                    }}
                    onUpdated={() => {
                      void refreshOnchainState();
                      setAuthView('records');
                      setEditingAgentAddress(null);
                    }}
                  />
                );
              })()
            ) : (
              <AgentStudioPage
                boundAgents={boundAgents}
                onCreateAgent={() => {
                  if (!hasMintedSbt || tokenId === null) {
                    toast.error(t('wizard.needMintBeforeAgent'));
                    return;
                  }
                  setAuthView('form');
                  setActivePage('agent');
                }}
                onEditAgent={(agentAddress?: string) => {
                  if (!hasMintedSbt || tokenId === null) {
                    toast.error(t('wizard.needMintBeforeAgent'));
                    return;
                  }
                  const targetAddress = agentAddress ?? boundAgents[0]?.address;
                  if (!targetAddress) {
                    toast.error('No bound agent found to edit.');
                    return;
                  }
                  setEditingAgentAddress(targetAddress);
                  setAuthView('editPermission');
                  setActivePage('agent');
                }}
              />
            )}
          </>
        )}
        {isConnected && activePage === 'auth' && <SignalRecordsPage hasMintedSbt={hasMintedSbt} />}
        {isConnected && activePage === 'missions' && <SignalRecordsPage hasMintedSbt={hasMintedSbt} />}
        {isConnected && activePage === 'settings' && <SettingsPage />}
      </main>

      <MainMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={(id) => setActivePage(id as MenuPage)} hasIdentity={hasMintedSbt} />
    </div>
  );
};
