import React from 'react';
import { LayoutDashboard, Mic, Clock, Users, CreditCard, Package, Database } from 'lucide-react';

export type NavTab = 'dashboard' | 'assistant' | 'payments' | 'inventory' | 'settlements' | 'winback' | 'sources';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  overdueCount?: number;
  lapsedCount?: number;
  lowStockCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  overdueCount = 0,
  lapsedCount = 0,
  lowStockCount = 0
}) => {
  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'assistant',
      label: 'Voice Munim',
      icon: <Mic className="w-5 h-5" />
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-5 h-5" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-red-500'
    },
    {
      id: 'settlements',
      label: 'Settlements',
      icon: <Clock className="w-5 h-5" />,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-red-500'
    },
    {
      id: 'winback',
      label: 'Win-Back Offer',
      icon: <Users className="w-5 h-5" />,
      badge: lapsedCount > 0 ? lapsedCount : undefined,
      badgeColor: 'bg-blue-600'
    },
    {
      id: 'sources',
      label: 'Data Sources',
      icon: <Database className="w-5 h-5" />
    }
  ];

  return (
    <>
      {/* Desktop Sidebar (Left Rail) */}
      <aside className="hidden lg:block w-64 shrink-0 pr-6">
        <nav className="space-y-1.5 sticky top-28 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <div className="px-3 py-2 text-[11px] font-black tracking-wider uppercase text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#002970] text-[#00b9f1] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#00b9f1]' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] text-white font-black ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Bar (Fixed at 360px & mobile widths) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around overflow-x-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 relative rounded-lg transition-colors cursor-pointer shrink-0 ${
                isActive ? 'text-[#002970]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <span className={isActive ? 'text-[#002970]' : 'text-slate-500'}>
                  {item.icon}
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-2 w-4 h-4 rounded-full text-[9px] text-white font-black flex items-center justify-center ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] font-bold tracking-tight mt-0.5 ${
                  isActive ? 'text-[#002970]' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
