import { AirQualityData, AqiCategory, UserProfile, WeatherData } from './types';
import { DEMO_AIR_QUALITY } from './constants';

// Calibrated EPA Breakpoint formula for PM2.5 to US AQI
export function calculateUsAqiFromPm25(pm25: number): number {
  if (pm25 <= 0) return 0;
  if (pm25 <= 12.0) {
    return Math.round(((50 - 0) / (12.0 - 0)) * (pm25 - 0) + 0);
  } else if (pm25 <= 35.4) {
    return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
  } else if (pm25 <= 55.4) {
    return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
  } else if (pm25 <= 150.4) {
    return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
  } else if (pm25 <= 250.4) {
    return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
  } else if (pm25 <= 350.4) {
    return Math.round(((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301);
  } else {
    return Math.min(500, Math.round(((500 - 401) / (500.4 - 350.5)) * (Math.min(500, pm25) - 350.5) + 401));
  }
}

export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getAqiTheme(aqi: number): {
  color: string;
  bgLight: string;
  border: string;
  label: string;
  statusText: string;
} {
  if (aqi <= 50) {
    return {
      color: '#2d6a4f',
      bgLight: '#eef8f2',
      border: '#a3b18a',
      label: 'Good Air',
      statusText: 'Air quality is satisfactory and poses little or no risk.'
    };
  }
  if (aqi <= 100) {
    return {
      color: '#c8963e',
      bgLight: '#fdf9ee',
      border: '#e9edc9',
      label: 'Moderate',
      statusText: 'Acceptable quality; sensitive individuals may experience slight respiratory irritation.'
    };
  }
  if (aqi <= 150) {
    return {
      color: '#d97706',
      bgLight: '#fff7ed',
      border: '#fed7aa',
      label: 'Unhealthy for Sensitive',
      statusText: 'Children, older adults, and individuals with asthma should curtail prolonged outdoor exertion.'
    };
  }
  if (aqi <= 200) {
    return {
      color: '#b91c1c',
      bgLight: '#fef2f2',
      border: '#fecaca',
      label: 'Unhealthy',
      statusText: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.'
    };
  }
  if (aqi <= 300) {
    return {
      color: '#9b2226',
      bgLight: '#fdf2f2',
      border: '#f87171',
      label: 'Very Unhealthy',
      statusText: 'Health alert: The risk of health effects is increased for everyone. Move activities indoors.'
    };
  }
  return {
    color: '#6a040f',
    bgLight: '#fef2f2',
    border: '#dc2626',
    label: 'Hazardous / Severe',
    statusText: 'Health warning of emergency conditions. The entire population is more likely to be affected. Keep indoor air sealed and filtered.'
  };
}

export function generateInterpretation(data: {
  aqi: number;
  pm25: number;
  locationName: string;
  profile?: UserProfile | null;
}): string {
  const { aqi, pm25, locationName, profile } = data;
  const hasChildren = profile?.hasChildren ?? true;
  const hasElderly = profile?.hasElderly ?? true;
  const hasSensitivity = profile?.hasRespiratorySensitivities ?? false;

  let vulnerabilityMention = '';
  if (hasChildren && hasElderly) {
    vulnerabilityMention = 'For your household with young children and seniors, ';
  } else if (hasChildren) {
    vulnerabilityMention = 'For children in your family whose lungs are still developing, ';
  } else if (hasElderly) {
    vulnerabilityMention = 'For older family members, ';
  } else if (hasSensitivity) {
    vulnerabilityMention = 'Given respiratory sensitivities in your home, ';
  } else {
    vulnerabilityMention = 'For your household, ';
  }

  if (aqi <= 50) {
    return `${vulnerabilityMention}today is an ideal day for outdoor walks, exercise, and refreshing indoor air by opening windows. PM2.5 levels in ${locationName} are minimal (${pm25.toFixed(1)} µg/m³).`;
  }
  if (aqi <= 100) {
    return `${vulnerabilityMention}air quality in ${locationName} is moderate. Outdoor recreation is generally fine for most people, but sensitive individuals should watch for throat tickles or coughing if exercising outdoors near busy arterial roads.`;
  }
  if (aqi <= 150) {
    return `${vulnerabilityMention}${locationName}'s PM2.5 concentration of ${pm25.toFixed(1)} µg/m³ means caution is advised. Postpone vigorous outdoor cardio to the early afternoon when sunlight helps disperse ground particulates, and keep street-facing windows latched during morning peak traffic.`;
  }
  if (aqi <= 200) {
    return `${vulnerabilityMention}current air in ${locationName} is in the Unhealthy band. Fine soot particles are concentrated enough to cause irritation. Move aerobic exercise indoors, ensure kitchen exhaust is running during cooking, and have vulnerable family members wear an appropriately fitted particulate mask (such as an N95/FFP2) if traversing busy transit corridors.`;
  }
  if (aqi <= 300) {
    return `${vulnerabilityMention}severe winter smog has elevated PM2.5 to ${pm25.toFixed(1)} µg/m³ in ${locationName}. Outdoor physical activity should be avoided. Seal street-facing window cracks, run air filtration or fan filtration where available, and opt for closed transit rather than open two-wheelers.`;
  }
  return `Emergency pollution conditions in ${locationName} (PM2.5: ${pm25.toFixed(1)} µg/m³). Outdoor exposure should be strictly curtailed. Keep family members indoors in a dedicated clean-air room with sealed gaps, avoid any indoor combustion (incense, frying without exhaust), and follow local public health directives.`;
}

// Fetch live Air Quality & Weather from Open-Meteo
export async function fetchLiveAirQuality(
  latitude: number,
  longitude: number,
  locationName: string,
  profile?: UserProfile | null
): Promise<AirQualityData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&timezone=auto&forecast_days=2`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&timezone=auto&forecast_days=2`;

    const [aqiRes, weatherRes] = await Promise.all([
      fetch(aqiUrl, { signal: controller.signal, next: { revalidate: 300 } }).catch(() => null),
      fetch(weatherUrl, { signal: controller.signal, next: { revalidate: 300 } }).catch(() => null)
    ]);

    clearTimeout(timeoutId);

    if (!aqiRes || !aqiRes.ok) {
      console.warn('Open-Meteo Air Quality API request failed or timed out. Falling back to calibrated demo data.');
      return {
        ...DEMO_AIR_QUALITY,
        locationName,
        latitude,
        longitude,
        status: 'DEMO DATA',
        interpretation: generateInterpretation({ aqi: DEMO_AIR_QUALITY.aqi, pm25: DEMO_AIR_QUALITY.pm2_5, locationName, profile })
      };
    }

    const aqiJson = await aqiRes.json();
    const weatherJson = weatherRes && weatherRes.ok ? await weatherRes.json() : null;

    const current = aqiJson.current || {};
    const hourly = aqiJson.hourly || {};
    const weatherHourly = weatherJson?.hourly || {};

    const pm25 = current.pm2_5 ?? 45;
    const pm10 = current.pm10 ?? 85;
    const computedAqi = current.us_aqi ?? calculateUsAqiFromPm25(pm25);
    const category = getAqiCategory(computedAqi);

    // Extract next 24 hours of data
    const times: string[] = [];
    const hourlyPm25: number[] = [];
    const hourlyPm10: number[] = [];
    const hourlyAqi: number[] = [];
    const hourlyTemp: number[] = [];
    const hourlyHumidity: number[] = [];
    const hourlyWind: number[] = [];

    const rawTimes: string[] = hourly.time || [];
    const rawPm25: number[] = hourly.pm2_5 || [];
    const rawPm10: number[] = hourly.pm10 || [];
    const rawUsAqi: number[] = hourly.us_aqi || [];
    const rawTemp: number[] = weatherHourly.temperature_2m || [];
    const rawHumidity: number[] = weatherHourly.relative_humidity_2m || [];
    const rawWind: number[] = weatherHourly.wind_speed_10m || [];

    const currentHourIndex = Math.max(0, rawTimes.findIndex(t => {
      const date = new Date(t);
      return date.getTime() >= Date.now() - 3600000;
    }));

    const startIndex = currentHourIndex >= 0 ? currentHourIndex : 0;
    for (let i = startIndex; i < Math.min(startIndex + 24, rawTimes.length); i++) {
      const timeStr = rawTimes[i] ? new Date(rawTimes[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${i % 24}:00`;
      times.push(timeStr);
      const valPm25 = rawPm25[i] ?? pm25;
      hourlyPm25.push(Math.round(valPm25 * 10) / 10);
      hourlyPm10.push(Math.round((rawPm10[i] ?? pm10) * 10) / 10);
      hourlyAqi.push(rawUsAqi[i] ?? calculateUsAqiFromPm25(valPm25));
      hourlyTemp.push(Math.round(rawTemp[i] ?? 24));
      hourlyHumidity.push(Math.round(rawHumidity[i] ?? 50));
      hourlyWind.push(Math.round((rawWind[i] ?? 5) * 10) / 10);
    }

    const interpretation = generateInterpretation({
      aqi: computedAqi,
      pm25,
      locationName,
      profile
    });

    const now = new Date();
    const lastUpdated = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (UTC${now.getTimezoneOffset() <= 0 ? '+' : ''}${-now.getTimezoneOffset() / 60})`;

    return {
      aqi: Math.round(computedAqi),
      aqiCategory: category,
      europeanAqi: current.european_aqi ?? undefined,
      pm2_5: Math.round(pm25 * 10) / 10,
      pm10: Math.round(pm10 * 10) / 10,
      no2: current.nitrogen_dioxide ? Math.round(current.nitrogen_dioxide * 10) / 10 : undefined,
      o3: current.ozone ? Math.round(current.ozone * 10) / 10 : undefined,
      so2: current.sulphur_dioxide ? Math.round(current.sulphur_dioxide * 10) / 10 : undefined,
      co: current.carbon_monoxide ? Math.round(current.carbon_monoxide) : undefined,
      source: 'Open-Meteo Air Quality (Copernicus / CAMS Ensemble)',
      lastUpdated,
      status: 'LIVE DATA',
      locationName,
      latitude,
      longitude,
      interpretation,
      hourly: {
        time: times.length > 0 ? times : DEMO_AIR_QUALITY.hourly.time,
        pm2_5: hourlyPm25.length > 0 ? hourlyPm25 : DEMO_AIR_QUALITY.hourly.pm2_5,
        pm10: hourlyPm10.length > 0 ? hourlyPm10 : DEMO_AIR_QUALITY.hourly.pm10,
        us_aqi: hourlyAqi.length > 0 ? hourlyAqi : DEMO_AIR_QUALITY.hourly.us_aqi,
        temperature_2m: hourlyTemp.length > 0 ? hourlyTemp : DEMO_AIR_QUALITY.hourly.temperature_2m,
        relative_humidity_2m: hourlyHumidity.length > 0 ? hourlyHumidity : DEMO_AIR_QUALITY.hourly.relative_humidity_2m,
        wind_speed_10m: hourlyWind.length > 0 ? hourlyWind : DEMO_AIR_QUALITY.hourly.wind_speed_10m
      }
    };
  } catch (err) {
    console.error('Error fetching live air quality data:', err);
    return {
      ...DEMO_AIR_QUALITY,
      locationName,
      latitude,
      longitude,
      status: 'DEMO DATA',
      interpretation: generateInterpretation({ aqi: DEMO_AIR_QUALITY.aqi, pm25: DEMO_AIR_QUALITY.pm2_5, locationName, profile })
    };
  }
}

// Fetch current Weather
export async function fetchLiveWeather(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error('Weather fetch failed');
    const data = await res.json();
    const curr = data.current || {};

    const code = curr.weather_code ?? 0;
    const desc = getWeatherDescription(code);

    return {
      temperature: Math.round(curr.temperature_2m ?? 24),
      humidity: Math.round(curr.relative_humidity_2m ?? 50),
      windSpeed: Math.round((curr.wind_speed_10m ?? 6) * 10) / 10,
      weatherCode: code,
      weatherDescription: desc,
      precipitationProbability: 0
    };
  } catch (e) {
    return {
      temperature: 24,
      humidity: 55,
      windSpeed: 6.2,
      weatherCode: 1,
      weatherDescription: 'Mainly Clear'
    };
  }
}

export function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast / Smoggy';
  if (code >= 45 && code <= 48) return 'Fog & Haze';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear to Hazy';
}
