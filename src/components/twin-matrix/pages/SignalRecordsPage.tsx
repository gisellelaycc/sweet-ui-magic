import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useI18n } from '@/lib/i18n';

const ThinDivider = () => (
  <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
);

type MissionStatus = 'running' | 'completed' | 'expired' | 'declined' | 'revoked' | string;

interface MissionRow {
  id: string;
  agentId: string;
  agentAddress: string;
  owner: string;
  taskName: string;
  agentName: string;
  rewardUsdt: number;
  status: MissionStatus;
  expiresAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  completedAt?: string | null;
  transferTxHash?: string | null;
  scope: string[];
}

interface MissionListResponse {
  owner: string;
  missions: MissionRow[];
}

function getAgentApiBase(): string {
  const baseEnv = (import.meta.env.VITE_BACKEND_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
  return baseEnv || '/api';
}

function formatDateTime(input?: string | null): string {
  if (!input) return '-';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

function shortHash(hash?: string | null): string {
  if (!hash) return '-';
  if (hash.length < 16) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function shortAddress(address?: string | null): string {
  if (!address) return '-';
  if (!address.startsWith('0x') || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const STATUS_STYLE: Record<string, string> = {
  running: 'bg-cyan-400/15 text-cyan-200',
  active: 'bg-cyan-400/15 text-cyan-200',
  completed: 'bg-emerald-400/15 text-emerald-200',
  expired: 'bg-amber-400/15 text-amber-200',
  revoked: 'bg-amber-400/15 text-amber-200',
  declined: 'bg-rose-400/15 text-rose-200',
};

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</h3>
      <p className="text-[11px] text-muted-foreground/60 mt-1">{subtitle}</p>
    </div>
  );
}

function statusLabel(status: MissionStatus, t: (key: string) => string): string {
  if (status === 'running' || status === 'active') return t('records.active');
  if (status === 'completed') return t('signalRecords.completed');
  if (status === 'declined') return t('signalRecords.declined');
  if (status === 'expired' || status === 'revoked') return t('records.expired');
  return status;
}

interface Props {
  hasMintedSbt: boolean;
}

export const SignalRecordsPage = ({ hasMintedSbt }: Props) => {
  const { t } = useI18n();
  const { address, isConnected } = useAccount();
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address || !hasMintedSbt) {
      setMissions([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const baseUrl = getAgentApiBase();
        const endpoint = `${baseUrl}/v1/mission/list?owner=${encodeURIComponent(address)}`;
        const response = await fetch(endpoint, { method: 'GET', signal: controller.signal });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP ${response.status}`);
        }
        const payload = await response.json() as MissionListResponse;
        setMissions(Array.isArray(payload.missions) ? payload.missions : []);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(`Failed to load mission records: ${String(err)}`);
        setMissions([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, [address, isConnected, hasMintedSbt]);

  const activeRows = useMemo(
    () => missions.filter((m) => m.status === 'running' || m.status === 'active'),
    [missions],
  );
  const completedRows = useMemo(
    () => missions.filter((m) => m.status === 'completed'),
    [missions],
  );
  const endedRows = useMemo(
    () => missions.filter((m) => m.status === 'expired' || m.status === 'declined' || m.status === 'revoked'),
    [missions],
  );
  const totalInflow = useMemo(
    () => completedRows.reduce((acc, cur) => acc + (Number.isFinite(cur.rewardUsdt) ? cur.rewardUsdt : 0), 0),
    [completedRows],
  );

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('signalRecords.title')}</h2>
          <p className="text-xs text-muted-foreground/70 mt-2">{t('signalRecords.subtitle')}</p>
        </div>

        <ThinDivider />

        {!isConnected || !address ? (
          <p className="text-sm text-muted-foreground">{t('wallet.connectToContinue')}</p>
        ) : !hasMintedSbt ? (
          <p className="text-sm text-muted-foreground">{t('signalRecords.noIdentityState')}</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading mission records...</p>
        ) : error ? (
          <p className="text-sm text-rose-300/80 break-all">{error}</p>
        ) : (
          <>
            <div className="flex items-center gap-6 text-xs text-muted-foreground/70 flex-wrap">
              <span>{t('signalRecords.activeCommitments')} <span className="text-foreground/80">{activeRows.length}</span></span>
              <span>·</span>
              <span>{t('signalRecords.completed')} <span className="text-foreground/80">{completedRows.length}</span></span>
              <span>·</span>
              <span>{t('signalRecords.expiredDeclined')} <span className="text-foreground/80">{endedRows.length}</span></span>
              <span>·</span>
              <span>{t('signalRecords.inflow')} <span className="text-foreground/80">{totalInflow.toFixed(1)} USDT</span></span>
            </div>

            <ThinDivider />

            <SectionHeader title={t('signalRecords.activeCommitments')} subtitle={t('signalRecords.activeSubtitle')} />
            <div className="space-y-0">
              {activeRows.length === 0 && <p className="text-sm text-muted-foreground py-2">{t('onchain.none')}</p>}
              {activeRows.map((row, idx) => (
                <div key={row.id}>
                  <div className="py-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-4 items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold break-words">{row.taskName}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {t('signalRecords.issuedBy')} {row.agentName} · <span className="font-mono">{shortAddress(row.agentAddress)}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {t('signalRecords.scopeUsed')}: <span className="font-mono text-foreground/80">{row.scope.join(', ') || '-'}</span>
                      </p>
                    </div>
                    <div className="text-[11px] text-muted-foreground/70 space-y-1">
                      <p>{t('signalRecords.createdAt')}: <span className="text-foreground/80">{formatDateTime(row.createdAt)}</span></p>
                      <p>{t('signalRecords.expiresAt')}: <span className="text-foreground/80">{formatDateTime(row.expiresAt)}</span></p>
                    </div>
                    <div className="justify-self-start lg:justify-self-end text-left lg:text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLE[row.status] ?? 'bg-foreground/10 text-foreground/70'}`}>
                        {statusLabel(row.status, t)}
                      </span>
                    </div>
                  </div>
                  {idx < activeRows.length - 1 && <ThinDivider />}
                </div>
              ))}
            </div>

            <ThinDivider />

            <SectionHeader title={t('signalRecords.completedRecords')} subtitle={t('signalRecords.completedSubtitle')} />
            <div className="space-y-0">
              {completedRows.length === 0 && <p className="text-sm text-muted-foreground py-2">{t('onchain.none')}</p>}
              {completedRows.map((row, idx) => (
                <div key={row.id}>
                  <div className="py-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-4 items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold break-words">{row.taskName}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {t('signalRecords.issuedBy')} {row.agentName} · <span className="font-mono">{shortAddress(row.agentAddress)}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {t('signalRecords.scopeUsed')}: <span className="font-mono text-foreground/80">{row.scope.join(', ') || '-'}</span>
                      </p>
                    </div>
                    <div className="text-[11px] text-muted-foreground/70 space-y-1">
                      <p>{t('signalRecords.createdAt')}: <span className="text-foreground/80">{formatDateTime(row.createdAt)}</span></p>
                      <p>{t('signalRecords.completedAt')}: <span className="text-foreground/80">{formatDateTime(row.completedAt)}</span></p>
                      <p>
                        {t('signalRecords.transferTxHash')}:{' '}
                        <span className="text-foreground/80 font-mono break-all">{shortHash(row.transferTxHash)}</span>
                      </p>
                    </div>
                    <div className="justify-self-start lg:justify-self-end text-left lg:text-right">
                      <p className="text-sm text-foreground/85">{Number(row.rewardUsdt || 0).toFixed(1)} USDT</p>
                      <span className={`inline-flex mt-1 text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLE[row.status] ?? 'bg-foreground/10 text-foreground/70'}`}>
                        {statusLabel(row.status, t)}
                      </span>
                    </div>
                  </div>
                  {idx < completedRows.length - 1 && <ThinDivider />}
                </div>
              ))}
            </div>

            <ThinDivider />

            <SectionHeader title={t('signalRecords.expiredDeclined')} subtitle={t('signalRecords.endedSubtitle')} />
            <div className="space-y-0">
              {endedRows.length === 0 && <p className="text-sm text-muted-foreground py-2">{t('onchain.none')}</p>}
              {endedRows.map((row, idx) => (
                <div key={row.id}>
                  <div className="py-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-4 items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold break-words">{row.taskName}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {t('signalRecords.issuedBy')} {row.agentName} · <span className="font-mono">{shortAddress(row.agentAddress)}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {t('signalRecords.scopeUsed')}: <span className="font-mono text-foreground/80">{row.scope.join(', ') || '-'}</span>
                      </p>
                    </div>
                    <div className="text-[11px] text-muted-foreground/70 space-y-1">
                      <p>{t('signalRecords.expiresAt')}: <span className="text-foreground/80">{formatDateTime(row.expiresAt)}</span></p>
                    </div>
                    <div className="justify-self-start lg:justify-self-end text-left lg:text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLE[row.status] ?? 'bg-foreground/10 text-foreground/70'}`}>
                        {statusLabel(row.status, t)}
                      </span>
                    </div>
                  </div>
                  {idx < endedRows.length - 1 && <ThinDivider />}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
