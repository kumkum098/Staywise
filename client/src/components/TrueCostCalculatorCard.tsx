import React from 'react';
import { Calculator, Info, CheckCircle2 } from 'lucide-react';
import { PricingBreakdown } from '../types';

interface TrueCostCalculatorCardProps {
  pricing: PricingBreakdown;
  propertyName?: string;
}

export const TrueCostCalculatorCard: React.FC<TrueCostCalculatorCardProps> = ({ pricing, propertyName }) => {
  const food = pricing.foodCost || 0;
  const elec = pricing.electricityCost || 0;
  const maint = pricing.maintenanceCost || 0;
  const wifi = pricing.wifiCost || 0;

  const totalEstimated = pricing.startingRent + food + elec + maint + wifi;

  return (
    <div className="bg-white rounded-lg border border-surface-border p-5 shadow-subtle space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded bg-brand-50 text-brand-700">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink-primary">True Monthly Cost</h3>
            <p className="text-xs text-ink-secondary">Real estimated out-of-pocket expenses every month</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
          Transparent Estimate
        </span>
      </div>

      {/* Primary Comparison Banner */}
      <div className="grid grid-cols-2 gap-3 p-3.5 bg-surface-muted rounded-lg border border-surface-border text-center">
        <div>
          <span className="text-[11px] font-medium text-ink-secondary uppercase tracking-wider block">
            Advertised Rent
          </span>
          <span className="text-lg font-semibold text-ink-primary">
            ₹{pricing.startingRent.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-ink-muted block">/month</span>
        </div>
        <div className="border-l border-surface-border">
          <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider block">
            Estimated Actual Cost
          </span>
          <span className="text-xl font-bold text-brand-700">
            ≈ ₹{totalEstimated.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-brand-800 font-medium block">/month total</span>
        </div>
      </div>

      {/* Itemized Cost Breakdown Table */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center py-1.5 border-b border-surface-border">
          <span className="text-ink-secondary">Base Room Rent</span>
          <span className="font-semibold text-ink-primary">₹{pricing.startingRent.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-surface-border">
          <div className="flex items-center space-x-1.5">
            <span className="text-ink-secondary">Mess & Meals</span>
            {food === 0 && (
              <span className="text-[10px] text-success-700 bg-success-50 px-1.5 py-0.2 rounded font-medium">
                Included in rent
              </span>
            )}
          </div>
          <span className="font-semibold text-ink-primary">
            {food > 0 ? `₹${food.toLocaleString('en-IN')}` : '₹0'}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-surface-border">
          <div className="flex items-center space-x-1.5">
            <span className="text-ink-secondary">Electricity (AC / Room)</span>
            {elec > 0 && <span className="text-[10px] text-ink-muted">(Est. sub-meter avg)</span>}
          </div>
          <span className="font-semibold text-ink-primary">
            {elec > 0 ? `≈ ₹${elec.toLocaleString('en-IN')}` : 'Included'}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-surface-border">
          <span className="text-ink-secondary">Maintenance & Housekeeping</span>
          <span className="font-semibold text-ink-primary">
            {maint > 0 ? `₹${maint.toLocaleString('en-IN')}` : 'Included'}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-surface-border">
          <span className="text-ink-secondary">High-Speed Wi-Fi</span>
          <span className="font-semibold text-ink-primary">
            {wifi > 0 ? `₹${wifi.toLocaleString('en-IN')}` : 'Included'}
          </span>
        </div>

        {/* Security Deposit note */}
        <div className="flex justify-between items-center pt-2 font-semibold text-ink-primary text-sm">
          <span>Security Deposit (Refundable)</span>
          <span className="text-brand-700">₹{pricing.deposit.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Info Notice */}
      <div className="flex items-start space-x-2 text-[11px] text-ink-muted pt-2 border-t border-surface-border">
        <Info className="w-3.5 h-3.5 shrink-0 text-brand-700 mt-0.5" />
        <p>
          This estimated breakdown helps you budget realistically. Electricity varies based on individual AC usage during summer months.
        </p>
      </div>
    </div>
  );
};
