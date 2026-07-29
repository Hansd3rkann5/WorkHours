import { Clock } from 'lucide-react';

interface HeaderProps {
  activeEntry: boolean;
  paused: boolean;
}

export function Header({ activeEntry, paused }: HeaderProps) {
  return (
    <header
      className="shrink-0 border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-sm"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="gap-2 mx-auto flex max-w-2xl items-center justify-center px-4 py-4">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-white" />
          <span className="text-base font-semibold tracking-tight text-[#f4f4f5]">WorkHours</span>
        </div>
        {activeEntry && (
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all duration-300 ease-in-out ${
              paused
                ? 'bg-[#78350f]/40 ring-1 ring-[#fbbf24]/50'
                : 'bg-transparent ring-0'
            }`}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full transition-colors duration-300 ease-in-out ${
                paused ? 'animate-pulse bg-[#fbbf24]' : 'animate-active-pulse bg-[#4ade80]'
              }`}
            />
            <span
              className={`text-sm font-medium transition-colors duration-300 ease-in-out ${
                paused ? 'text-[#fbbf24]' : 'text-[#4ade80]'
              }`}
            >
              {paused ? 'Pausiert' : 'Eingestempelt'}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
