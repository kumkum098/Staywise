import { PricingBreakdown } from '../types';

export const computeTotalMonthlyCost = (pricing: PricingBreakdown): number =>
  pricing.startingRent +
  (pricing.foodCost || 0) +
  (pricing.electricityCost || 0) +
  (pricing.maintenanceCost || 0) +
  (pricing.wifiCost || 0);
