import { IProperty, INearbyPlace } from '../models/Property.js';

type MinimalProperty = Pick<IProperty, 'gender' | 'propertyType' | 'houseRules' | 'amenities' | 'location'>;

export const deriveGoodFor = (property: MinimalProperty): string[] => {
  const tags: string[] = [];
  const nearestCollege = property.location.nearby.find((n) => n.category === 'college');

  if (nearestCollege) {
    tags.push(`Students near ${property.location.area}'s colleges`);
  }
  if (property.gender === 'male' || property.gender === 'female') {
    tags.push(`${property.gender === 'male' ? 'Male' : 'Female'} students and professionals`);
  } else {
    tags.push('Renters comfortable with a mixed-gender community');
  }
  if (property.houseRules.curfew && property.houseRules.curfew !== 'No Curfew') {
    tags.push('People who prefer a structured, rule-following environment');
  } else {
    tags.push('Night-shift workers and late risers');
  }
  if (property.amenities.includes('Study Desk')) {
    tags.push('Focused students preparing for exams');
  }
  if (property.amenities.includes('Gym') || property.amenities.includes('Housekeeping')) {
    tags.push('Working professionals wanting convenience');
  }

  return Array.from(new Set(tags)).slice(0, 4);
};

export const deriveThingsToKnow = (property: MinimalProperty): string[] => {
  const notes: string[] = [];
  const { houseRules } = property;

  if (houseRules.curfew && houseRules.curfew !== 'No Curfew') {
    notes.push(`Curfew is enforced at ${houseRules.curfew}`);
  }
  if (!houseRules.visitorsAllowed) {
    notes.push('Visitors are not permitted');
  } else if (houseRules.visitorPolicy) {
    notes.push(houseRules.visitorPolicy);
  }
  if (houseRules.noticePeriodDays >= 45) {
    notes.push(`Long notice period of ${houseRules.noticePeriodDays} days before moving out`);
  }
  if (!houseRules.smokingAllowed) {
    notes.push('Smoking is not allowed on the premises');
  }

  return Array.from(new Set(notes)).slice(0, 4);
};

const CATEGORY_LABELS: Record<INearbyPlace['category'], string> = {
  college: 'Colleges',
  metro: 'Metro',
  grocery: 'Grocery',
  gym: 'Gyms',
  hospital: 'Hospitals',
  restaurant: 'Restaurants',
};

export const deriveNearbyByCategory = (nearby: INearbyPlace[]): Record<string, INearbyPlace[]> => {
  const grouped: Record<string, INearbyPlace[]> = {};
  for (const place of nearby) {
    const key = place.category;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(place);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.distanceKm - b.distanceKm);
  }
  return grouped;
};

export const deriveAreaHighlights = (location: MinimalProperty['location']): string[] => {
  const { nearby } = location;
  const highlights: string[] = [];

  const hasCollege = nearby.some((n) => n.category === 'college');
  const metro = nearby.find((n) => n.category === 'metro');
  const essentials = nearby.filter((n) => n.category === 'grocery' || n.category === 'restaurant');

  if (hasCollege) {
    highlights.push('Close to educational institutions');
  }
  if (metro && metro.distanceKm < 1) {
    highlights.push('Excellent metro connectivity');
  } else if (metro) {
    highlights.push('Reasonable metro access');
  }
  if (essentials.length >= 2) {
    highlights.push('Well-stocked for daily essentials');
  }
  if (nearby.length > 0 && nearby.every((n) => n.travelTimeMins < 15)) {
    highlights.push('Everything within a 15-minute reach');
  }
  if (highlights.length === 0) {
    highlights.push(`Located in ${location.area}, ${location.city}`);
  }

  return Array.from(new Set(highlights));
};

export { CATEGORY_LABELS };
