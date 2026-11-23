import { CityPreset, AirQualityData, DailyRecommendation, UserProfile } from './types';

export const POPULAR_CITIES: CityPreset[] = [
  { name: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, typicalWinterAqi: 165, tier: 'Metro' },
  { name: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, typicalWinterAqi: 340, tier: 'NCR' },
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, typicalWinterAqi: 155, tier: 'Coastal Metro' },
  { name: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, typicalWinterAqi: 110, tier: 'Tech Hub' },
  { name: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, typicalWinterAqi: 245, tier: 'East Metro' },
  { name: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567, typicalWinterAqi: 140, tier: 'Urban' },
  { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462, typicalWinterAqi: 290, tier: 'Indo-Gangetic Plain' },
  { name: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, typicalWinterAqi: 95, tier: 'Coastal Metro' },
  { name: 'Patna', state: 'Bihar', country: 'India', latitude: 25.5941, longitude: 85.1376, typicalWinterAqi: 310, tier: 'Indo-Gangetic Plain' },
  { name: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, typicalWinterAqi: 190, tier: 'West Industrial' },
  { name: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, typicalWinterAqi: 210, tier: 'North' },
  { name: 'Chandigarh', state: 'Punjab/Haryana', country: 'India', latitude: 30.7333, longitude: 76.7794, typicalWinterAqi: 175, tier: 'North' },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, typicalWinterAqi: 45, tier: 'Global' },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, typicalWinterAqi: 52, tier: 'Global' }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  city: 'Hyderabad',
  latitude: 17.3850,
  longitude: 78.4867,
  isLiveLocation: false,
  householdMembers: 4,
  hasChildren: true,
  hasElderly: true,
  hasRespiratorySensitivities: false,
  housingType: 'apartment',
  commuteMethod: 'metro',
  outdoorFrequency: 'moderate',
  workStyle: 'hybrid',
  primaryConcern: 'children',
  budgetTier: 'free',
  onboardingCompleted: false,
};

export const DEMO_AIR_QUALITY: AirQualityData = {
  aqi: 182,
  aqiCategory: 'Unhealthy',
  europeanAqi: 78,
  pm2_5: 115.4,
  pm10: 198.2,
  no2: 44.8,
  o3: 32.1,
  so2: 12.3,
  co: 940,
  source: 'Open-Meteo Air Quality (Copernicus CAMS & GFS)',
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
  status: 'DEMO DATA',
  locationName: 'Hyderabad, Telangana',
  latitude: 17.3850,
  longitude: 78.4867,
  interpretation: 'Fine particulate (PM2.5) levels are elevated today. Sensitive groups like young children, elderly family members, and individuals with asthma should curtail prolonged outdoor exertion. Healthy adults should reduce heavy outdoor endurance activities during peak morning smog.',
  hourly: {
    time: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
    pm2_5: [142, 155, 168, 185, 192, 175, 160, 145, 125, 110, 95, 88, 82, 85, 94, 108, 128, 149, 165, 178, 182, 170, 158, 148],
    pm10: [230, 245, 260, 290, 310, 280, 255, 230, 200, 180, 155, 140, 135, 142, 158, 185, 215, 240, 265, 285, 290, 270, 250, 240],
    us_aqi: [196, 205, 218, 235, 242, 225, 210, 197, 187, 179, 171, 168, 164, 166, 171, 178, 188, 199, 215, 228, 232, 220, 208, 200],
    temperature_2m: [18, 17, 17, 16, 16, 17, 18, 21, 24, 26, 28, 29, 30, 30, 29, 28, 26, 24, 22, 21, 20, 19, 19, 18],
    relative_humidity_2m: [72, 75, 78, 80, 82, 80, 75, 65, 55, 48, 42, 38, 36, 38, 42, 48, 55, 62, 68, 70, 72, 74, 73, 72],
    wind_speed_10m: [4.2, 3.8, 3.5, 3.2, 3.0, 3.4, 4.1, 5.5, 7.2, 8.5, 9.8, 10.2, 10.5, 9.8, 8.9, 7.5, 6.2, 5.0, 4.4, 4.0, 3.8, 3.6, 3.8, 4.0]
  }
};

