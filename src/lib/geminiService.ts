import { AirQualityData, DailyRecommendation, UserProfile } from './types';
import { SAMPLE_RECOMMENDATIONS } from './constants';

interface GeminiGenerateOptions {
  airQuality: AirQualityData;
  profile: UserProfile;
}

export async function generateDailyRecommendationsWithGemini(
  options: GeminiGenerateOptions
): Promise<DailyRecommendation[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_')) {
    console.warn('GEMINI_API_KEY not configured or placeholder detected. Returning calibrated fallback recommendations.');
    return getContextualFallbackRecommendations(options);
  }

  const { airQuality, profile } = options;

  const systemInstruction = `You are BreatheWise, an elite environmental health & urban air quality AI assistant for families in India and urban centers.
Your task is to generate a personalized, actionable, structured daily clean-air action plan divided into MORNING, MIDDAY, EVENING, and NIGHT.

CRITICAL SCIENTIFIC SAFETY RULES:
1. NEVER fabricate numerical health benefits or percentage exposure reductions (e.g., do NOT say "cuts exposure by 43.5%" or "improves lung capacity by 12%"). Set impact.value to null, impact.unit to null, and write a scientifically grounded qualitative explanation.
2. If outdoor AQI is Unhealthy or Severe (PM2.5 > 55 µg/m³ or AQI > 150), DO NOT recommend opening windows during morning or evening peak rush hours.
3. Prioritize no-cost and low-cost interventions tailored to the user's budget tier (${profile.budgetTier}).
4. Never suggest walking or cycling along heavily polluted arterial traffic roads just because it is green. Safety and exposure avoidance always take priority.
5. If children (${profile.hasChildren ? 'present' : 'none'}) or elderly family members (${profile.hasElderly ? 'present' : 'none'}) or respiratory sensitivities (${profile.hasRespiratorySensitivities ? 'yes' : 'no'}) are present, highlight tailored protective precautions for them.
6. Return ONLY a valid JSON array of recommendation objects without any introductory or conversational markdown outside the JSON block.

JSON Schema for each object:
{
  "id": "rec-1",
  "title": "Short punchy action title",
  "category": "OUTDOOR_ACTIVITY" | "VENTILATION" | "COMMUTE" | "INDOOR_AIR" | "COOKING_CLEANING" | "PROTECTION",
  "time": "MORNING" | "MIDDAY" | "EVENING" | "NIGHT",
  "action": "Specific concrete instructions for the user today",
  "reason": "Why it matters based on today's environmental data and atmospheric behavior",
  "benefit": "Practical outcome for family wellness",
  "cost": "FREE" | "LOW" | "MEDIUM",
  "effort": "LOW" | "MEDIUM" | "HIGH",
  "impact": {
    "type": "EXPOSURE_REDUCTION" | "EMISSION_REDUCTION" | "INDOOR_HYGIENE",
    "value": null,
    "unit": null,
    "explanation": "Qualitative explanation grounded in environmental physics and exposure reduction."
  },
  "isDataInformed": true,
  "completed": false
}
Provide exactly 6-8 distinct recommendations spanning MORNING (2), MIDDAY (2), EVENING (2), and NIGHT (1-2).`;

  const userPrompt = `Generate today's personalized daily clean-air plan for:
Location: ${airQuality.locationName}
Current US AQI: ${airQuality.aqi} (${airQuality.aqiCategory})
PM2.5: ${airQuality.pm2_5} µg/m³
PM10: ${airQuality.pm10} µg/m³
NO2: ${airQuality.no2 ?? 'N/A'} µg/m³
Forecast diurnal trend: Morning PM2.5 around ${airQuality.hourly.pm2_5[7] || airQuality.pm2_5} µg/m³, Midday around ${airQuality.hourly.pm2_5[13] || airQuality.pm2_5} µg/m³, Night around ${airQuality.hourly.pm2_5[21] || airQuality.pm2_5} µg/m³.

Household Profile:
- Members: ${profile.householdMembers}
- Children: ${profile.hasChildren ? 'Yes' : 'No'}
- Elderly: ${profile.hasElderly ? 'Yes' : 'No'}
- Respiratory Sensitivities (Asthma/Allergies): ${profile.hasRespiratorySensitivities ? 'Yes' : 'No'}
- Housing: ${profile.housingType}
- Commute Method: ${profile.commuteMethod}
- Outdoor Activity Frequency: ${profile.outdoorFrequency}
- Primary Concern: ${profile.primaryConcern}
- Budget Tier: ${profile.budgetTier}

Respond with only the JSON array.`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2500,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!res.ok) {
      console.warn(`Gemini API returned status ${res.status}: ${await res.text()}`);
      return getContextualFallbackRecommendations(options);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return getContextualFallbackRecommendations(options);
    }

    const cleanedJson = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, idx) => ({
        id: item.id || `gemini-rec-${idx + 1}`,
        title: item.title || 'Clean Air Routine',
        category: item.category || 'INDOOR_AIR',
        time: item.time || 'MORNING',
        action: item.action || '',
        reason: item.reason || '',
        benefit: item.benefit || '',
        cost: item.cost || 'FREE',
        effort: item.effort || 'LOW',
        impact: {
          type: item.impact?.type || 'EXPOSURE_REDUCTION',
          value: null,
          unit: null,
          explanation: item.impact?.explanation || 'Qualitative exposure reduction.'
        },
        isDataInformed: true,
        completed: false
      }));
    }

    return getContextualFallbackRecommendations(options);
  } catch (error) {
    console.error('Error invoking Gemini for recommendations:', error);
    return getContextualFallbackRecommendations(options);
  }
}

