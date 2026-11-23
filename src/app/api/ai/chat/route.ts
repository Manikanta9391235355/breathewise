import { NextRequest, NextResponse } from 'next/server';
import { askBreatheWiseChat } from '@/lib/geminiService';
import { DEMO_AIR_QUALITY, DEFAULT_USER_PROFILE } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationHistory, airQuality, profile } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await askBreatheWiseChat({
      message,
      conversationHistory: conversationHistory || [],
      airQuality: airQuality || DEMO_AIR_QUALITY,
      profile: profile || DEFAULT_USER_PROFILE
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/ai/chat:', error);
    return NextResponse.json(
      {
        reply: 'I am experiencing a temporary connection issue. Please keep in mind that during high PM2.5 conditions, limiting prolonged outdoor exertion and keeping street-facing windows latched are the most effective immediate actions.',
        isFallback: true
      },
      { status: 200 }
    );
  }
}
