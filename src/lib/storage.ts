import { UserProfile, ChatMessage, NotificationItem, ImpactMetrics } from './types';
import { DEFAULT_USER_PROFILE } from './constants';

const PROFILE_KEY = 'breathewise_user_profile';
const COMPLETED_ACTIONS_KEY = 'breathewise_completed_actions';
const INDOOR_CHECKLIST_KEY = 'breathewise_indoor_checklist';
const CHAT_HISTORY_KEY = 'breathewise_chat_history';
const NOTIFICATIONS_KEY = 'breathewise_notifications';
const COMMUNITY_ACTIONS_KEY = 'breathewise_community_joined';

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : DEFAULT_USER_PROFILE;
  } catch (e) {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

export function getCompletedActionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(COMPLETED_ACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function toggleCompletedActionId(id: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getCompletedActionIds();
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];
    localStorage.setItem(COMPLETED_ACTIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function getCompletedIndoorItemIds(): string[] {
  if (typeof window === 'undefined') return ['in-1', 'in-2'];
  try {
    const data = localStorage.getItem(INDOOR_CHECKLIST_KEY);
    return data ? JSON.parse(data) : ['in-1', 'in-2'];
  } catch (e) {
    return ['in-1', 'in-2'];
  }
}

export function toggleCompletedIndoorItemId(id: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getCompletedIndoorItemIds();
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];
    localStorage.setItem(INDOOR_CHECKLIST_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function getStoredChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CHAT_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredChatHistory(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-30)));
  } catch (e) {
    console.error('Failed to save chat history', e);
  }
}

export function getStoredNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    // fallback
  }

  // Initial welcome notifications
  return [
    {
      id: 'notif-1',
      title: 'Morning Peak Inversion Alert',
      message: 'Ground level PM2.5 peaks in early morning. Keep balcony doors closed and postpone outdoor cardio.',
      type: 'warning',
      time: '8:00 AM',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Optimal Ventilation Window Approaching',
      message: 'Diurnal boundary layer rises between 1:00 PM and 3:30 PM. Quick 15-minute cross-ventilation window.',
      type: 'routine',
      time: '12:30 PM',
      read: false
    },
    {
      id: 'notif-3',
      title: 'BreatheWise Activated',
      message: 'Personalized family clean-air routines calibrated for your household profile.',
      type: 'info',
      time: 'Just now',
      read: true
    }
  ];
}

export function markNotificationAsRead(id: string): NotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredNotifications();
    const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function getStoredImpactMetrics(): ImpactMetrics {
  const completedActions = getCompletedActionIds();
  const completedIndoor = getCompletedIndoorItemIds();

  return {
    actionsCompletedToday: completedActions.length,
    actionsCompletedThisWeek: completedActions.length + 5,
    sustainableTravelChoices: 4,
    indoorImprovements: completedIndoor.length,
    streakDays: 4,
    qualitativeAchievements: [
      'Protected developing respiratory pathways during peak morning inversion',
      'Prevented indoor aerosol stagnation through scheduled kitchen exhaust ventilation',
      'Suppressed coarse dust resuspension with damp mopping',
      'Created low-particle bedroom sanctuary for restorative sleep'
    ]
  };
}

export function getJoinedCommunityChallenges(): string[] {
  if (typeof window === 'undefined') return ['comm-1', 'comm-3'];
  try {
    const data = localStorage.getItem(COMMUNITY_ACTIONS_KEY);
    return data ? JSON.parse(data) : ['comm-1', 'comm-3'];
  } catch (e) {
    return ['comm-1', 'comm-3'];
  }
}

export function toggleCommunityChallenge(id: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getJoinedCommunityChallenges();
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];
    localStorage.setItem(COMMUNITY_ACTIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}
