import { useCallback, useEffect, useMemo, useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { BaseError } from 'viem';
import { toast } from 'sonner';
import { useAccount, useChainId, useDisconnect, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi';
import type { WizardState } from '@/types/twin-matrix';
import { validateBaseline } from '@/lib/twin-encoder';
import {
  decodeMatrixToSignature,
  encodeSignatureToMatrix,
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
import { MainMenu } from './MainMenu';
import { TopNav } from './TopNav';
import { ParticleBackground } from './ParticleBackground';
import { WelcomeStep } from './steps/WelcomeStep';
import { IdentityStep } from './steps/IdentityStep';
import { CategoryStep } from './steps/CategoryStep';
import { SportSetupStep } from './steps/SportSetupStep';
import { SportTwinStep } from './steps/SportTwinStep';
import { SoulStep } from './steps/SoulStep';
import { GenerateStep } from './steps/GenerateStep';
import { ReviewStep } from './steps/ReviewStep';
import { AgentStudioPage } from './pages/AgentStudioPage';
import { UpdateIdentityPage } from './pages/UpdateIdentityPage';
import { ActiveAuthorizationsPage } from './pages/ActiveAuthorizationsPage';
import { SignalMarketplacePage } from './pages/SignalMarketplacePage';
import { SettingsPage } from './pages/SettingsPage';
import { OnchainIdentityStatePage } from './pages/OnchainIdentityStatePage';

type MenuPage = 'identity' | 'update' | 'auth' | 'agent' | 'missions' | 'settings';
type TxAction = 'mint' | 'update' | null;

const EMPTY_SIGNATURE = Array.from({ length: 256 }, () => 0);

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
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient({ chainId: BSC_TESTNET_CHAIN_ID });
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [state, setState] = useState<WizardState>(initialState);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState<MenuPage>('identity');
  const [txAction, setTxAction] = useState<TxAction>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [latestVersion, setLatestVersion] = useState(0);
  const [versions, setVersions] = useState<OnchainVersion[]>([]);
  const [boundAgents, setBoundAgents] = useState<OnchainBoundAgent[]>([]);
  const [contractError, setContractError] = useState<string | null>(null);
  const [needsMatrixUpdate, setNeedsMatrixUpdate] = useState(false);
  const [showAgentNudge, setShowAgentNudge] = useState(false);

  const walletAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : undefined;
  const hasMintedSbt = tokenId !== null;
  const isWrongNetwork = isConnected && chainId !== BSC_TESTNET_CHAIN_ID;

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
    if (!publicClient || !address) return;

    setIsCheckingToken(true);
    setContractError(null);
    try {
      const currentTokenId = await publicClient.readContract({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'tokenIdOf',
        args: [address],
      });

      const versionCountRaw = await publicClient.readContract({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'getVersionCount',
        args: [currentTokenId],
      });
      const versionCount = Number(versionCountRaw);

      const latestVersionRaw = await publicClient.readContract({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'latestVersion',
        args: [currentTokenId],
      });
      const latestVersionNumber = Number(latestVersionRaw);

      const versionRows: OnchainVersion[] = [];
      for (let version = versionCount; version >= 1; version--) {
        const [digest, blockNumber] = await publicClient.readContract({
          address: TWIN_MATRIX_SBT_ADDRESS,
          abi: twinMatrixSbtAbi,
          functionName: 'getVersionMeta',
          args: [currentTokenId, version],
        });
        const matrixAtVersion = await publicClient.readContract({
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

      const boundAgentAddresses = await publicClient.readContract({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'getBoundAgents',
        args: [currentTokenId],
      });

      const boundAgentRows: OnchainBoundAgent[] = await Promise.all(
        boundAgentAddresses.map(async (agentAddress) => {
          const [permissionMask, profile] = await Promise.all([
            publicClient.readContract({
              address: TWIN_MATRIX_SBT_ADDRESS,
              abi: twinMatrixSbtAbi,
              functionName: 'permissionMaskOf',
              args: [currentTokenId, agentAddress],
            }),
            resolveAgentProfileFromErc8004(publicClient, agentAddress),
          ]);

          const short = `${agentAddress.slice(0, 6)}…${agentAddress.slice(-4)}`;
          const scopeGranted = permissionMaskToGrantedScope(permissionMask);
          return {
            name: profile?.name ?? `Agent ${short}`,
            address: agentAddress,
            tokenId: profile?.tokenId ?? null,
            permissionMask,
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
      toast.error('Please switch to BSC testnet (97) before minting.');
      return;
    }

    try {
      setTxAction('mint');
      const hash = await writeContractAsync({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'mint',
        chainId: BSC_TESTNET_CHAIN_ID,
      });
      toast.info('Mint transaction submitted. Waiting for confirmation...');
      await publicClient.waitForTransactionReceipt({ hash });
      await refreshOnchainState();
      setNeedsMatrixUpdate(true);
      toast.success('SBT minted successfully.', {
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
      toast.error('Please switch to BSC testnet (97) before updating matrix.');
      return;
    }
    if (state.signature.length !== 256) {
      toast.error('Matrix is not ready. Please finish the review flow first.');
      return;
    }

    try {
      setTxAction('update');
      const matrix = encodeSignatureToMatrix(state.signature);
      const hash = await writeContractAsync({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'updateMatrix',
        args: [tokenId, matrix],
        chainId: BSC_TESTNET_CHAIN_ID,
      });
      toast.info('Update transaction submitted. Waiting for confirmation...');
      await publicClient.waitForTransactionReceipt({ hash });
      await refreshOnchainState();
      setNeedsMatrixUpdate(false);
      setState((s) => ({ ...s, step: 0 }));
      setShowAgentNudge(true);
      toast.success('Matrix updated on-chain.', {
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
    if (needsMatrixUpdate || hasMintedSbt) return 'Update Matrix';
    return 'Mint SBT';
  }, [needsMatrixUpdate, hasMintedSbt]);

  return (
    <div className="h-full flex flex-col relative" style={{ zIndex: 10 }}>
      <ParticleBackground color="cyan" />

      <TopNav
        activePage={activePage}
        onNavigate={(id) => setActivePage((id ?? 'identity') as MenuPage)}
        hasIdentity={hasMintedSbt}
        isWalletConnected={isConnected}
        walletAddress={walletAddress}
        onConnectWallet={() => openConnectModal?.()}
        onDisconnectWallet={() => disconnect()}
      />

      <main className="flex-1 min-h-0 px-4 py-4 flex flex-col relative z-10">
        {!isConnected && (
          <WelcomeStep
            onNext={next}
            locked
            onRequestConnect={() => openConnectModal?.()}
          />
        )}

        {isConnected && activePage === 'identity' && (
          <>
            {isCheckingToken && (
              <div className="glass-card max-w-xl mx-auto w-full text-center mt-12">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">TwinMatrixSBT</p>
                <p className="text-base">Checking on-chain identity state...</p>
              </div>
            )}

            {!isCheckingToken && contractError && (
              <div className="glass-card max-w-2xl mx-auto w-full mt-8">
                <p className="text-sm text-destructive">Failed to fetch contract state</p>
                <p className="text-xs text-muted-foreground mt-1 break-all">{contractError}</p>
                <button onClick={() => void refreshOnchainState()} className="btn-twin btn-twin-primary mt-4 py-2 px-3 text-xs">
                  Retry
                </button>
              </div>
            )}

            {!isCheckingToken && !contractError && !showIdentityFlow && hasMintedSbt && (
              <>
                {showAgentNudge && (
                  <div className="max-w-6xl mx-auto w-full mb-4 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-cyan-100">
                      Matrix update complete. You can switch to Agent tab and click + New Agent.
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setShowAgentNudge(false)}
                        className="btn-twin btn-twin-ghost py-1.5 px-3 text-xs"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => {
                          setShowAgentNudge(false);
                          setActivePage('agent');
                        }}
                        className="btn-twin btn-twin-primary py-1.5 px-3 text-xs"
                      >
                        Go to Agent Tab
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
                    <span>Back</span>
                  </button>
                )}

                {state.step === 0 && (
                  <WelcomeStep onNext={next} />
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
          <AgentStudioPage
            boundAgents={boundAgents}
            onCreateAgent={() => setActivePage('auth')}
            onEditAgent={() => setActivePage('auth')}
          />
        )}
        {isConnected && activePage === 'auth' && <ActiveAuthorizationsPage />}
        {isConnected && activePage === 'missions' && <SignalMarketplacePage />}
        {isConnected && activePage === 'settings' && <SettingsPage />}
      </main>

      <MainMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={(id) => setActivePage(id as MenuPage)} hasIdentity={hasMintedSbt} />
    </div>
  );
};
