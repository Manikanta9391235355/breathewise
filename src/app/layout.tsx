import type { Metadata, Viewport } from 'next';
import './globals.css';
import { NoiseOverlay } from '@/components/NoiseOverlay';

export const metadata: Metadata = {
  title: 'BreatheWise — AI-Powered Urban Air Quality & Family Health Assistant',
  description: 'Know what the air is doing. Know what to do next. Actionable, personalized urban air quality intelligence and family clean-air routines.',
  keywords: ['Air Quality', 'AQI', 'PM2.5', 'Urban Pollution', 'Winter Smog', 'Family Health', 'Clean Air', 'India AQI', 'BreatheWise'],
  authors: [{ name: 'BreatheWise Intelligence Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#01472e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-cream text-forest min-h-screen selection:bg-sage selection:text-forest">
        <NoiseOverlay />
        {children}
      </body>
    </html>
  );
}
