import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { BalanceEntry } from '@wend/shared';

interface BalancesSidebarProps {
  balances: BalanceEntry[];
  currency: string;
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function BalancesSidebar({ balances, currency }: BalancesSidebarProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Balances</h4>
      {balances.length === 0 && (
        <p className="text-xs text-muted-foreground">No members yet.</p>
      )}
      <div className="space-y-2">
        {balances.map((entry) => {
          const amount = parseFloat(entry.balance);
          const isPositive = amount > 0.01;
          const isNegative = amount < -0.01;

          return (
            <div key={entry.userId} className="flex items-center gap-2">
              <Avatar size="sm">
                {entry.userImage ? (
                  <AvatarImage src={entry.userImage} alt={entry.userName} />
                ) : null}
                <AvatarFallback>{getInitials(entry.userName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entry.userName}</p>
                <p className={`text-xs ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {isPositive
                    ? `+${currency} ${amount.toFixed(2)} owed to you`
                    : isNegative
                      ? `-${currency} ${Math.abs(amount).toFixed(2)} you owe`
                      : 'Settled up'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
