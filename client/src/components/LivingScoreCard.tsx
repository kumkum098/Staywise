import React from 'react';
import { Award, Wifi, Shield, Sparkles, Volume2, MapPin, Lock, Utensils, MessageCircle, IndianRupee } from 'lucide-react';
import { LivingScore } from '../types';
import { Progress } from './ui/Progress';

interface LivingScoreCardProps {
  score: LivingScore;
  reviewCount?: number;
}

export const LivingScoreCard: React.FC<LivingScoreCardProps> = ({ score, reviewCount = 0 }) => {
  const metrics = [
    { label: 'Cleanliness & Hygiene', value: score.cleanliness, icon: Sparkles },
    { label: 'Internet & Connectivity', value: score.internet, icon: Wifi },
    { label: 'Food Quality', value: score.food, icon: Utensils },
    { label: 'Quietness & Study Environment', value: score.quietness, icon: Volume2 },
    { label: 'Location Convenience', value: score.location, icon: MapPin },
    { label: 'Privacy Standard', value: score.privacy, icon: Lock },
    { label: 'Safety & Security', value: score.safety, icon: Shield },
    { label: 'Owner Responsiveness', value: score.ownerResponsiveness, icon: MessageCircle },
    { label: 'Value for Money', value: score.valueForMoney, icon: IndianRupee },
  ];

  return (
    <div className="bg-white rounded-lg border border-surface-border p-5 shadow-subtle space-y-4">
      {/* Header with Overall Score */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-brand-700" />
            <h3 className="text-base font-bold text-ink-primary">Structured Living Score</h3>
          </div>
          <p className="text-xs text-ink-secondary mt-0.5">
            Evaluated from resident feedback & verified parameters
          </p>
        </div>

        <div className="text-right bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200">
          <div className="text-xl font-bold text-brand-700">{score.overall.toFixed(1)} / 10</div>
          <span className="text-[10px] text-brand-800 font-medium block">
            {reviewCount > 0 ? `${reviewCount} resident reviews` : 'Verified Rating'}
          </span>
        </div>
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-1">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center space-x-1.5 text-ink-secondary">
                  <Icon className="w-3.5 h-3.5 text-ink-muted" />
                  <span>{m.label}</span>
                </span>
                <span className="font-semibold text-ink-primary">{m.value.toFixed(1)}</span>
              </div>
              <Progress value={m.value} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
