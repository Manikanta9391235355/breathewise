export type AqiStatus = 'LIVE DATA' | 'FORECAST' | 'DEMO DATA' | 'DATA UNAVAILABLE';

export type AqiCategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export interface AirQualityData {
  aqi: number; // US AQI standard (0-500 scale, scientifically calibrated)
  aqiCategory: AqiCategory;
  europeanAqi?: number;
  pm2_5: number; // µg/m³
  pm10: number; // µg/m³
  no2?: number; // µg/m³
  o3?: number; // µg/m³
  so2?: number; // µg/m³
  co?: number; // µg/m³
  source: string;
  lastUpdated: string;
  status: AqiStatus;
  locationName: string;
  latitude: number;
  longitude: number;
  interpretation: string;
  hourly: {
    time: string[];
    pm2_5: number[];
    pm10: number[];
    us_aqi: number[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    wind_speed_10m?: number[];
  };
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  precipitationProbability?: number;
}

export type BudgetTier = 'free' | 'under_500' | '500_2000' | 'above_2000';
export type WorkStyle = 'office' | 'remote' | 'hybrid';
export type CommuteMethod = 'public_transit' | 'metro' | 'walking_cycling' | 'private_vehicle' | 'carpooling' | 'remote';
export type OutdoorFrequency = 'rarely' | 'moderate' | 'frequent' | 'daily_athlete';
export type PrimaryConcern = 'children' | 'commute' | 'exercise' | 'indoor_air' | 'overall_health';
export type HousingType = 'apartment' | 'independent_house' | 'shared_accommodation';

export interface UserProfile {
  city: string;
  latitude: number;
  longitude: number;
  isLiveLocation: boolean;
  householdMembers: number;
  hasChildren: boolean;
  hasElderly: boolean;
  hasRespiratorySensitivities: boolean;
  housingType: HousingType;
  commuteMethod: CommuteMethod;
  outdoorFrequency: OutdoorFrequency;
  workStyle: WorkStyle;
  primaryConcern: PrimaryConcern;
  budgetTier: BudgetTier;
  onboardingCompleted: boolean;
}

export interface DailyRecommendation {
  id: string;
  title: string;
  category: 'OUTDOOR_ACTIVITY' | 'VENTILATION' | 'COMMUTE' | 'INDOOR_AIR' | 'COOKING_CLEANING' | 'PROTECTION';
  time: 'MORNING' | 'MIDDAY' | 'EVENING' | 'NIGHT';
  action: string;
  reason: string;
  benefit: string;
  cost: 'FREE' | 'LOW' | 'MEDIUM';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: {
    type: 'EXPOSURE_REDUCTION' | 'EMISSION_REDUCTION' | 'INDOOR_HYGIENE';
    value: number | null;
    unit: string | null;
    explanation: string;
  };
  isDataInformed: boolean;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  isFallback?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'routine';
  time: string;
  read: boolean;
}

export interface CityPreset {
  name: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  typicalWinterAqi: number;
  tier: string;
}

export interface ImpactMetrics {
  actionsCompletedToday: number;
  actionsCompletedThisWeek: number;
  sustainableTravelChoices: number;
  indoorImprovements: number;
  streakDays: number;
  qualitativeAchievements: string[];
}