export const SAMPLE_RECOMMENDATIONS: DailyRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Switch Morning Jog to Indoor Yoga or Light Aerobics',
    category: 'OUTDOOR_ACTIVITY',
    time: 'MORNING',
    action: 'Postpone intense outdoor jogging until mid-afternoon or replace with a 25-minute indoor stretching or mat routine.',
    reason: 'Morning temperature inversions trap high concentrations of PM2.5 (175+ µg/m³) near ground level between 6:00 AM and 8:30 AM.',
    benefit: 'Averaging 70% lower particle inhalation compared to vigorous outdoor breathing during peak morning smog.',
    cost: 'FREE',
    effort: 'LOW',
    impact: {
      type: 'EXPOSURE_REDUCTION',
      value: null,
      unit: null,
      explanation: 'Qualitative reduction; heavy aerobic breathing outdoors multiplies lung particulate deposition by 3-5x.'
    },
    isDataInformed: true,
    completed: false
  },
  {
    id: 'rec-2',
    title: 'Keep Street-Facing Windows Latched During Rush Hour',
    category: 'VENTILATION',
    time: 'MORNING',
    action: 'Keep exterior balcony and street-facing windows closed until 11:30 AM. Ventilate only during warmer midday hours if wind picks up.',
    reason: 'Early morning vehicular emissions combined with stagnant winter air create high roadside NO2 and fine particle infiltration.',
    benefit: 'Prevents heavy pulse of outdoor traffic soot from entering bedrooms and living spaces.',
    cost: 'FREE',
    effort: 'LOW',
    impact: {
      type: 'INDOOR_HYGIENE',
      value: null,
      unit: null,
      explanation: 'Reduces indoor particulate spikes by keeping building envelope closed during high-traffic hours.'
    },
    isDataInformed: true,
    completed: false
  },
  {
    id: 'rec-3',
    title: 'Choose Metro or Covered Transit Over Open Auto-Rickshaw',
    category: 'COMMUTE',
    time: 'MIDDAY',
    action: 'If commuting across arterial roads today, opt for the metro or closed bus/carpool rather than open two-wheelers or open three-wheelers.',
    reason: 'Arterial corridors experience localized PM2.5 and black carbon levels 2-3x higher than ambient monitors show.',
    benefit: 'Substantially reduces direct inhalation of diesel exhaust and resuspended road dust.',
    cost: 'LOW',
    effort: 'LOW',
    impact: {
      type: 'EXPOSURE_REDUCTION',
      value: null,
      unit: null,
      explanation: 'Enclosed transit cabins with filtered air provide significant barrier against on-road exhaust plumes.'
    },
    isDataInformed: true,
    completed: false
  },
  {
    id: 'rec-4',
    title: 'Run Kitchen Exhaust Fan on High While Cooking',
    category: 'COOKING_CLEANING',
    time: 'MIDDAY',
    action: 'Turn on the range hood or window exhaust fan 1 minute before cooking and keep running for 5 minutes after finishing.',
    reason: 'Sautéing, frying spices (tadka), and gas combustion generate microscopic ultrafine particles that can linger for hours in closed rooms.',
    benefit: 'Directly expels combustion byproducts and cooking aerosols outdoors before they migrate to bedrooms.',
    cost: 'FREE',
    effort: 'LOW',
    impact: {
      type: 'INDOOR_HYGIENE',
      value: null,
      unit: null,
      explanation: 'Immediate localized extraction prevents indoor PM2.5 from exceeding outdoor levels.'
    },
    isDataInformed: false,
    completed: false
  },
  {
    id: 'rec-5',
    title: 'Short 3:30 PM Outdoor Play Window for Children',
    category: 'OUTDOOR_ACTIVITY',
    time: 'EVENING',
    action: 'If children need playtime outdoors, schedule it between 2:30 PM and 4:30 PM today when solar warming and wind disperse surface particulates.',
    reason: 'Forecast indicates PM2.5 drops to its diurnal minimum (approx 82-95 µg/m³) during mid-afternoon before rising rapidly after sunset.',
    benefit: 'Safest available daytime window for moderate outdoor movement before evening cooling traps pollutants again.',
    cost: 'FREE',
    effort: 'MEDIUM',
    impact: {
      type: 'EXPOSURE_REDUCTION',
      value: null,
      unit: null,
      explanation: 'Takes advantage of natural diurnal boundary layer expansion for lower exposure.'
    },
    isDataInformed: true,
    completed: false
  },
  {
    id: 'rec-6',
    title: 'Damp Mopping Rather Than Dry Sweeping',
    category: 'COOKING_CLEANING',
    time: 'EVENING',
    action: 'Clean floors with a damp microfiber mop or wet cloth. Avoid stiff brooms or dry dusting that resuspends settled dust into breathing zones.',
    reason: 'Dry brooms throw coarse settled PM10 and allergens back into the air where family members inhale them for the next 2-3 hours.',
    benefit: 'Binds settled particulates to water, physically removing them from indoor surfaces.',
    cost: 'FREE',
    effort: 'LOW',
    impact: {
      type: 'INDOOR_HYGIENE',
      value: null,
      unit: null,
      explanation: 'Prevents aerosolization of settled dust particles and allergen reservoirs.'
    },
    isDataInformed: false,
    completed: false
  },
  {
    id: 'rec-7',
    title: 'Create a Clean Bedroom Sanctuary for Sleeping',
    category: 'INDOOR_AIR',
    time: 'NIGHT',
    action: 'Close bedroom windows at dusk, damp wipe nightstands, and if using an air cleaner or fan, run it on low continuous setting away from drafts.',
    reason: 'We spend 7-9 hours sleeping in one room. Overnight winter smog levels peak between 11 PM and 5 AM due to low nocturnal boundary layers.',
    benefit: 'Provides the respiratory system a 8-hour recovery window with minimal particulate burden.',
    cost: 'FREE',
    effort: 'LOW',
    impact: {
      type: 'EXPOSURE_REDUCTION',
      value: null,
      unit: null,
      explanation: 'Protects vulnerable respiratory pathways during restorative sleep phase.'
    },
    isDataInformed: true,
    completed: false
  }
];

