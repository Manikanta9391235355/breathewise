import { NextRequest, NextResponse } from 'next/server';
import { POPULAR_CITIES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
      return NextResponse.json(POPULAR_CITIES.slice(0, 8));
    }

    // First check local curated cities for instant match
    const localMatches = POPULAR_CITIES.filter(
      c => c.name.toLowerCase().includes(query.toLowerCase()) ||
           (c.state && c.state.toLowerCase().includes(query.toLowerCase())) ||
           c.country.toLowerCase().includes(query.toLowerCase())
    );

    try {
      // Query Open-Meteo Geocoding
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
      const res = await fetch(geoUrl, { next: { revalidate: 86400 } });

      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];

        const remoteMatches = results.map((r: any) => ({
          name: r.name,
          state: r.admin1,
          country: r.country,
          latitude: r.latitude,
          longitude: r.longitude,
          tier: 'Location'
        }));

        // Merge without duplicates
        const combined = [...localMatches];
        for (const rem of remoteMatches) {
          if (!combined.some(c => Math.abs(c.latitude - rem.latitude) < 0.1 && Math.abs(c.longitude - rem.longitude) < 0.1)) {
            combined.push(rem);
          }
        }
        return NextResponse.json(combined);
      }
    } catch (e) {
      // Return local matches if remote fails
    }

    return NextResponse.json(localMatches.length > 0 ? localMatches : POPULAR_CITIES.slice(0, 5));
  } catch (error) {
    return NextResponse.json(POPULAR_CITIES.slice(0, 5));
  }
}
