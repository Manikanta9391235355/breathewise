'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LandingHero } from '@/components/LandingHero';
import { OnboardingModal } from '@/components/OnboardingModal';
import { Dashboard } from '@/components/Dashboard';
import { OutdoorPlanner } from '@/components/OutdoorPlanner';
import { DailyActionPlan } from '@/components/DailyActionPlan';
import { CleanAirHomeLab } from '@/components/CleanAirHomeLab';
import { LowEmissionRoutine } from '@/components/LowEmissionRoutine';
import { ImpactTracker } from '@/components/ImpactTracker';
import { AskBreatheWise } from '@/components/AskBreatheWise';
import { CommunityMode } from '@/components/CommunityMode';
import { NotificationCenter } from '@/components/NotificationCenter';
import { SettingsModal } from '@/components/SettingsModal';

import { AirQualityData, DailyRecommendation, NotificationItem, UserProfile } from '@/lib/types';
import { DEFAULT_USER_PROFILE, DEMO_AIR_QUALITY, SAMPLE_RECOMMENDATIONS } from '@/lib/constants';
import {
  getStoredProfile,
  saveStoredProfile,
  getCompletedActionIds,
  toggleCompletedActionId,
  getCompletedIndoorItemIds,
  toggleCompletedIndoorItemId,
  getStoredNotifications,
  markNotificationAsRead,
  getJoinedCommunityChallenges,
  toggleCommunityChallenge,
} from '@/lib/storage';

