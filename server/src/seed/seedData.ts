import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';
import { User } from '../models/User.js';
import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { Review } from '../models/Review.js';
import { Favorite } from '../models/Favorite.js';
import { Inquiry } from '../models/Inquiry.js';
import { Visit } from '../models/Visit.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staywise';
const DEMO_EMAILS = ['tenant@staywise.dev', 'owner@staywise.dev', 'admin@staywise.dev'];
const DEMO_SLUGS = [
  'urban-nest-pg-malviya',
  'campus-corner-jagatpura',
  'pink-city-residency-mansarovar',
  'haven-coliving-vaishali',
  'the-local-house-raja-park',
  'nest-21-c-scheme',
  'aangan-girls-pg-malviya',
  'the-student-house-jagatpura',
  'citystay-hostel-mansarovar',
  'rangrez-pg-vaishali',
  'study-haven-raja-park',
  'terracotta-living-c-scheme',
  'sunrise-boys-pg-jagatpura',
  'pink-pearl-hostel-malviya',
  'quiet-courtyard-mansarovar',
];

type SeedRoom = {
  name: string;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  rent: number;
  available: boolean;
  totalUnits: number;
  occupiedUnits: number;
  features: string[];
};

type SeedProperty = {
  name: string;
  slug: string;
  description: string;
  propertyType: 'pg' | 'hostel' | 'coliving' | 'apartment';
  gender: 'male' | 'female' | 'unisex';
  location: {
    address: string;
    area: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
    nearby: Array<{ name: string; distanceKm: number; travelTimeMins: number; category: 'college' | 'metro' | 'grocery' | 'gym' | 'hospital' | 'restaurant' }>;
  };
  images: string[];
  amenities: string[];
  pricing: { startingRent: number; deposit: number; foodCost: number; electricityCost: number; maintenanceCost: number; wifiCost: number };
  houseRules: { curfew: string; visitorsAllowed: boolean; visitorPolicy: string; smokingAllowed: boolean; alcoholAllowed: boolean; petsAllowed: boolean; noticePeriodDays: number };
  livingScore: { cleanliness: number; internet: number; food: number; quietness: number; location: number; privacy: number; safety: number; overall: number };
  verification: { isVerified: boolean; verifiedDate?: Date };
  beforeYouBook: string[];
  goodFor?: string[];
  thingsToKnow?: string[];
  rating: number;
  isFeatured: boolean;
  rooms: SeedRoom[];
};

const imageSets = [
  ['photo-1555854877-bab0e564b8d5', 'photo-1598928506311-c55ded91a20c', 'photo-1586023492125-27b2c045efd7'],
  ['photo-1502672260266-1c1ef2d93688', 'photo-1595526114035-0d45ed16cfbf', 'photo-1513694203232-719a280e022f'],
  ['photo-1522708323590-d24dbb6b0267', 'photo-1502005229762-cf1b2da7c5d6', 'photo-1484154218962-a197022b5858'],
  ['photo-1540518614846-7eded433c457', 'photo-1505693416388-ac5ce068fe85', 'photo-1507652313519-d4e9174996dd'],
  ['photo-1512918728675-ed5a9ecdebfd', 'photo-1493809842364-78817add7ffb', 'photo-1600585154340-be6161a56a0c'],
];

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;
const images = (set: number) => imageSets[set % imageSets.length].map(img);
const place = (name: string, distanceKm: number, category: 'college' | 'metro' | 'grocery' | 'gym' | 'hospital' | 'restaurant') => ({ name, distanceKm, travelTimeMins: Math.max(2, Math.round(distanceKm * 4)), category });
const scores = (overall: number, food: number, quietness: number, privacy: number, location: number) => ({ cleanliness: Number((overall + 0.2).toFixed(1)), internet: Number((overall - 0.1).toFixed(1)), food, quietness, location, privacy, safety: Number((overall + 0.1).toFixed(1)), overall });
const room = (name: string, type: SeedRoom['type'], capacity: number, rent: number, occupiedUnits: number, totalUnits: number, features: string[], available = occupiedUnits < totalUnits): SeedRoom => ({ name, type, capacity, rent, available, totalUnits, occupiedUnits, features });

