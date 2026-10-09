'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Cpu, FlaskConical, Scale, ArrowUpRight } from 'lucide-react';
import { sound } from '@/lib/sound';

const ADOPTERS = [
  {
    category: 'Intellectual Property',
    icon: Scale,
    title: 'Automated Patent Drafting',
    partners: 'PatentPal, Specifio Integration Formats',
    description:
      'Provides inventors with mathematical prior-art priority before formal USPTO or EPO provisional filing, without risking trade secret leakages or premature public disclosure.',
    badge: 'Prior-Art Defense',
  },
  {
    category: 'Traditional Knowledge',
    icon: FileText,
    title: 'AYUSH Indigenous Formations',
    partners: 'Traditional Medicine Repositories',
    description:
      'Protects ancestral herbal formulations and indigenous clinical preparations from transnational biopiracy and unauthorized commercial patents by proving earliest documented possession.',
    badge: 'Anti-Biopiracy',
  },
  {
    category: 'Decentralized Science',
    icon: FlaskConical,
    title: 'DeSci Research Preprints',
    partners: 'ArXiv & BioRxiv Authors, ResearchHub',
    description:
      'Allows researchers to seal discovery manuscripts and experimental raw data days before peer-review leaks or journal embargo expirations, establishing verifiable scientific priority.',
    badge: 'Academic Priority',
  },
  {
    category: 'AI & Data Provenance',
    icon: Cpu,
    title: 'Model Lineage & Content Passports',
    partners: 'Synthetic Data Generators & Model Audits',
    description:
      'Content passport certificates that bind generative AI output, training run logs, and human supervision checkpoints into an unforgeable hardware-signed Monad passport.',
    badge: 'AI Provenance',
  },
];

export const AdopterShowcase: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-ochre uppercase tracking-wider">
            Ecosystem Integrations &amp; Readiness
          </span>
          <h2 className="font-serif text-3xl font-normal text-stone-warm-100 mt-1">
            Built for High-Stakes Provenance
          </h2>
        </div>
        <p className="text-xs font-sans text-stone-warm-400 max-w-md">
          Cairn provides open SDK primitives tailored for mission-critical applications where proving earliest knowledge is worth millions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ADOPTERS.map((adopter) => {
          const Icon = adopter.icon;
          return (
            <div
              key={adopter.title}
              onMouseEnter={() => sound.playTick()}
              className="p-6 bg-graphite-900 border border-hairline hover:border-hairline-bright rounded-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xs bg-graphite-800 text-stone-warm-200 group-hover:text-ochre group-hover:bg-ochre/10 transition-colors">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono text-stone-warm-500 uppercase tracking-wider">
                      {adopter.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-graphite-950 border border-white/5 text-ochre">
                    {adopter.badge}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-medium text-stone-warm-100 group-hover:text-stone-warm-50 transition-colors">
                  {adopter.title}
                </h3>
                <p className="text-[11px] font-mono text-stone-warm-500 mt-1">
                  Target: {adopter.partners}
                </p>

                <p className="text-xs text-stone-warm-400 mt-3 leading-relaxed">
                  {adopter.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-hairline flex items-center justify-between text-xs font-mono text-stone-warm-500 group-hover:text-ochre transition-colors">
                <span>View Integration Standard</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
