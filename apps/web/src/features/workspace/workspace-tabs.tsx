import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export type WorkspaceTab = 'journey' | 'ledger' | 'documents' | 'travelers';

interface WorkspaceTabsProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  tentativeEventCount?: number;
  unsettledCount?: number;
  pendingInviteCount?: number;
}

const TAB_CONFIG: { value: WorkspaceTab; label: string }[] = [
  { value: 'journey', label: 'Journey' },
  { value: 'ledger', label: 'Ledger' },
  { value: 'documents', label: 'Documents' },
  { value: 'travelers', label: 'Travelers' },
];

export function WorkspaceTabs({
  activeTab,
  onTabChange,
  tentativeEventCount = 0,
  unsettledCount = 0,
  pendingInviteCount = 0,
}: WorkspaceTabsProps) {
  function getBadgeCount(tab: WorkspaceTab): number {
    if (tab === 'journey') return tentativeEventCount;
    if (tab === 'ledger') return unsettledCount;
    if (tab === 'travelers') return pendingInviteCount;
    return 0;
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as WorkspaceTab)}>
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-none bg-transparent p-0">
            {TAB_CONFIG.map((tab) => {
              const count = getBadgeCount(tab.value);
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {tab.label}
                  {count > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 size-5 justify-center rounded-full p-0 text-[10px]"
                    >
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>
    </Tabs>
  );
}
