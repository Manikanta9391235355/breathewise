import React, { useState } from 'react';
import { Logo } from './Logo';
import {
  MessageSquare,
  Compass,
  Database,
  Layers,
  Sparkles,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { HealthStatus, ModelStatus } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthStatus | null;
  modelStatus: ModelStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  modelStatus,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'explorer', label: 'Property Explorer', icon: Compass },
    { id: 'sources', label: 'Knowledge Sources', icon: Database },
    { id: 'about', label: 'Architecture', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080E1E]/90 backdrop-blur-md border-b border-[#223354]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center text-left focus:outline-none"
          >
            <Logo size="md" />
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0F1A30]/80 p-1.5 rounded-xl border border-[#223354]/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C5A880]/20 to-[#C5A880]/10 text-[#DFCAAB] border border-[#C5A880]/40 shadow-sm'
                      : 'text-[#8A99AD] hover:text-[#F9F8F6] hover:bg-[#152238]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A880]' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Model Status Indicator & Links */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#152238] border border-[#223354] text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  health?.index_ready ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-[#8A99AD]">Model:</span>
              <span className="font-medium text-[#DFCAAB] truncate max-w-[140px]" title={modelStatus?.model_name}>
                {modelStatus?.model_name ? modelStatus.model_name.split(':')[0].split('/').pop() : 'Ernie 5.5'}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 text-[10px] uppercase font-bold">
                Free
              </span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg bg-[#152238] border border-[#223354] text-[#8A99AD] hover:text-white"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0F1A30] border-b border-[#223354] px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-[#C5A880]/20 text-[#DFCAAB] border border-[#C5A880]/40'
                    : 'text-[#8A99AD] hover:bg-[#152238] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 text-[#C5A880]" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#223354] mt-2 flex items-center justify-between text-xs text-[#8A99AD] px-2">
            <span>Model: {modelStatus?.model_name || 'baidu/ernie-5.5-flash-preview:free'}</span>
            <span className="text-emerald-400 font-semibold">100% Free Tier</span>
          </div>
        </div>
      )}
    </header>
  );
};
