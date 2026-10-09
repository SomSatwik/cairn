'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Stone } from './Stone';

export interface AttestationData {
  attester: string;
  verdict: string;
  timestamp: number;
  confidence?: number;
}

export interface CairnColumnProps {
  docHash: string;
  claimant?: string;
  commitTimestamp?: number;
  attestations?: AttestationData[];
  interactive?: boolean;
  className?: string;
}

export const CairnColumn: React.FC<CairnColumnProps> = ({
  docHash,
  claimant,
  commitTimestamp,
  attestations = [],
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Deterministically derive stone geometry from the docHash bytes
  const stoneParams = useMemo(() => {
    // Clean hash (strip 0x if present)
    const cleanHash = docHash.startsWith('0x') ? docHash.slice(2) : docHash;
    const bytes: number[] = [];
    for (let i = 0; i < cleanHash.length; i += 2) {
      bytes.push(parseInt(cleanHash.substring(i, i + 2), 16) || 0);
    }

    // Total stones in stack: base claim stone + attestation stones
    const totalStones = Math.max(1, 1 + attestations.length);
    const params = [];

    for (let i = 0; i < totalStones; i++) {
      const b1 = bytes[(i * 4) % bytes.length] ?? 128;
      const b2 = bytes[(i * 4 + 1) % bytes.length] ?? 64;
      const b3 = bytes[(i * 4 + 2) % bytes.length] ?? 200;
      const b4 = bytes[(i * 4 + 3) % bytes.length] ?? 32;

      // Base stone is widest; stones taper naturally towards top
      const baseTaper = Math.max(0.55, 1 - (i / (totalStones + 2)) * 0.45);
      const width = Math.round((210 + (b1 % 60)) * baseTaper);
      const height = Math.round(34 + (b2 % 14));
      // Subtle natural tilt between -2.2 and +2.2 degrees
      const rotation = Number((((b3 % 44) - 22) * 0.1).toFixed(2));
      // Small horizontal offset between -8px and +8px
      const offsetX = Math.round(((b4 % 16) - 8));
      const variant = (b1 + i) % 8;

      params.push({ width, height, rotation, offsetX, variant });
    }

    return params;
  }, [docHash, attestations.length]);

  const formatDate = (ts?: number) => {
    if (!ts) return '';
    return new Date(ts * 1000).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const truncateAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-end select-none ${className}`}
      aria-label="Cairn cryptographic stone column"
    >
      {/* Stones stack vertically with negative overlap so they rest on each other */}
      <div className="flex flex-col-reverse items-center -space-y-3.5 space-y-reverse">
        {/* Base Stone: The Claim */}
        {stoneParams[0] && (
          <motion.div
            key="base-claim"
            layoutId={prefersReducedMotion ? undefined : `stone-base-${docHash}`}
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 30, scale: 0.95 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 24,
              delay: 0.05,
            }}
            className="z-10 group relative"
          >
            <Stone
              index={0}
              width={stoneParams[0].width}
              height={stoneParams[0].height}
              variant={stoneParams[0].variant}
              colorTone="base"
              rotation={stoneParams[0].rotation}
              offsetX={stoneParams[0].offsetX}
              label={claimant ? `Claim: ${truncateAddress(claimant)}` : 'Earliest Claim'}
              sublabel={commitTimestamp ? formatDate(commitTimestamp) : undefined}
              isBase={true}
            />
          </motion.div>
        )}

        {/* Upper Stones: Attestations in chronological order */}
        {attestations.map((att, idx) => {
          const param = stoneParams[idx + 1] || stoneParams[0]!;
          const isOchre = att.verdict.toLowerCase().includes('authentic') || att.verdict.toLowerCase().includes('verified');
          const isDisputed = att.verdict.toLowerCase().includes('disputed');
          const colorTone = isDisputed ? 'disputed' : isOchre ? 'ochre-accent' : 'cool';

          return (
            <motion.div
              key={`attestation-${idx}`}
              layoutId={
                prefersReducedMotion ? undefined : `stone-att-${docHash}-${idx}`
              }
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: -25, scale: 0.96 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 22,
                delay: 0.12 * (idx + 1),
              }}
              className="z-20 group relative"
            >
              <Stone
                index={idx + 1}
                width={param.width}
                height={param.height}
                variant={param.variant}
                colorTone={colorTone}
                rotation={param.rotation}
                offsetX={param.offsetX}
                label={`${att.verdict} (${truncateAddress(att.attester)})`}
                sublabel={formatDate(att.timestamp)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Ground Bedrock Line / Sediment plane */}
      <div className="w-56 h-[1px] bg-gradient-to-r from-transparent via-stone-warm-500/30 to-transparent mt-2" />
    </div>
  );
};
