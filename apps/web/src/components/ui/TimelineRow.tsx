import React from 'react';
import { HashChip } from './HashChip';

export interface TimelineRowProps {
  type: 'claim' | 'attestation';
  actor: string;
  timestamp: number;
  verdict?: string;
  confidence?: number;
  txHash?: string;
  evidenceHash?: string;
}

export const TimelineRow: React.FC<TimelineRowProps> = ({
  type,
  actor,
  timestamp,
  verdict,
  confidence,
  txHash,
  evidenceHash,
}) => {
  const formattedDate = new Date(timestamp * 1000).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative pl-6 pb-6 last:pb-0 border-l border-hairline group">
      {/* Timeline Stone Node Marker */}
      <div
        className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border transition-all ${
          type === 'claim'
            ? 'bg-ochre border-ochre/60 shadow-[0_0_8px_rgba(217,119,54,0.4)]'
            : 'bg-stone-cool-600 border-white/20'
        }`}
      />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-warm-200">
              {type === 'claim' ? 'Priority Claim' : 'Attestation Vouch'}
            </span>
            {verdict && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-sm font-mono uppercase tracking-wide border ${
                  verdict.toLowerCase().includes('authentic') ||
                  verdict.toLowerCase().includes('verified')
                    ? 'bg-ochre/10 border-ochre/30 text-ochre'
                    : 'bg-graphite-800 border-hairline text-stone-warm-300'
                }`}
              >
                {verdict}
              </span>
            )}
            {confidence !== undefined && (
              <span className="text-[11px] text-stone-warm-400 font-mono tabular">
                {(confidence / 100).toFixed(0)}% confidence
              </span>
            )}
          </div>
          <span className="text-xs text-stone-warm-500 font-mono tabular">
            {formattedDate}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-0.5">
          <HashChip
            hash={actor}
            label={type === 'claim' ? 'Claimant' : 'Attester'}
            truncateLength={6}
          />
          {evidenceHash && (
            <HashChip hash={evidenceHash} label="Evidence" truncateLength={6} />
          )}
          {txHash && (
            <a
              href={`https://testnet.monadscan.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-stone-warm-400 hover:text-ochre underline underline-offset-2 transition-colors tabular"
            >
              tx:{txHash.slice(0, 8)}…
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
