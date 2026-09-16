import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { HouseRules } from '../types';

interface BeforeYouBookCardProps {
  beforeYouBook?: string[];
  houseRules: HouseRules;
}

export const BeforeYouBookCard: React.FC<BeforeYouBookCardProps> = ({ beforeYouBook = [], houseRules }) => {
  return (
    <div className="bg-white rounded-lg border border-amber-200 p-5 shadow-subtle space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-amber-100 pb-3">
        <div className="p-2 rounded bg-amber-50 text-amber-700">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-ink-primary">Before You Book — Practical Clarity</h3>
          <p className="text-xs text-ink-secondary">Important restrictions, curfews, and terms to know beforehand</p>
        </div>
      </div>

      {/* Rules list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Curfew item */}
        <div className="flex items-start space-x-2 bg-amber-50/60 p-2.5 rounded border border-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-900 block">Curfew Policy</span>
            <span className="text-ink-secondary">
              {houseRules.curfew === 'No Curfew' ? 'No curfew entry restrictions' : `Entry gate locks at ${houseRules.curfew}`}
            </span>
          </div>
        </div>

        {/* Visitor policy */}
        <div className="flex items-start space-x-2 bg-amber-50/60 p-2.5 rounded border border-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-900 block">Visitor Rules</span>
            <span className="text-ink-secondary">{houseRules.visitorPolicy}</span>
          </div>
        </div>

        {/* Dynamic notes */}
        {beforeYouBook.map((note, idx) => (
          <div key={idx} className="flex items-start space-x-2 bg-surface-muted p-2.5 rounded border border-surface-border">
            <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
            <span className="text-ink-primary font-medium">{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
