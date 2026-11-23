'use client';

import React from 'react';
import { Users, ShieldCheck, CheckCircle2, Plus, Sparkles, Heart, Flag, Info } from 'lucide-react';
import { COMMUNITY_CHALLENGES } from '@/lib/constants';

interface CommunityModeProps {
  joinedChallengeIds: string[];
  onToggleJoin: (id: string) => void;
  cityName: string;
}

export const CommunityMode: React.FC<CommunityModeProps> = ({
  joinedChallengeIds,
  onToggleJoin,
  cityName
}) => {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-reveal">
      {/* Editorial Header */}
      <div className="bg-sage rounded-[3rem] p-6 sm:p-10 border border-forest/15 shadow-forest space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-utility text-forest/70">
          <Users className="w-4 h-4 text-forest" />
          <span>COLLECTIVE CIVIC RESILIENCE</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl text-forest">
          COMMUNITY CLEAN-AIR NETWORK
        </h2>
        <p className="text-sm sm:text-base text-forest/90 max-w-3xl leading-relaxed">
          Air is a shared commons. When neighborhoods adopt collective micro-routines—like switching off idling engines at school gates and coordinating corridor wet-mopping—ambient street-level particulate concentrations drop significantly.
        </p>

        {/* Community Sample Data Transparency Notice */}
        <div className="bg-cream/90 p-4 rounded-2xl border border-forest/15 flex items-start gap-3 text-xs text-forest/80">
          <Info className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <p>
            <strong>Transparency Notice:</strong> Community challenges and participant tallies are presented as sample demonstration data for the {cityName} pilot network. We do not generate fake real-time tracking.
          </p>
        </div>
      </div>

      {/* "Small actions. Cleaner neighborhoods." Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-forest/15 pb-3">
          <div>
            <h3 className="font-display text-2xl text-forest">SMALL ACTIONS. CLEANER NEIGHBORHOODS.</h3>
            <p className="text-xs text-forest/70 mt-0.5">Participate in neighborhood challenges with one tap</p>
          </div>
          <span className="text-xs font-semibold tracking-utility uppercase text-forest bg-olive px-3 py-1 rounded-full">
            {joinedChallengeIds.length} ACTIVE CHALLENGES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COMMUNITY_CHALLENGES.map((ch) => {
            const isJoined = joinedChallengeIds.includes(ch.id);
            return (
              <div
                key={ch.id}
                className={`card-earthy p-6 sm:p-8 border transition-all ${
                  isJoined ? 'bg-sage/15 border-forest/30' : 'bg-white border-forest/15'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-utility bg-forest text-cream">
                    {ch.category}
                  </span>
                  <span className="text-xs font-semibold text-forest/70">
                    {ch.participants.toLocaleString()} neighbors committed
                  </span>
                </div>

                <h4 className="font-display text-2xl text-forest mb-2">{ch.title}</h4>
                <p className="text-xs sm:text-sm text-forest/80 leading-relaxed mb-4">{ch.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-forest/10">
                  <span className="text-[11px] font-semibold text-forest/70">
                    Impact: <strong className="text-forest">{ch.impactType}</strong>
                  </span>

                  <button
                    onClick={() => onToggleJoin(ch.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-utility uppercase transition-all flex items-center gap-1.5 ${
                      isJoined
                        ? 'bg-forest text-cream shadow-sm'
                        : 'bg-olive text-forest hover:bg-forest hover:text-cream border border-forest/20'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                        <span>JOINED</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>COMMIT</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