export async function askBreatheWiseChat(params: {
  message: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
  airQuality: AirQualityData;
  profile: UserProfile;
}): Promise<{ reply: string; suggestedActions?: string[]; isFallback?: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_')) {
    return generateFallbackChatResponse(params.message, params.airQuality, params.profile);
  }

  const { message, conversationHistory, airQuality, profile } = params;

  const systemInstruction = `You are BreatheWise, an empathetic, scientifically grounded urban air quality and family health assistant.
You guide families navigating seasonal smog, urban PM2.5 pollution, and clean indoor living.

CURRENT USER CONTEXT:
- City: ${airQuality.locationName}
- Current US AQI: ${airQuality.aqi} (${airQuality.aqiCategory})
- PM2.5: ${airQuality.pm2_5} µg/m³ | PM10: ${airQuality.pm10} µg/m³ | Status: ${airQuality.status}
- Household: ${profile.householdMembers} people. Has children: ${profile.hasChildren ? 'Yes' : 'No'}, Has elderly: ${profile.hasElderly ? 'Yes' : 'No'}, Respiratory sensitivities: ${profile.hasRespiratorySensitivities ? 'Yes' : 'No'}.
- Housing: ${profile.housingType}, Commute: ${profile.commuteMethod}, Budget: ${profile.budgetTier}.

IMPORTANT GUIDELINES:
1. Provide actionable, concise, friendly guidance in 2 to 4 short paragraphs.
2. NEVER diagnose medical conditions or recommend prescription drugs. Always include a brief disclaimer if health symptoms or medical queries arise.
3. NEVER make up false numerical promises (e.g., "this reduces risk by 80%"). State qualitative, scientifically defensible advice.
4. If asked about opening windows: check current AQI. If AQI > 150, advise keeping windows closed during morning/evening rush hours, and ventilating briefly only in early afternoon if needed.
5. If asked about low/zero budget: highlight damp mopping, continuous kitchen exhaust, door draft blocks, and avoiding indoor incense or mosquito coils.
6. Conclude with 2-3 short suggested next actions.`;

  try {
    const formattedHistory = conversationHistory.slice(-6).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: formattedHistory,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000
        }
      })
    });

    if (!res.ok) {
      console.warn(`Gemini chat endpoint failed with status ${res.status}. Falling back to rule-based responder.`);
      return generateFallbackChatResponse(message, airQuality, profile);
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return generateFallbackChatResponse(message, airQuality, profile);
    }

    return {
      reply,
      isFallback: false
    };
  } catch (error) {
    console.error('Error invoking Gemini for chat:', error);
    return generateFallbackChatResponse(message, airQuality, profile);
  }
}

function getContextualFallbackRecommendations(options: GeminiGenerateOptions): DailyRecommendation[] {
  const { airQuality, profile } = options;
  const isHighAqi = airQuality.aqi > 150;

  return SAMPLE_RECOMMENDATIONS.map(rec => {
    let customizedAction = rec.action;
    let customizedReason = rec.reason;

    if (rec.id === 'rec-1' && profile.hasChildren) {
      customizedAction = `Replace morning outdoor jogging or children's outdoor play with an indoor stretching or obstacle game.`;
      customizedReason = `Morning PM2.5 in ${airQuality.locationName} is high (${airQuality.pm2_5} µg/m³). Young lungs breathe faster and absorb higher particle loads per kg of body weight.`;
    }

    if (rec.id === 'rec-2' && isHighAqi) {
      customizedAction = `Keep all balcony and street-facing windows firmly sealed throughout morning traffic hours until 12:00 PM.`;
      customizedReason = `Outdoor PM2.5 is currently ${airQuality.pm2_5} µg/m³. Opening windows now would flood indoor living spaces with fine soot.`;
    }

    return {
      ...rec,
      action: customizedAction,
      reason: customizedReason,
      isDataInformed: true
    };
  });
}

