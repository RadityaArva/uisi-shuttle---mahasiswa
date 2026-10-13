import React from 'react';

export type MainTab = 'shuttle' | 'riwayat' | 'profil';

interface BottomNavProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    {
      id: 'shuttle' as MainTab,
      label: 'Shuttle',
      icon: 'directions_bus'
    },
    {
      id: 'riwayat' as MainTab,
      label: 'Riwayat',
      icon: 'history'
    },
    {
      id: 'profil' as MainTab,
      label: 'Profil',
      icon: 'person'
    }
  ];

  return (
    <nav className="h-[72px] bg-white border-t border-[#E5E7EB] flex items-center justify-around px-4 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] z-20 shrink-0">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              isActive ? 'text-[#C8102E]' : 'text-[#6B7280] hover:text-[#1F2933]'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span
                className={`material-symbols-outlined text-[24px] transition-transform ${
                  isActive ? 'scale-110 font-bold' : ''
                }`}
              >
                {tab.icon}
              </span>
            </div>
            <span
              className={`text-[11px] mt-1 font-medium tracking-tight ${
                isActive ? 'font-semibold text-[#C8102E]' : 'text-[#6B7280]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