const propertiesData: SeedProperty[] = [
  {
    name: 'Urban Nest PG', slug: 'urban-nest-pg-malviya', description: 'A practical, friendly PG for students near MNIT with reliable internet, simple meals, and a quiet study floor.', propertyType: 'pg', gender: 'unisex', location: { address: 'Plot 18, Sector 5, Malviya Nagar', area: 'Malviya Nagar', city: 'Jaipur', pincode: '302017', lat: 26.852, lng: 75.815, nearby: [place('MNIT Jaipur', 0.8, 'college'), place('World Trade Park', 1.2, 'grocery')] }, images: images(0), amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'Study Desk', 'Power Backup'], pricing: { startingRent: 9200, deposit: 18400, foodCost: 1200, electricityCost: 450, maintenanceCost: 250, wifiCost: 0 }, houseRules: { curfew: '11:00 PM', visitorsAllowed: true, visitorPolicy: 'Visitors allowed in the lobby until 9 PM', smokingAllowed: false, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 30 }, livingScore: scores(8.1, 7.4, 8.5, 7.8, 9.2), verification: { isVerified: true, verifiedDate: new Date() }, beforeYouBook: ['Electricity is billed separately by sub-meter', 'No brokerage or onboarding fee'], goodFor: ['Students near MNIT Jaipur', 'People who prefer a structured, rule-following environment'], thingsToKnow: ['Curfew is enforced at 11:00 PM', 'Electricity billed separately by sub-meter'], rating: 4.2, isFeatured: true, rooms: [room('Double Sharing AC', 'double', 2, 9200, 8, 10, ['Study table', 'Wardrobe']), room('Triple Sharing', 'triple', 3, 7600, 6, 6, ['Locker', 'Study desk'])],
  },
  {
    name: 'Campus Corner', slug: 'campus-corner-jagatpura', description: 'A budget student hostel close to JECRC and SKIT, with a social common room and straightforward monthly pricing.', propertyType: 'hostel', gender: 'male', location: { address: '24 Ramnagariya Road, Jagatpura', area: 'Jagatpura', city: 'Jaipur', pincode: '302017', lat: 26.818, lng: 75.842, nearby: [place('JECRC University', 0.7, 'college'), place('Fresh Mart', 0.3, 'grocery')] }, images: images(1), amenities: ['Wi-Fi', 'Food', 'Laundry', 'Common Area', 'Parking', 'Study Desk'], pricing: { startingRent: 6800, deposit: 6800, foodCost: 0, electricityCost: 300, maintenanceCost: 150, wifiCost: 0 }, houseRules: { curfew: '10:30 PM', visitorsAllowed: false, visitorPolicy: 'No outside visitors inside rooms', smokingAllowed: false, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 30 }, livingScore: scores(7.2, 7.6, 7.0, 6.8, 8.8), verification: { isVerified: true, verifiedDate: new Date() }, beforeYouBook: ['Meals are included in the rent', 'Shared rooms have fixed occupancy'], goodFor: ['Male students near JECRC and SKIT', 'Budget-conscious renters'], thingsToKnow: ['Curfew is enforced at 10:30 PM', 'Visitors are not permitted inside rooms'], rating: 3.9, isFeatured: true, rooms: [room('Triple Sharing Economy', 'triple', 3, 6800, 7, 8, ['Locker', 'Study desk']), room('Double Sharing', 'double', 2, 7800, 6, 6, ['Cupboard'])],
  },
  {
    name: 'Pink City Residency', slug: 'pink-city-residency-mansarovar', description: 'Independent rooms near Mansarovar Metro for residents who prefer self-cooking, flexible access, and more privacy.', propertyType: 'apartment', gender: 'unisex', location: { address: '112/45 Shipra Path, Mansarovar', area: 'Mansarovar', city: 'Jaipur', pincode: '302020', lat: 26.862, lng: 75.768, nearby: [place('Mansarovar Metro', 0.5, 'metro'), place('D-Mart Mansarovar', 0.9, 'grocery')] }, images: images(2), amenities: ['Wi-Fi', 'AC', 'Attached Bathroom', 'Modular Kitchen', 'Laundry', 'Parking', 'Power Backup'], pricing: { startingRent: 10500, deposit: 21000, foodCost: 0, electricityCost: 600, maintenanceCost: 400, wifiCost: 300 }, houseRules: { curfew: 'No Curfew', visitorsAllowed: true, visitorPolicy: 'Guests require advance registration', smokingAllowed: true, alcoholAllowed: false, petsAllowed: true, noticePeriodDays: 30 }, livingScore: scores(8.7, 6.5, 9.0, 9.2, 9.4), verification: { isVerified: true, verifiedDate: new Date() }, beforeYouBook: ['Self-cooking kitchen in every unit', 'Electricity and Wi-Fi are billed separately'], goodFor: ['Renters comfortable with a mixed-gender community', 'Night-shift workers and late risers', 'Working professionals wanting convenience'], thingsToKnow: ['No fixed curfew', 'Guests require advance registration'], rating: 4.6, isFeatured: true, rooms: [room('Private Studio', 'single', 1, 14500, 3, 4, ['Kitchenette', 'Washing machine']), room('Private Room in 2BHK', 'single', 1, 10500, 7, 8, ['Shared kitchen', 'Private bath'])],
  },
  {
    name: 'Haven Co-Living', slug: 'haven-coliving-vaishali', description: 'A polished co-living residence with strong security, bright common spaces, and daily housekeeping near Queens Road.', propertyType: 'coliving', gender: 'female', location: { address: 'B-18 Queens Road, Vaishali Nagar', area: 'Vaishali Nagar', city: 'Jaipur', pincode: '302021', lat: 26.912, lng: 75.748, nearby: [place('National Handloom', 0.4, 'grocery'), place('Shyam Nagar Metro', 1.9, 'metro')] }, images: images(3), amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'Housekeeping', '24/7 Security', 'Common Lounge'], pricing: { startingRent: 11800, deposit: 23600, foodCost: 0, electricityCost: 400, maintenanceCost: 300, wifiCost: 0 }, houseRules: { curfew: '10:00 PM', visitorsAllowed: true, visitorPolicy: 'Parents allowed in lounge until 7 PM', smokingAllowed: false, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 45 }, livingScore: scores(8.9, 8.7, 8.8, 8.6, 8.9), verification: { isVerified: true, verifiedDate: new Date() }, beforeYouBook: ['Meals are included in base rent', 'Female visitors only after 7 PM'], rating: 4.7, isFeatured: true, rooms: [room('Single Deluxe', 'single', 1, 14500, 5, 6, ['Attached bath', 'Desk']), room('Double Sharing', 'double', 2, 11800, 8, 10, ['Wardrobe', 'Study unit'])],
  },
  {
    name: 'The Local House', slug: 'the-local-house-raja-park', description: 'An energetic co-living home in Raja Park, close to coaching centres, cafes, and late-evening essentials.', propertyType: 'coliving', gender: 'unisex', location: { address: '58 Lane 4, Raja Park', area: 'Raja Park', city: 'Jaipur', pincode: '302004', lat: 26.892, lng: 75.828, nearby: [place('Allen Coaching Center', 0.5, 'college'), place('Raja Park Market', 0.2, 'restaurant')] }, images: images(4), amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'Housekeeping', 'Study Desk', 'Terrace Garden'], pricing: { startingRent: 8200, deposit: 8200, foodCost: 1000, electricityCost: 400, maintenanceCost: 200, wifiCost: 0 }, houseRules: { curfew: '10:30 PM', visitorsAllowed: true, visitorPolicy: 'Common-area visitors until 8:30 PM', smokingAllowed: false, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 30 }, livingScore: scores(7.8, 8.2, 6.9, 7.5, 9.5), verification: { isVerified: false }, beforeYouBook: ['The neighbourhood stays lively late into the evening', 'Food is vegetarian and served at fixed times'], rating: 4.1, isFeatured: false, rooms: [room('Double Sharing AC', 'double', 2, 8200, 7, 8, ['Attached bath', 'Storage']), room('Single Room', 'single', 1, 11500, 3, 3, ['Balcony', 'Study chair'])],
  },
  {
    name: 'Nest 21', slug: 'nest-21-c-scheme', description: 'Quiet executive-style accommodation in central Jaipur for interns and young professionals who value space and reliable service.', propertyType: 'coliving', gender: 'unisex', location: { address: '14 Ashok Marg, C-Scheme', area: 'C-Scheme', city: 'Jaipur', pincode: '302001', lat: 26.915, lng: 75.802, nearby: [place('Statue Circle', 0.6, 'restaurant'), place('Vidhan Sabha Metro', 1.2, 'metro')] }, images: images(0), amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'Housekeeping', 'Gym', 'Power Backup'], pricing: { startingRent: 14500, deposit: 29000, foodCost: 1500, electricityCost: 500, maintenanceCost: 500, wifiCost: 0 }, houseRules: { curfew: 'No Curfew', visitorsAllowed: true, visitorPolicy: 'Registered visitors allowed until 10 PM', smokingAllowed: false, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 60 }, livingScore: scores(9.0, 8.8, 9.4, 9.0, 9.7), verification: { isVerified: true, verifiedDate: new Date() }, beforeYouBook: ['Quiet hours begin at 10 PM', 'Premium pricing reflects central location and housekeeping'], rating: 4.8, isFeatured: true, rooms: [room('Executive Private', 'single', 1, 17500, 3, 4, ['Balcony', 'Ergonomic desk']), room('Deluxe Twin', 'double', 2, 14500, 5, 6, ['Marble bath'])],
  },
  {
    name: 'Aangan Girls PG', slug: 'aangan-girls-pg-malviya', description: 'A family-managed girls PG with homely meals, a secure perimeter, and a strict routine near MNIT Gate 2.', propertyType: 'pg', gender: 'female', location: { address: '12/104 Sector 1, Malviya Nagar', area: 'Malviya Nagar', city: 'Jaipur', pincode: '302017', lat: 26.858, lng: 75.812, nearby: [place('MNIT Gate 2', 1.1, 'college'), place('Gaurav Tower', 0.9, 'grocery')] }, images: images(1), amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'Housekeeping', 'Power Backup', 'Security Guard'], pricing: { startingRent: 8500, deposit: 8500, foodCost: 0, electricityCost: 400, maintenanceCost: 200, wifiCost: 0 }, houseRules: { curfew: '9:30 PM', visitorsAllowed: true, visitorPolicy: 'Parents allowed until 7 PM', smokingAllowed: false, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 30 }, livingScore: scores(8.4, 8.9, 8.5, 7.7, 9.0), verification: { isVerified: true, verifiedDate: new Date() }, beforeYouBook: ['Strict curfew is enforced daily', 'Fresh vegetarian meals are included'], rating: 4.3, isFeatured: false, rooms: [room('Single AC Room', 'single', 1, 11800, 2, 3, ['Attached bath', 'Study desk']), room('Double Sharing', 'double', 2, 8500, 7, 8, ['Wardrobe'])],
  },
  {
    name: 'The Student House', slug: 'the-student-house-jagatpura', description: 'An affordable, social hostel for college students with a gaming room, shared library, and bus connectivity.', propertyType: 'hostel', gender: 'male', location: { address: 'Plot 77, Near SKIT Circle, Jagatpura', area: 'Jagatpura', city: 'Jaipur', pincode: '302017', lat: 26.825, lng: 75.855, nearby: [place('SKIT College', 0.4, 'college'), place('Jagatpura Station', 2.2, 'metro')] }, images: images(2), amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'Study Desk', 'Common Area', 'Parking'], pricing: { startingRent: 7200, deposit: 7200, foodCost: 0, electricityCost: 300, maintenanceCost: 150, wifiCost: 0 }, houseRules: { curfew: '10:30 PM', visitorsAllowed: false, visitorPolicy: 'Visitors are restricted to the common room', smokingAllowed: false, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 30 }, livingScore: scores(7.6, 7.8, 7.2, 7.1, 8.7), verification: { isVerified: false }, beforeYouBook: ['Common spaces can be lively after classes', 'Electricity is charged separately'], rating: 4.0, isFeatured: true, rooms: [room('Double Sharing', 'double', 2, 7600, 8, 8, ['Study table']), room('Triple Sharing', 'triple', 3, 7200, 6, 8, ['Locker'])],
  },
  {
    name: 'CityStay Hostel', slug: 'citystay-hostel-mansarovar', description: 'A no-frills hostel beside the metro with flexible access, compact rooms, and a useful shared kitchen.', propertyType: 'hostel', gender: 'unisex', location: { address: '88 Madhyam Marg, Mansarovar', area: 'Mansarovar', city: 'Jaipur', pincode: '302020', lat: 26.873, lng: 75.766, nearby: [place('Mansarovar Metro', 0.4, 'metro'), place('D-Mart Mansarovar', 1.1, 'grocery')] }, images: images(3), amenities: ['Wi-Fi', 'AC', 'Laundry', 'Modular Kitchen', 'Parking'], pricing: { startingRent: 6400, deposit: 6400, foodCost: 0, electricityCost: 550, maintenanceCost: 100, wifiCost: 200 }, houseRules: { curfew: 'No Curfew', visitorsAllowed: true, visitorPolicy: 'Registered visitors allowed in common areas', smokingAllowed: true, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 15 }, livingScore: scores(7.0, 6.2, 7.8, 7.6, 9.1), verification: { isVerified: false }, beforeYouBook: ['Food is not provided; shared kitchen is available', 'Wi-Fi is an additional monthly charge'], rating: 3.8, isFeatured: false, rooms: [room('Double Sharing', 'double', 2, 6400, 5, 8, ['Shared kitchen']), room('Triple Sharing', 'triple', 3, 5900, 8, 8, ['Locker'])],
  },
  {
    name: 'Rangrez PG', slug: 'rangrez-pg-vaishali', description: 'A comfortable mixed PG in Vaishali Nagar with a small rooftop, regular housekeeping, and dependable owner support.', propertyType: 'pg', gender: 'unisex', location: { address: 'A-7 Gandhi Path, Vaishali Nagar', area: 'Vaishali Nagar', city: 'Jaipur', pincode: '302021', lat: 26.907, lng: 75.741, nearby: [place('Vaishali Metro', 1.4, 'metro'), place('Local Market', 0.5, 'grocery')] }, images: images(4), amenities: ['Wi-Fi', 'AC', 'Food', 'Housekeeping', 'Power Backup', 'Terrace'], pricing: { startingRent: 7800, deposit: 7800, foodCost: 900, electricityCost: 350, maintenanceCost: 150, wifiCost: 0 }, houseRules: { curfew: '10:00 PM', visitorsAllowed: true, visitorPolicy: 'Visitors allowed in common areas until 8 PM', smokingAllowed: false, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 30 }, livingScore: scores(7.9, 7.5, 8.0, 7.6, 8.3), verification: { isVerified: true, verifiedDate: new Date() }, beforeYouBook: ['Rooftop closes after 9 PM', 'Meals are served on a fixed weekly menu'], rating: 4.1, isFeatured: false, rooms: [room('Double Sharing', 'double', 2, 7800, 5, 8, ['Wardrobe', 'Study table']), room('Single Room', 'single', 1, 10800, 2, 3, ['Attached bath'])],
  },
  {
    name: 'Study Haven', slug: 'study-haven-raja-park', description: 'A focused residence for exam preparation with desk space in every room and quiet hours enforced after dinner.', propertyType: 'pg', gender: 'female', location: { address: '12 Gali 2, Raja Park', area: 'Raja Park', city: 'Jaipur', pincode: '302004', lat: 26.889, lng: 75.824, nearby: [place('Subodh College', 1.1, 'college'), place('Raja Park Market', 0.3, 'grocery')] }, images: images(0), amenities: ['Wi-Fi', 'AC', 'Food', 'Study Desk', 'Power Backup', 'Housekeeping'], pricing: { startingRent: 9800, deposit: 9800, foodCost: 1100, electricityCost: 350, maintenanceCost: 200, wifiCost: 0 }, houseRules: { curfew: '10:00 PM', visitorsAllowed: true, visitorPolicy: 'Visitors allowed until 7 PM', smokingAllowed: false, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 45 }, livingScore: scores(8.5, 8.0, 9.2, 8.2, 8.8), verification: { isVerified: true, verifiedDate: new Date() }, beforeYouBook: ['Quiet study hours from 8 PM to 7 AM', 'Single rooms have limited availability'], rating: 4.5, isFeatured: true, rooms: [room('Single Study Room', 'single', 1, 13200, 2, 3, ['Large desk', 'Book shelf']), room('Double Sharing', 'double', 2, 9800, 5, 6, ['Study desk'])],
  },
  {
    name: 'Terracotta Living', slug: 'terracotta-living-c-scheme', description: 'A design-forward co-living home with excellent central access, compact private rooms, and a quieter resident community.', propertyType: 'coliving', gender: 'unisex', location: { address: '27 Prithviraj Road, C-Scheme', area: 'C-Scheme', city: 'Jaipur', pincode: '302001', lat: 26.912, lng: 75.799, nearby: [place('Statue Circle', 0.8, 'restaurant'), place('Central Park', 0.6, 'grocery')] }, images: images(1), amenities: ['Wi-Fi', 'AC', 'Laundry', 'Housekeeping', 'Common Lounge', 'Power Backup'], pricing: { startingRent: 13200, deposit: 26400, foodCost: 0, electricityCost: 450, maintenanceCost: 450, wifiCost: 0 }, houseRules: { curfew: 'No Curfew', visitorsAllowed: true, visitorPolicy: 'Registered guests allowed until 10 PM', smokingAllowed: false, alcoholAllowed: false, petsAllowed: true, noticePeriodDays: 60 }, livingScore: scores(8.8, 6.8, 9.1, 9.0, 9.6), verification: { isVerified: true, verifiedDate: new Date() }, beforeYouBook: ['Food is not provided', 'Pets require prior approval from management'], rating: 4.4, isFeatured: false, rooms: [room('Private Room', 'single', 1, 13200, 3, 5, ['Balcony', 'Desk']), room('Twin Suite', 'double', 2, 11200, 4, 6, ['Lounge area'])],
  },
  {
    name: 'Sunrise Boys PG', slug: 'sunrise-boys-pg-jagatpura', description: 'A simple, value-led boys PG near coaching centres with low rent, included meals, and basic but functional rooms.', propertyType: 'pg', gender: 'male', location: { address: '7 Mahima Nagar, Jagatpura', area: 'Jagatpura', city: 'Jaipur', pincode: '302017', lat: 26.83, lng: 75.849, nearby: [place('Poornima University', 1.2, 'college'), place('Jagatpura Grocery Hub', 0.4, 'grocery')] }, images: images(2), amenities: ['Wi-Fi', 'Food', 'Laundry', 'Parking', 'Common Area'], pricing: { startingRent: 5800, deposit: 5800, foodCost: 0, electricityCost: 250, maintenanceCost: 100, wifiCost: 0 }, houseRules: { curfew: '10:00 PM', visitorsAllowed: false, visitorPolicy: 'No outside visitors', smokingAllowed: false, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 15 }, livingScore: scores(6.8, 6.7, 6.5, 6.4, 8.1), verification: { isVerified: false }, beforeYouBook: ['Basic furnishing; inspect the room before confirming', 'Strict visitor policy'], rating: 3.6, isFeatured: false, rooms: [room('Triple Sharing', 'triple', 3, 5800, 8, 8, ['Locker']), room('Double Sharing', 'double', 2, 6400, 4, 6, ['Cupboard'])],
  },
  {
    name: 'Pink Pearl Hostel', slug: 'pink-pearl-hostel-malviya', description: 'A secure women-only hostel near shopping and college routes, balancing reasonable rent with a structured daily routine.', propertyType: 'hostel', gender: 'female', location: { address: 'C-42 Sector 6, Malviya Nagar', area: 'Malviya Nagar', city: 'Jaipur', pincode: '302017', lat: 26.848, lng: 75.82, nearby: [place('MNIT Jaipur', 1.5, 'college'), place('World Trade Park', 0.8, 'grocery')] }, images: images(3), amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', '24/7 Security', 'Common Lounge'], pricing: { startingRent: 8600, deposit: 17200, foodCost: 0, electricityCost: 450, maintenanceCost: 250, wifiCost: 0 }, houseRules: { curfew: '10:30 PM', visitorsAllowed: true, visitorPolicy: 'Female visitors in reception until 8 PM', smokingAllowed: false, alcoholAllowed: false, petsAllowed: false, noticePeriodDays: 30 }, livingScore: scores(8.1, 7.9, 8.0, 7.8, 9.0), verification: { isVerified: true, verifiedDate: new Date() }, beforeYouBook: ['Meals included; menu is shared weekly', 'Biometric entry is required'], rating: 4.2, isFeatured: false, rooms: [room('Double Sharing', 'double', 2, 8600, 7, 9, ['Wardrobe', 'Study lamp']), room('Triple Sharing', 'triple', 3, 7400, 6, 6, ['Locker'])],
  },
  {
    name: 'Quiet Courtyard', slug: 'quiet-courtyard-mansarovar', description: 'A small, calm residence for readers and remote workers with strong internet, fewer rooms, and no food service.', propertyType: 'apartment', gender: 'unisex', location: { address: '45 Sanganer Road, Mansarovar', area: 'Mansarovar', city: 'Jaipur', pincode: '302020', lat: 26.854, lng: 75.775, nearby: [place('Mansarovar Metro', 1.0, 'metro'), place('City Park', 0.7, 'grocery')] }, images: images(4), amenities: ['Wi-Fi', 'AC', 'Attached Bathroom', 'Modular Kitchen', 'Laundry', 'Power Backup'], pricing: { startingRent: 11200, deposit: 22400, foodCost: 0, electricityCost: 500, maintenanceCost: 350, wifiCost: 250 }, houseRules: { curfew: 'No Curfew', visitorsAllowed: true, visitorPolicy: 'Guests allowed with resident registration', smokingAllowed: false, alcoholAllowed: false, petsAllowed: true, noticePeriodDays: 30 }, livingScore: scores(8.6, 6.0, 9.3, 9.1, 8.7), verification: { isVerified: true, verifiedDate: new Date() }, beforeYouBook: ['No meal service; kitchen access is included', 'Internet is a separate recurring charge'], rating: 4.3, isFeatured: false, rooms: [room('Private Room', 'single', 1, 11200, 2, 3, ['Desk', 'Private bath']), room('Twin Room', 'double', 2, 9600, 3, 4, ['Shared kitchen'])],
  },
];

