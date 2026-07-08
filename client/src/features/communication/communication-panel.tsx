import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, BarChart2, Activity } from 'lucide-react';
import { ChatTab } from './chat-tab';
import { PollsTab } from './polls-tab';
import { ActivityTab } from './activity-tab';

interface CommunicationPanelProps {
  tripId: string;
}

export function CommunicationPanel({ tripId }: CommunicationPanelProps) {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex flex-col h-full bg-background border-l">
      <div className="p-4 border-b pb-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="polls" className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Polls</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <ChatTab tripId={tripId} />
        </div>
        <div className={`absolute inset-0 ${activeTab === 'polls' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <PollsTab tripId={tripId} />
        </div>
        <div className={`absolute inset-0 ${activeTab === 'activity' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <ActivityTab tripId={tripId} />
        </div>
      </div>
    </div>
  );
}
