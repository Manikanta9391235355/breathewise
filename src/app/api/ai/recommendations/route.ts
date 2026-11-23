import { NextRequest, NextResponse } from 'next/server';
import { generateDailyRecommendationsWithGemini } from '@/lib/geminiService';
import { DEMO_AIR_QUALITY, DEFAULT_USER_PROFILE } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const airQuality = body.airQuality || DEMO_AIR_QUALITY;
    const profile = body.profile || DEFAULT_USER_PROFILE;

    const recommendations = await generateDailyRecommendationsWithGemini({
      airQuality,
      profile
    });

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error in /api/ai/recommendations:', error);
    return NextResponse.json({ recommendations: [] }, { status: 500 });
  }
}
