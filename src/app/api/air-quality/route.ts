import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveAirQuality } from '@/lib/airQualityService';
import { DEMO_AIR_QUALITY } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');
    const city = searchParams.get('city') || 'Hyderabad';

    if (!latStr || !lonStr) {
      return NextResponse.json(DEMO_AIR_QUALITY);
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(DEMO_AIR_QUALITY);
    }

    const data = await fetchLiveAirQuality(lat, lon, city);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API /api/air-quality error:', error);
    return NextResponse.json(DEMO_AIR_QUALITY, { status: 200 });
  }
}