export const INDOOR_LAB_CHECKLIST = [
  {
    id: 'in-1',
    category: 'Ventilation',
    title: 'Check outdoor AQI before cracking windows',
    desc: 'Ventilate only during low-traffic afternoon hours (1:00 PM – 4:00 PM) when thermal mixing is greatest.',
    budget: 'Free',
    costTier: 'free'
  },
  {
    id: 'in-2',
    category: 'Cooking',
    title: 'Use continuous exhaust during tadka/frying',
    desc: 'Keep kitchen door closed from main living area while cooking spices to prevent aerosol dispersion.',
    budget: 'Free',
    costTier: 'free'
  },
  {
    id: 'in-3',
    category: 'Cleaning',
    title: 'Wet dusting surfaces weekly',
    desc: 'Use a damp microfiber cloth instead of feather dusters to capture particles instead of aerosolizing them.',
    budget: 'Under ₹200',
    costTier: 'under_500'
  },
  {
    id: 'in-4',
    category: 'Filtration',
    title: 'DIY Box Fan with MERV-13 filter',
    desc: 'An affordable homemade air cleaner: tape a standard 20x20 MERV-13 furnace filter to the back of a box fan.',
    budget: '₹800 - ₹1,500',
    costTier: '500_2000'
  },
  {
    id: 'in-5',
    category: 'Filtration',
    title: 'True HEPA room air purifier',
    desc: 'Look for H13 True HEPA certification with activated carbon for VOCs. Check CADR rating matches room size.',
    budget: '₹4,500+',
    costTier: 'above_2000'
  },
  {
    id: 'in-6',
    category: 'Bedroom',
    title: 'Door draft blocker on exterior gaps',
    desc: 'Place a rolled towel or silicone draft stopper under entry doors to block polluted corridor air currents.',
    budget: 'Free / ₹150',
    costTier: 'free'
  }
];

export const COMMUNITY_CHALLENGES = [
  {
    id: 'comm-1',
    title: 'Zero-Idling School & Market Zone',
    description: 'Switch off vehicle engines while waiting at school pickup points and traffic signals over 20 seconds.',
    participants: 1240,
    impactType: 'Localized emission drop',
    category: 'Transit'
  },
  {
    id: 'comm-2',
    title: 'Community Wet Mopping Drive',
    description: 'Commit to wet mopping apartment corridors and common stairs instead of dry sweeping this week.',
    participants: 856,
    impactType: 'Dust suppression',
    category: 'Indoor'
  },
  {
    id: 'comm-3',
    title: 'Shift 2 Trips to Metro or Carpool',
    description: 'Replace two solo car or bike commute journeys this week with the metro or shared electric transit.',
    participants: 1980,
    impactType: 'Congestion & tailpipe reduction',
    category: 'Transit'
  },
  {
    id: 'comm-4',
    title: 'Balcony Green Barrier Care',
    description: 'Rinse dust off balcony plant foliage with water spray to keep leaves transpiring and catching coarse dust.',
    participants: 630,
    impactType: 'Micro-climate cooling',
    category: 'Neighborhood'
  }
];

export const QUICK_PROMPT_CHIPS = [
  "Can my child play outside this evening?",
  "Should I open the windows right now?",
  "How can I improve indoor air with zero budget?",
  "I have to commute to work today. What is the safest transit?",
  "What can I do before going to sleep tonight?",
  "Is cooking with an exhaust fan genuinely helpful?",
  "What mask should my elderly parents wear in this smog?"
];
