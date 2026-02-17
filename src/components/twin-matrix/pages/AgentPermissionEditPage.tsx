import { useMemo, useState } from 'react';
import { BaseError, type Address } from 'viem';
import { toast } from 'sonner';
import { usePublicClient, useWriteContract } from 'wagmi';
import { BSC_TESTNET_CHAIN_ID } from '@/lib/wallet/config';
import { useI18n } from '@/lib/i18n';
import {
  TWIN_MATRIX_SBT_ADDRESS,
  permissionMaskToGrantedQuadrants,
  twinMatrixSbtAbi,
  type OnchainBoundAgent,
} from '@/lib/contracts/twin-matrix-sbt';

interface Props {
  tokenId: bigint;
  agent: OnchainBoundAgent;
  isWrongNetwork: boolean;
  isSwitchingNetwork: boolean;
  onSwitchNetwork: () => void;
  onBack: () => void;
  onUpdated: () => void;
}

const QUADRANTS = ['Physical', 'Digital', 'Social', 'Spiritual'] as const;
const DURATION_OPTIONS = ['7 days', '30 days', 'Custom'] as const;

function buildPermissionMaskFromQuadrants(scopes: string[]): bigint {
  const ranges: Record<string, [number, number]> = {
    Physical: [0, 63],
    Digital: [64, 127],
    Social: [128, 191],
    Spiritual: [192, 255],
  };
  let mask = 0n;
  for (const scope of scopes) {
    const range = ranges[scope];
    if (!range) continue;
    const [start, end] = range;
    const bitLength = BigInt(end - start + 1);
    const segment = ((1n << bitLength) - 1n) << BigInt(start);
    mask |= segment;
  }
  return mask;
}

function formatAddressPreview(address: Address): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const AgentPermissionEditPage = ({
  tokenId,
  agent,
  isWrongNetwork,
  isSwitchingNetwork,
  onSwitchNetwork,
  onBack,
  onUpdated,
}: Props) => {
  const { t } = useI18n();
  const publicClient = usePublicClient({ chainId: BSC_TESTNET_CHAIN_ID });
  const { writeContractAsync } = useWriteContract();
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    () => permissionMaskToGrantedQuadrants(agent.permissionMask),
  );
  const [duration, setDuration] = useState<string>('7 days');
  const [customDays, setCustomDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const durationSeconds = useMemo(() => {
    if (duration === '7 days') return 7 * 24 * 60 * 60;
    if (duration === '30 days') return 30 * 24 * 60 * 60;
    const days = Number.parseInt(customDays, 10);
    if (!Number.isFinite(days) || days <= 0) return null;
    return days * 24 * 60 * 60;
  }, [duration, customDays]);

  const handleUpdatePermission = async () => {
    if (!publicClient) return;
    if (isWrongNetwork) {
      toast.error(t('agent.error.switchBscBeforeUpdatePermission'));
      return;
    }
    const newMask = buildPermissionMaskFromQuadrants(selectedScopes);
    if (newMask === 0n) {
      toast.error(t('agent.error.selectScope'));
      return;
    }
    if (!durationSeconds) {
      toast.error(t('agent.error.selectDuration'));
      return;
    }

    const expiry = BigInt(Math.floor(Date.now() / 1000) + durationSeconds);
    try {
      setIsSubmitting(true);
      const hash = await writeContractAsync({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'setPermission',
        args: [tokenId, agent.address, newMask, expiry],
        chainId: BSC_TESTNET_CHAIN_ID,
      });
      toast.info(t('agent.permissionUpdateSubmitted'));
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success(t('agent.permissionUpdated'), {
        description: (
          <a
            href={`https://testnet.bscscan.com/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {t('agent.viewTx')}
          </a>
        ),
      });
      onUpdated();
    } catch (error) {
      const message = error instanceof BaseError ? error.shortMessage : String(error);
      toast.error(`${t('agent.error.updatePermissionFailed')}: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        <button
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {t('agent.backToStudio')}
        </button>

        <div>
          <h2 className="text-2xl font-bold mb-1">{t('agent.editPermissionTitle')}</h2>
          <p className="text-muted-foreground text-sm">
            {agent.name} · {formatAddressPreview(agent.address)}
          </p>
        </div>

        <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('agent.scope')}</p>
          <div className="flex flex-wrap gap-2">
            {QUADRANTS.map((scope) => {
              const selected = selectedScopes.includes(scope);
              return (
                <button
                  key={scope}
                  onClick={() => {
                    const next = selected
                      ? selectedScopes.filter((item) => item !== scope)
                      : [...selectedScopes, scope];
                    setSelectedScopes(next);
                  }}
                  className={`text-xs px-4 py-1.5 rounded-full transition-all ${
                    selected ? 'text-foreground border' : 'text-muted-foreground/50 border border-foreground/10 hover:border-foreground/20'
                  }`}
                  style={selected ? { borderColor: 'rgba(242,68,85,0.4)', background: 'rgba(242,68,85,0.08)', color: 'rgba(242,68,85,0.9)' } : {}}
                >
                  {t(`common.${scope.toLowerCase()}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('agent.authDuration')}</p>
          <div className="space-y-2">
            {DURATION_OPTIONS.map((option) => (
              <div
                key={option}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  setDuration(option);
                  if (option !== 'Custom') setCustomDays('');
                }}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: duration === option ? '#F24455' : 'rgba(255,255,255,0.15)' }}
                >
                  {duration === option && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F24455' }} />}
                </span>
                <span className="text-sm text-foreground/80">{t(option === '7 days' ? 'duration.7days' : option === '30 days' ? 'duration.30days' : 'duration.custom')}</span>
              </div>
            ))}
          </div>
          {duration === 'Custom' && (
            <div className="animate-fade-in flex items-center gap-2 pt-1">
              <span className="text-[11px] text-muted-foreground">{t('agent.days')}</span>
              <input
                type="number"
                min="1"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={t('agent.customDaysPlaceholder')}
                className="flex-1 bg-transparent border-b border-foreground/10 px-0 py-1.5 text-xs text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
          )}
        </div>

        {isWrongNetwork && (
          <div className="rounded-lg border border-yellow-400/35 bg-yellow-400/10 px-3 py-2">
            <p className="text-[11px] text-yellow-200 mb-2">
              {t('review.wrongNetwork').replace('{network}', 'BSC Testnet (97)')}
            </p>
            <button
              onClick={onSwitchNetwork}
              className="btn-twin btn-twin-primary py-1.5 px-3 text-xs"
              disabled={isSwitchingNetwork}
            >
              {isSwitchingNetwork ? t('review.switching') : t('review.switchTo').replace('{network}', 'BSC Testnet (97)')}
            </button>
          </div>
        )}

        <button
          onClick={() => { void handleUpdatePermission(); }}
          disabled={isSubmitting || isWrongNetwork}
          className="btn-twin btn-twin-primary btn-glow w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('agent.updating') : t('agent.updatePermissionScope')}
        </button>
      </div>
    </div>
  );
};