const reviewComments = [
  'Rooms are clean and the area is safe, but Wi-Fi slows down at night.',
  'Very close to college. Food is decent but repetitive.',
  'Owner is responsive and maintenance issues are usually fixed quickly.',
  'Good place if you prefer quiet evenings. Not ideal if you want a very social hostel.',
  'Rent is reasonable, but electricity is charged separately.',
];

const seedDatabase = async () => {
  const existingDemoProperties = await Property.find({ slug: { $in: DEMO_SLUGS } }).select('_id');
  const existingDemoPropertyIds = existingDemoProperties.map((property) => property._id);

  if (existingDemoPropertyIds.length > 0) {
    await Promise.all([
      Room.deleteMany({ property: { $in: existingDemoPropertyIds } }),
      Review.deleteMany({ property: { $in: existingDemoPropertyIds } }),
      Favorite.deleteMany({ property: { $in: existingDemoPropertyIds } }),
      Inquiry.deleteMany({ property: { $in: existingDemoPropertyIds } }),
      Visit.deleteMany({ property: { $in: existingDemoPropertyIds } }),
    ]);
    await Property.deleteMany({ _id: { $in: existingDemoPropertyIds } });
  }

  await User.deleteMany({ email: { $in: DEMO_EMAILS } });

  const passwordHash = await bcrypt.hash('Staywise123!', 10);
  const [tenantUser, ownerUser, adminUser] = await User.create([
    { name: 'Rohan Sharma', email: 'tenant@staywise.dev', passwordHash, role: 'tenant', phone: '+91 98765 43210', preferences: { minBudget: 7000, maxBudget: 12000, quietness: 8, privacy: 8, foodRequired: true, acRequired: true, roomType: 'double', preferredArea: 'Malviya Nagar', maxDistanceKm: 3 } },
    { name: 'Rajesh Verma', email: 'owner@staywise.dev', passwordHash, role: 'owner', phone: '+91 98123 88990', preferences: {} },
    { name: 'Staywise Admin', email: 'admin@staywise.dev', passwordHash, role: 'admin', phone: '+91 90000 11111', preferences: {} },
  ]);

  const properties = [];
  let roomCount = 0;
  let reviewCount = 0;

  for (const [index, propertyData] of propertiesData.entries()) {
    const { rooms, ...propertyFields } = propertyData;
    const property = await Property.create({ ...propertyFields, owner: ownerUser._id });
    properties.push(property);

    const createdRooms = await Room.insertMany(rooms.map((roomData) => ({ ...roomData, property: property._id })));
    roomCount += createdRooms.length;

    const comments = [reviewComments[index % reviewComments.length], reviewComments[(index + 2) % reviewComments.length]];
    const reviews = await Review.insertMany(comments.map((comment, reviewIndex) => {
      const base = property.livingScore as SeedProperty['livingScore'] & { ownerResponsiveness?: number; valueForMoney?: number };
      const adjustment = reviewIndex === 0 ? 0 : -0.5;
      const score = (value: number) => Math.max(1, Math.min(10, Number((value + adjustment).toFixed(1))));
      const ownerResponsiveness = score(base.ownerResponsiveness ?? 8.0);
      const valueForMoney = score(base.valueForMoney ?? 8.0);
      const isVerified = reviewIndex === 0;
      return {
        property: property._id,
        user: tenantUser._id,
        userName: reviewIndex === 0 ? 'Ananya Gupta' : 'Vikramaditya S.',
        userRole: 'Resident Student',
        cleanliness: score(base.cleanliness),
        internet: score(base.internet),
        food: score(base.food),
        noise: score(base.quietness),
        location: score(base.location),
        privacy: score(base.privacy),
        safety: score(base.safety),
        ownerResponsiveness,
        valueForMoney,
        overall: score(base.overall),
        comment,
        whatIWishIKnew: isVerified ? 'Wish I had asked about the electricity billing cycle before moving in.' : undefined,
        stayDurationMonths: isVerified ? 6 : undefined,
        roomType: isVerified ? 'double' : undefined,
      };
    }));
    reviewCount += reviews.length;
  }

  return { users: 3, properties: properties.length, rooms: roomCount, reviews: reviewCount, demoUsers: [tenantUser, ownerUser, adminUser] };
};

const runStandaloneSeed = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const summary = await seedDatabase();
    console.log('\nSeed completed');
    console.log(`Users: ${summary.users}`);
    console.log(`Properties: ${summary.properties}`);
    console.log(`Rooms: ${summary.rooms}`);
    console.log(`Reviews: ${summary.reviews}`);
    console.log('\nDemo credentials (all use password Staywise123!):');
    console.log('tenant@staywise.dev');
    console.log('owner@staywise.dev');
    console.log('admin@staywise.dev');
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1]?.includes('seedData')) {
  runStandaloneSeed();
}

export { seedDatabase };
