import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useI18n } from '@/lib/i18n';

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--glass-border)',
  borderRadius: '16px',
  padding: '1.75rem',
  background: 'var(--glass-bg)',
};

const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.borderColor = 'hsl(var(--foreground) / 0.2)';
  e.currentTarget.style.background = 'hsl(var(--foreground) / 0.04)';
};
const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.borderColor = '';
  e.currentTarget.style.background = 'var(--glass-bg)';
};

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
  completed: 'bg-[hsla(164,24%,74%,0.15)] text-[hsl(164,24%,74%)]',
  expired: 'bg-amber-400/15 text-amber-200',
  revoked: 'bg-amber-400/15 text-amber-200',
  declined: 'bg-rose-400/15 text-rose-200',
};

function statusLabel(status: MissionStatus, t: (key: string) => string): string {
  if (status === 'running' || status === 'active') return t('records.active');
  if (status === 'completed') return t('signalRecords.completed');
  if (status === 'declined') return t('signalRecords.declined');
  if (status === 'expired' || status === 'revoked') return t('records.expired');
  return status;
}

function MissionCard({ row, t }: { row: MissionRow; t: (key: string) => string }) {
  return (
    <div
      className="transition-all duration-300"
      style={cardStyle}
      onMouseEnter={handleCardEnter}
      onMouseLeave={handleCardLeave}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold break-words">{row.taskName}</p>
          <p className="text-sm text-muted-foreground/70 mt-1.5">
            {t('signalRecords.issuedBy')} {row.agentName} · <span className="font-mono">{shortAddress(row.agentAddress)}</span>
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {t('signalRecords.scopeUsed')}: <span className="font-mono text-foreground/80">{row.scope.join(', ') || '-'}</span>
          </p>
        </div>
        <div className="text-right shrink-0">
          {row.status === 'completed' && (
            <p className="text-base text-foreground/85 mb-1">{Number(row.rewardUsdt || 0).toFixed(1)} USDT</p>
          )}
          <span className={`inline-flex text-xs px-2.5 py-0.5 rounded-full ${STATUS_STYLE[row.status] ?? 'bg-foreground/10 text-foreground/70'}`}>
            {statusLabel(row.status, t)}
          </span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground/70 mt-3 space-y-1">
        <p>{t('signalRecords.createdAt')}: <span className="text-foreground/80">{formatDateTime(row.createdAt)}</span></p>
        {row.status === 'completed' ? (
          <>
            <p>{t('signalRecords.completedAt')}: <span className="text-foreground/80">{formatDateTime(row.completedAt)}</span></p>
            <p>
              {t('signalRecords.transferTxHash')}:{' '}
              <span className="text-foreground/80 font-mono break-all">{shortHash(row.transferTxHash)}</span>
            </p>
          </>
        ) : (
          <p>{t('signalRecords.expiresAt')}: <span className="text-foreground/80">{formatDateTime(row.expiresAt)}</span></p>
        )}
      </div>
    </div>
  );
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

  const activeRows = useMemo(() => missions.filter((m) => m.status === 'running' || m.status === 'active'), [missions]);
  const completedRows = useMemo(() => missions.filter((m) => m.status === 'completed'), [missions]);
  const endedRows = useMemo(() => missions.filter((m) => m.status === 'expired' || m.status === 'declined' || m.status === 'revoked'), [missions]);
  const totalInflow = useMemo(() => completedRows.reduce((acc, cur) => acc + (Number.isFinite(cur.rewardUsdt) ? cur.rewardUsdt : 0), 0), [completedRows]);

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-8 space-y-8">
        {/* Page header */}
        <div>
          <p className="text-base uppercase tracking-[0.25em] text-muted-foreground font-heading mb-3">
            {t('signalRecords.subtitle')}
          </p>
          <h2 className="font-heading font-extrabold uppercase leading-tight tracking-tight text-foreground" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
            {t('signalRecords.title')}
          </h2>
        </div>

        {!isConnected || !address ? (
          <div
            className="transition-all duration-300"
            style={cardStyle}
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}
          >
            <p className="text-base text-muted-foreground">{t('wallet.connectToContinue')}</p>
          </div>
        ) : !hasMintedSbt ? (
          <div
            className="transition-all duration-300"
            style={cardStyle}
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}
          >
            <p className="text-base text-muted-foreground">{t('signalRecords.noIdentityState')}</p>
          </div>
        ) : isLoading ? (
          <div
            className="transition-all duration-300"
            style={cardStyle}
          >
            <p className="text-base text-muted-foreground">Loading mission records...</p>
          </div>
        ) : error ? (
          <div
            className="transition-all duration-300"
            style={{ ...cardStyle, borderColor: 'rgba(244, 63, 94, 0.3)' }}
          >
            <p className="text-base text-rose-300/80 break-all">{error}</p>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground/70 flex-wrap">
              <span>{t('signalRecords.activeCommitments')} <span className="text-foreground/80">{activeRows.length}</span></span>
              <span>·</span>
              <span>{t('signalRecords.completed')} <span className="text-foreground/80">{completedRows.length}</span></span>
              <span>·</span>
              <span>{t('signalRecords.expiredDeclined')} <span className="text-foreground/80">{endedRows.length}</span></span>
              <span>·</span>
              <span>{t('signalRecords.inflow')} <span className="text-foreground/80">{totalInflow.toFixed(1)} USDT</span></span>
            </div>

            {/* Active section */}
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-heading">{t('signalRecords.activeCommitments')}</p>
              {activeRows.length === 0 ? (
                <div style={cardStyle}>
                  <p className="text-base text-muted-foreground">{t('onchain.none')}</p>
                </div>
              ) : (
                activeRows.map((row) => <MissionCard key={row.id} row={row} t={t} />)
              )}
            </div>

            {/* Completed section */}
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-heading">{t('signalRecords.completedRecords')}</p>
              {completedRows.length === 0 ? (
                <div style={cardStyle}>
                  <p className="text-base text-muted-foreground">{t('onchain.none')}</p>
                </div>
              ) : (
                completedRows.map((row) => <MissionCard key={row.id} row={row} t={t} />)
              )}
            </div>

            {/* Expired / Declined section */}
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-heading">{t('signalRecords.expiredDeclined')}</p>
              {endedRows.length === 0 ? (
                <div style={cardStyle}>
                  <p className="text-base text-muted-foreground">{t('onchain.none')}</p>
                </div>
              ) : (
                endedRows.map((row) => <MissionCard key={row.id} row={row} t={t} />)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
