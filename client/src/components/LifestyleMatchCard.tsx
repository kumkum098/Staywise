import React from 'react';
import { Target, CheckCircle2, XCircle, SlidersHorizontal } from 'lucide-react';
import { Property, UserPreferences } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

interface LifestyleMatchCardProps {
  property: Property;
}

export const LifestyleMatchCard: React.FC<LifestyleMatchCardProps> = ({ property }) => {
  const { user } = useAuth();
  const prefs: UserPreferences = user?.preferences || {
    maxBudget: 12000,
    quietness: 7,
    foodRequired: false,
    acRequired: true,
    roomType: 'any',
  };

  // Algorithmic Match Calculation
  const totalCost =
    property.totalEstimatedMonthly ||
    property.pricing.startingRent +
      (property.pricing.foodCost || 0) +
      (property.pricing.electricityCost || 0) +
      (property.pricing.maintenanceCost || 0);

  const maxBudget = prefs.maxBudget || 15000;
  const budgetPass = totalCost <= maxBudget;
  const quietPass = (property.livingScore?.quietness || 8) >= (prefs.quietness || 7);
  const acPass = !prefs.acRequired || property.amenities.includes('AC');
  const wifiPass = property.amenities.includes('Wi-Fi');
  const foodPass = !prefs.foodRequired || property.amenities.includes('Food') || (property.pricing.foodCost || 0) > 0;

  const checks = [
    {
      pass: budgetPass,
      text: budgetPass
        ? `Estimated cost (₹${totalCost.toLocaleString('en-IN')}) is within your ₹${maxBudget.toLocaleString('en-IN')} budget`
        : `Estimated cost (₹${totalCost.toLocaleString('en-IN')}) exceeds your ₹${maxBudget.toLocaleString('en-IN')} max budget target`,
    },
    {
      pass: quietPass,
      text: quietPass
        ? `Quietness rating (${property.livingScore?.quietness.toFixed(1)}/10) matches your focus environment standard`
        : `Quietness score (${property.livingScore?.quietness.toFixed(1)}/10) is below your preferred quiet standard`,
    },
    {
      pass: acPass,
      text: acPass ? 'Air conditioning (AC) available' : 'AC not included in basic room setup',
    },
    {
      pass: wifiPass,
      text: wifiPass ? 'High-speed fiber Wi-Fi included' : 'Wi-Fi not listed in primary amenities',
    },
    {
      pass: foodPass,
      text: foodPass ? 'Mess / food options available on site' : 'Food service not available on site',
    },
  ];

  const passedCount = checks.filter((c) => c.pass).length;
  const matchPercentage = Math.round((passedCount / checks.length) * 100);

  return (
    <div className="bg-white rounded-lg border border-surface-border p-5 shadow-subtle space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded bg-emerald-50 text-emerald-800">
            <Target className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink-primary">Lifestyle Preference Match</h3>
            <p className="text-xs text-ink-secondary">Transparent match calculated against your preferences</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-bold text-emerald-700">{matchPercentage}% Match</span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2 text-xs">
        {checks.map((item, idx) => (
          <div key={idx} className="flex items-start space-x-2">
            {item.pass ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            )}
            <span className={item.pass ? 'text-ink-primary font-medium' : 'text-ink-secondary'}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Footer link to adjust preferences */}
      <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs">
        <span className="text-ink-muted">Based on your saved lifestyle profile</span>
        <Link
          to={ROUTES.profile}
          className="flex items-center space-x-1 text-brand-700 font-semibold hover:underline"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Adjust preferences</span>
        </Link>
      </div>
    </div>
  );
};
