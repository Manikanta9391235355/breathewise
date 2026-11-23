'use client';

import React, { useState } from 'react';
import { Wind, Bell, Sliders, MapPin, Sparkles, Home, Shield, Activity, Users, MessageSquare } from 'lucide-react';
import { UserProfile, NotificationItem } from '@/lib/types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenLocation: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  profile: UserProfile;
  aqiValue?: number;
  aqiCategory?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenLocation,
  onOpenSettings,
  onOpenNotifications,
  unreadCount,
  profile,
  aqiValue,
  aqiCategory
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'today', label: 'TODAY', icon: Activity },
    { id: 'forecast', label: 'AIR INTELLIGENCE', icon: Wind },
    { id: 'routine', label: 'YOUR ROUTINE', icon: Shield },
    { id: 'home-lab', label: 'CLEANER LIVING', icon: Home },
    { id: 'ask-ai', label: 'ASK AI', icon: MessageSquare, highlight: true },
    { id: 'community', label: 'COMMUNITY', icon: Users },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#fefae0]/90 backdrop-blur-md border border-forest/15 rounded-full px-4 sm:px-6 py-2.5 shadow-forest flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => setCurrentTab('landing')}
              className="flex items-center gap-2.5 text-forest group transition-transform active:scale-95"
            >
              <div className="w-9 h-9 rounded-full bg-forest text-cream flex items-center justify-center shadow-sm group-hover:bg-forest/90 transition-colors">
                <Wind className="w-5 h-5 text-cream" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-display text-xl tracking-tight leading-none text-forest">
                  BREATHE<span className="text-moss-dark">WISE</span>
                </span>
                <span className="text-[9px] font-sans tracking-utility uppercase text-forest/70 font-semibold">
                  Family Health
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-sage/30 px-3 py-1.5 rounded-full border border-forest/10">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-utility uppercase transition-all duration-300 ${
                      isActive
                        ? 'bg-forest text-cream shadow-sm'
                        : 'text-forest/80 hover:text-forest hover:bg-forest/10'
                    } ${item.highlight && !isActive ? 'text-forest font-bold' : ''}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Action Bar */}
            <div className="flex items-center gap-2">
              {/* Location Badge */}
              <button
                onClick={onOpenLocation}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-olive/50 hover:bg-olive border border-forest/15 text-forest text-xs font-semibold tracking-wide transition-all"
                title="Change location"
              >
                <MapPin className="w-3.5 h-3.5 text-forest" />
                <span className="max-w-[100px] truncate">{profile.city}</span>
                {aqiValue !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-forest text-cream font-bold">
                    AQI {aqiValue}
                  </span>
                )}
              </button>

              {/* Notification Button */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-full text-forest hover:bg-forest/10 transition-colors"
                title="In-app notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-aqi-severe rounded-full ring-2 ring-cream" />
                )}
              </button>

              {/* Settings Button */}
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-full text-forest hover:bg-forest/10 transition-colors"
                title="Family Profile & Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Primary CTA */}
              <button
                onClick={() => setCurrentTab('today')}
                className="bg-forest text-cream hover:bg-forest/90 px-4 py-2 rounded-full text-xs font-semibold tracking-utility uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-sage" />
                <span>CHECK MY AIR</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#fefae0]/95 backdrop-blur-md border-t border-forest/15 px-3 py-2 flex items-center justify-around shadow-forest">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
                isActive ? 'text-forest font-bold' : 'text-forest/60'
              }`}
            >
              <div className={`p-1.5 rounded-full ${isActive ? 'bg-forest text-cream' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] tracking-utility font-medium uppercase truncate max-w-[64px]">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