export default function BreatheWiseApp() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [airQuality, setAirQuality] = useState<AirQualityData>(DEMO_AIR_QUALITY);
  const [recommendations, setRecommendations] = useState<DailyRecommendation[]>(SAMPLE_RECOMMENDATIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [completedIndoorIds, setCompletedIndoorIds] = useState<string[]>([]);
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([]);

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Loading states
  const [isLoadingAir, setIsLoadingAir] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize client state from storage
  useEffect(() => {
    setIsMounted(true);
    const storedProf = getStoredProfile();
    setProfile(storedProf);
    setNotifications(getStoredNotifications());
    setCompletedIndoorIds(getCompletedIndoorItemIds());
    setJoinedChallenges(getJoinedCommunityChallenges());

    const completedActions = getCompletedActionIds();
    setRecommendations(prev =>
      prev.map(r => ({ ...r, completed: completedActions.includes(r.id) }))
    );

    // Initial fetch for the user's city
    fetchAirData(storedProf.latitude, storedProf.longitude, storedProf.city, storedProf);
  }, []);

  // Fetch air quality from internal API route
  const fetchAirData = useCallback(async (
    lat: number,
    lon: number,
    cityName: string,
    currentProf?: UserProfile
  ) => {
    setIsLoadingAir(true);
    try {
      const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}&city=${encodeURIComponent(cityName)}`);
      if (res.ok) {
        const data: AirQualityData = await res.json();
        setAirQuality(data);

        // Update notifications if AQI is high
        if (data.aqi > 150) {
          const highAqiNotif: NotificationItem = {
            id: `notif-high-${Date.now()}`,
            title: `Severe AQI (${data.aqi}) in ${data.locationName}`,
            message: `Fine PM2.5 reached ${data.pm2_5} µg/m³. Limit outdoor exercise and keep windows latched.`,
            type: 'warning',
            time: 'Just now',
            read: false
          };
          setNotifications(prev => [highAqiNotif, ...prev.filter(n => !n.id.startsWith('notif-high-'))]);
        }
      }
    } catch (err) {
      console.error('Error fetching air quality:', err);
    } finally {
      setIsLoadingAir(false);
    }
  }, []);

  // Generate Daily Recommendations with Gemini AI
  const handleGenerateRecommendations = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airQuality,
          profile
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.recommendations && data.recommendations.length > 0) {
          const completedIds = getCompletedActionIds();
          const mapped = data.recommendations.map((r: DailyRecommendation) => ({
            ...r,
            completed: completedIds.includes(r.id)
          }));
          setRecommendations(mapped);
        }
      }
    } catch (e) {
      console.error('Failed to generate plan:', e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Profile Save
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
    fetchAirData(newProfile.latitude, newProfile.longitude, newProfile.city, newProfile);
  };

  // Location switch
  const handleSelectCity = (cityName: string, lat: number, lon: number) => {
    const updated: UserProfile = {
      ...profile,
      city: cityName,
      latitude: lat,
      longitude: lon,
      isLiveLocation: cityName === 'My Location'
    };
    handleSaveProfile(updated);
  };

  // Action completion toggle
  const handleToggleActionComplete = (id: string) => {
    const updatedIds = toggleCompletedActionId(id);
    setRecommendations(prev =>
      prev.map(r => r.id === id ? { ...r, completed: updatedIds.includes(id) } : r)
    );
  };

  // Indoor checklist item toggle
  const handleToggleIndoorItem = (id: string) => {
    const updated = toggleCompletedIndoorItemId(id);
    setCompletedIndoorIds(updated);
  };

  // Community challenge join toggle
  const handleToggleCommunityChallenge = (id: string) => {
    const updated = toggleCommunityChallenge(id);
    setJoinedChallenges(updated);
  };

  // Mark notification read
  const handleMarkNotificationAsRead = (id: string) => {
    const updated = markNotificationAsRead(id);
    setNotifications(updated);
  };

  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('breathewise_notifications', JSON.stringify(updated));
    }
  };

  // Reset demo data
  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      setProfile(DEFAULT_USER_PROFILE);
      setCompletedIndoorIds(['in-1', 'in-2']);
      setJoinedChallenges(['comm-1', 'comm-3']);
      setRecommendations(SAMPLE_RECOMMENDATIONS);
      setNotifications(getStoredNotifications());
      fetchAirData(DEFAULT_USER_PROFILE.latitude, DEFAULT_USER_PROFILE.longitude, DEFAULT_USER_PROFILE.city);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-sage selection:text-forest">
      {/* Fixed Pill Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenLocation={() => setIsOnboardingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadCount}
        profile={profile}
        aqiValue={airQuality.aqi}
        aqiCategory={airQuality.aqiCategory}
      />

      {/* Main Content Sections based on currentTab */}
      <main className="flex-1 pb-16">
        {/* LANDING TAB */}
        {currentTab === 'landing' && (
          <div className="space-y-12">
            <LandingHero
              airQuality={airQuality}
              profile={profile}
              onExplorePlan={() => setCurrentTab('routine')}
              onCheckAir={() => setCurrentTab('today')}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />

            {/* Quick Teaser of the Air Intelligence Dashboard */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4 border-b border-forest/15 pb-2">
                <span className="text-xs font-semibold tracking-utility uppercase text-forest/70">
                  REAL-TIME INTELLIGENCE SNAPSHOT
                </span>
                <button
                  onClick={() => setCurrentTab('today')}
                  className="text-xs font-semibold tracking-utility uppercase text-forest underline underline-offset-4"
                >
                  EXPAND FULL DASHBOARD →
                </button>
              </div>
              <Dashboard
                airQuality={airQuality}
                profile={profile}
                onRefresh={() => fetchAirData(profile.latitude, profile.longitude, profile.city, profile)}
                onOpenLocation={() => setIsOnboardingOpen(true)}
                onNavigateToRoutine={() => setCurrentTab('routine')}
                isLoading={isLoadingAir}
              />
            </div>
          </div>
        )}

        {/* TODAY / DASHBOARD TAB */}
        {currentTab === 'today' && (
          <div className="pt-24 space-y-8">
            <Dashboard
              airQuality={airQuality}
              profile={profile}
              onRefresh={() => fetchAirData(profile.latitude, profile.longitude, profile.city, profile)}
              onOpenLocation={() => setIsOnboardingOpen(true)}
              onNavigateToRoutine={() => setCurrentTab('routine')}
              isLoading={isLoadingAir}
            />
            {/* Embedded Daily Action Plan preview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="pt-6 border-t border-forest/15">
                <DailyActionPlan
                  recommendations={recommendations}
                  onToggleComplete={handleToggleActionComplete}
                  onRegenerate={handleGenerateRecommendations}
                  isGenerating={isGeneratingPlan}
                  airQuality={airQuality}
                  profile={profile}
                />
              </div>
            </div>
          </div>
        )}

        {/* AIR INTELLIGENCE & FORECAST TAB */}
        {currentTab === 'forecast' && (
          <div className="pt-24 space-y-8">
            <Dashboard
              airQuality={airQuality}
              profile={profile}
              onRefresh={() => fetchAirData(profile.latitude, profile.longitude, profile.city, profile)}
              onOpenLocation={() => setIsOnboardingOpen(true)}
              onNavigateToRoutine={() => setCurrentTab('routine')}
              isLoading={isLoadingAir}
            />
            <OutdoorPlanner
              airQuality={airQuality}
              profile={profile}
            />
          </div>
        )}

        {/* YOUR ROUTINE TAB (Daily Action Plan + Outdoor planner + Low-emission commute) */}
        {currentTab === 'routine' && (
          <div className="pt-24 space-y-8">
            <DailyActionPlan
              recommendations={recommendations}
              onToggleComplete={handleToggleActionComplete}
              onRegenerate={handleGenerateRecommendations}
              isGenerating={isGeneratingPlan}
              airQuality={airQuality}
              profile={profile}
            />
            <OutdoorPlanner
              airQuality={airQuality}
              profile={profile}
            />
            <LowEmissionRoutine
              airQuality={airQuality}
              profile={profile}
            />
          </div>
        )}

        {/* CLEANER LIVING TAB (Clean Air Home Lab, Low-emission, Impact Tracker) */}
        {currentTab === 'home-lab' && (
          <div className="pt-24 space-y-8">
            <CleanAirHomeLab
              airQuality={airQuality}
              profile={profile}
              completedItemIds={completedIndoorIds}
              onToggleItem={handleToggleIndoorItem}
            />
            <LowEmissionRoutine
              airQuality={airQuality}
              profile={profile}
            />
            <ImpactTracker
              airQuality={airQuality}
              profile={profile}
            />
          </div>
        )}

        {/* ASK AI TAB (BreatheWise conversational assistant) */}
        {currentTab === 'ask-ai' && (
          <div className="pt-24 space-y-8">
            <AskBreatheWise
              airQuality={airQuality}
              profile={profile}
            />
          </div>
        )}

        {/* COMMUNITY TAB */}
        {currentTab === 'community' && (
          <div className="pt-24 space-y-8">
            <CommunityMode
              joinedChallengeIds={joinedChallenges}
              onToggleJoin={handleToggleCommunityChallenge}
              cityName={airQuality.locationName}
            />
            <ImpactTracker
              airQuality={airQuality}
              profile={profile}
            />
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <Footer />

      {/* Interactive Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onSelectCity={handleSelectCity}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onResetData={handleResetData}
      />

      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
      />
    </div>
  );
}