function generateFallbackChatResponse(
  query: string,
  airQuality: AirQualityData,
  profile: UserProfile
): { reply: string; suggestedActions?: string[]; isFallback: boolean } {
  const q = query.toLowerCase();
  const aqi = airQuality.aqi;
  const city = airQuality.locationName;
  const pm25 = airQuality.pm2_5;

  let reply = '';
  let suggestedActions: string[] = [];

  if (q.includes('window') || q.includes('ventilat')) {
    if (aqi > 150) {
      reply = `Right now in **${city}**, outdoor PM2.5 is high at **${pm25} µg/m³** (AQI: ${aqi}). \n\n**We recommend keeping your windows closed right now.** Opening them during high pollution allows fine soot particles to infiltrate bedrooms and living spaces. If indoor air feels stuffy, wait until between 1:00 PM and 3:30 PM when thermal mixing typically dilutes ground-level pollution, and crack windows only briefly on the sheltered (non-street) side of the home.`;
    } else {
      reply = `In **${city}**, current air quality is **${airQuality.aqiCategory}** (AQI: ${aqi}). It is generally safe to ventilate your home now. Opening windows on opposite sides of your living space creates a cross-breeze that flushes out indoor CO2 and cooking moisture.`;
    }
    suggestedActions = ['Check afternoon activity window', 'Learn kitchen exhaust practices', 'View damp mopping tips'];
  } else if (q.includes('child') || q.includes('play') || q.includes('outside') || q.includes('outdoor')) {
    if (aqi > 150) {
      reply = `Because children breathe up to 50% more air per pound of body weight than adults, intense outdoor cardio or sports are **not advisable** during this pollution episode in **${city}** (AQI: ${aqi}). \n\nIf they need to move and expend energy, consider indoor games, dance, or indoor physical activities. If outdoor play is unavoidable, check the Smart Outdoor Activity Window and limit it to short, low-exertion sessions during early afternoon when ground pollutants disperse slightly.`;
    } else {
      reply = `Outdoor conditions in **${city}** (AQI: ${aqi}) are within acceptable limits for children today. Normal playground activity is fine, though monitoring sensitive children with asthma during heavy exertion remains a good practice.`;
    }
    suggestedActions = ['Check best activity hours', 'See indoor activity checklist'];
  } else if (q.includes('zero budget') || q.includes('no money') || q.includes('budget') || q.includes('purifier')) {
    reply = `You don't need expensive equipment to substantially improve indoor air quality. Here are top zero-cost actions:\n\n1. **Damp Mopping:** Never dry sweep with a stiff broom—it kicks settled dust into the breathing zone. Use a wet mop or damp cloth.\n2. **Kitchen Exhaust Timing:** Run the exhaust fan or kitchen chimney while cooking and for 5 minutes after. Cooking spices and oils release ultrafine particles.\n3. **Seal Door Corridors:** Place a rolled towel or cloth under outer doors to block soot from stairwells.\n4. **Eliminate Indoor Smoke:** Avoid burning incense sticks (agarbatti), mosquito coils, or candles in unventilated rooms.`;
    suggestedActions = ['Explore Clean Air Home Lab', 'View low-emission travel routine'];
  } else if (q.includes('mask') || q.includes('respirator') || q.includes('protect')) {
    reply = `For airborne PM2.5 particles, standard surgical or cloth masks provide minimal seal and poor filtration. \n\n**Best protection:** An appropriately fitted **N95, FFP2, or KN95 particulate respirator** that forms a tight seal around the nose and chin without gaps. For children and seniors, make sure the mask size is tailored to prevent side leakage.`;
    suggestedActions = ['View commuter precautions', 'Review bedroom sanctuary checklist'];
  } else {
    reply = `Based on current readings in **${city}** (AQI: ${aqi}, PM2.5: ${pm25} µg/m³), the general strategy for your household is exposure reduction.\n\n- Limit prolonged outdoor aerobic exercise during morning smog.\n- Keep street-facing windows latched during heavy traffic hours.\n- Maintain clean indoor air using wet dusting and kitchen exhaust.\n\n*Medical Disclaimer: BreatheWise provides environmental health risk awareness and preventive routines, not clinical medical advice. Please consult your physician for specific health symptoms.*`;
    suggestedActions = ['Generate daily routine', 'Check outdoor activity window', 'Explore Clean Air Home Lab'];
  }

  return {
    reply,
    suggestedActions,
    isFallback: true
  };
}
