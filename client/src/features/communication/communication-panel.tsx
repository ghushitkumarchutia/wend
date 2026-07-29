import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Chat01Icon,
  Chart01Icon,
  Activity01Icon,
} from '@hugeicons/core-free-icons';
import { useCommunicationPanelStore } from '@/stores/communication-panel-store';
import { ChatTab } from './chat-tab';
import { PollsTab } from './polls-tab';
import { ActivityTab } from './activity-tab';

interface CommunicationPanelProps {
  tripId: string;
}

export function CommunicationPanel({ tripId }: CommunicationPanelProps) {
  const storeActiveTab = useCommunicationPanelStore((s) => s.activeTab);
  const setStoreTab = useCommunicationPanelStore((s) => s.setTab);
  const [localActiveTab, setLocalActiveTab] = useState<'chat' | 'polls' | 'activity'>('chat');

  const activeTab = storeActiveTab || localActiveTab;
  const setActiveTab = (tab: 'chat' | 'polls' | 'activity') => {
    setStoreTab(tab);
    setLocalActiveTab(tab);
  };

  const tabs: { id: 'chat' | 'polls' | 'activity'; label: string; icon: typeof Chat01Icon }[] = [
    { id: 'chat', label: 'Chat', icon: Chat01Icon },
    { id: 'polls', label: 'Polls', icon: Chart01Icon },
    { id: 'activity', label: 'Activity', icon: Activity01Icon },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] border-l border-neutral-200/80 font-manrope select-none">
      <div className="p-2.5 md:p-3 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md flex items-center justify-center shrink-0">
        <nav
          className="w-full inline-flex items-center justify-between gap-1 p-1 rounded-full bg-white border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-full overflow-x-auto no-scrollbar"
          aria-label="Communication Tabs"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (isActive) {
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex-1 inline-flex items-center justify-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-2 md:py-2.5 rounded-full text-white font-semibold text-[11px] md:text-xs cursor-pointer select-none shrink-0 group focus:outline-none transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                    boxShadow: `
                      inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                      inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
                      0 6px 16px -2px rgba(16, 185, 129, 0.45),
                      0 3px 6px 0 rgba(0, 0, 0, 0.12)
                    `,
                  }}
                >
                  <div className="absolute inset-x-2 md:inset-x-3 top-0.5 h-1 md:h-1.5 rounded-t-full bg-linear-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

                  <div
                    className="w-4 h-4 md:w-4.5 md:h-4.5 rounded-full bg-white flex items-center justify-center shrink-0 relative z-10 -translate-y-px"
                    style={{
                      boxShadow: `
                        inset 0 -1px 2px rgba(0, 0, 0, 0.15),
                        inset 0 1px 2px rgba(255, 255, 255, 1),
                        0 2px 4px rgba(0, 0, 0, 0.15)
                      `,
                    }}
                  >
                    <HugeiconsIcon
                      icon={Icon}
                      className="w-2.5 h-2.5 block"
                      color="#10b981"
                      strokeWidth={2.2}
                    />
                  </div>

                  <span className="relative z-10 leading-none font-syne font-bold tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] whitespace-nowrap -translate-y-px">
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-2 md:py-2.5 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80 font-medium text-[11px] md:text-xs transition-all duration-150 cursor-pointer shrink-0 group"
              >
                <HugeiconsIcon
                  icon={Icon}
                  className="w-3.5 h-3.5 block text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0"
                  strokeWidth={1.8}
                />
                <span className="leading-none whitespace-nowrap font-syne tracking-wide -translate-y-px">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#F5F5F7]">
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${
            activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <ChatTab tripId={tripId} />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${
            activeTab === 'polls' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <PollsTab tripId={tripId} />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${
            activeTab === 'activity' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <ActivityTab tripId={tripId} />
        </div>
      </div>
    </div>
  );
}
