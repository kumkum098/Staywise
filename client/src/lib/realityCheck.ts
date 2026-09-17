import { NearbyPlace, Property } from '../types';

export const deriveRealityCheck = (property: Property): { goodFor: string[]; thingsToKnow: string[] } => {
  const goodFor: string[] = [];
  const thingsToKnow: string[] = [];
  const { houseRules, amenities, location, gender } = property;

  const nearestCollege = location.nearby.find((n) => n.category === 'college');
  if (nearestCollege) {
    goodFor.push(`Students near ${location.area}'s colleges`);
  }
  if (gender === 'male' || gender === 'female') {
    goodFor.push(`${gender === 'male' ? 'Male' : 'Female'} students and professionals`);
  } else {
    goodFor.push('Renters comfortable with a mixed-gender community');
  }
  if (houseRules.curfew && houseRules.curfew !== 'No Curfew') {
    goodFor.push('People who prefer a structured, rule-following environment');
  } else {
    goodFor.push('Night-shift workers and late risers');
  }
  if (amenities.includes('Study Desk')) {
    goodFor.push('Focused students preparing for exams');
  }

  if (houseRules.curfew && houseRules.curfew !== 'No Curfew') {
    thingsToKnow.push(`Curfew is enforced at ${houseRules.curfew}`);
  }
  if (!houseRules.visitorsAllowed) {
    thingsToKnow.push('Visitors are not permitted');
  } else if (houseRules.visitorPolicy) {
    thingsToKnow.push(houseRules.visitorPolicy);
  }
  if (houseRules.noticePeriodDays >= 45) {
    thingsToKnow.push(`Long notice period of ${houseRules.noticePeriodDays} days before moving out`);
  }
  if (!houseRules.smokingAllowed) {
    thingsToKnow.push('Smoking is not allowed on the premises');
  }

  return {
    goodFor: Array.from(new Set(goodFor)).slice(0, 4),
    thingsToKnow: Array.from(new Set(thingsToKnow)).slice(0, 4),
  };
};

const CATEGORY_LABELS: Record<NearbyPlace['category'], string> = {
  college: 'Colleges',
  metro: 'Metro',
  grocery: 'Grocery',
  gym: 'Gyms',
  hospital: 'Hospitals',
  restaurant: 'Restaurants',
};

export const groupNearbyByCategory = (nearby: NearbyPlace[]): Record<string, NearbyPlace[]> => {
  const grouped: Record<string, NearbyPlace[]> = {};
  for (const place of nearby) {
    if (!grouped[place.category]) grouped[place.category] = [];
    grouped[place.category].push(place);
  }
  Object.values(grouped).forEach((list) => list.sort((a, b) => a.distanceKm - b.distanceKm));
  return grouped;
};

export const buildNeighborhoodBlurb = (nearby: NearbyPlace[]): string => {
  if (!nearby || nearby.length === 0) {
    return 'Neighborhood details are not available for this listing yet.';
  }
  const sorted = [...nearby].sort((a, b) => a.travelTimeMins - b.travelTimeMins);
  const parts = sorted.slice(0, 2).map((n) => `${n.travelTimeMins} min to ${n.name}`);
  return `${parts.join(', ')} — a well-connected spot for daily commuting.`;
};

export { CATEGORY_LABELS };
