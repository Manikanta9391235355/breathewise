'use client';

import React from 'react';
import { X, Bell, AlertTriangle, Info, Clock, Check, CheckCheck } from 'lucide-react';
import { NotificationItem } from '@/lib/types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-forest/40 backdrop-blur-xs animate-reveal">
      <div className="relative w-full max-w-md bg-cream rounded-[2.5rem] border border-forest/20 shadow-forest-lg p-6 sm:p-7 text-forest overflow-hidden mt-12 sm:mt-16">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-forest/15">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-forest" />
            <h3 className="font-display text-xl text-forest">AIR NOTIFICATIONS</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[10px] uppercase font-semibold tracking-utility text-forest/70 hover:text-forest flex items-center gap-1 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>MARK ALL</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-forest/10 text-forest/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 py-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-forest/60 text-xs">
              No recent notifications. Air quality is stable.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkAsRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white/50 border-forest/10 opacity-75'
                    : 'bg-white border-forest/20 shadow-xs ring-1 ring-forest/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {n.type === 'warning' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-aqi-severe shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-forest shrink-0" />
                    )}
                    <span className="font-bold text-xs text-forest">{n.title}</span>
                  </div>
                  <span className="text-[10px] text-forest/50 shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-forest/80 leading-normal">{n.message}</p>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-forest/15 text-center">
          <span className="text-[10px] uppercase tracking-utility text-forest/50 font-semibold">
            In-app atmospheric alerts generated from local sensors
          </span>
        </div>
      </div>
    </div>
  );
};
