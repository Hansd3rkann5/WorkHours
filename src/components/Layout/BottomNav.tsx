import { LayoutDashboard, CalendarDays } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function BottomNav() {
  return (
    <nav
      className="shrink-0 border-t border-[#27272a] bg-[#09090b]/95 backdrop-blur-sm xl:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-2xl">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-1 cursor-pointer flex-col items-center gap-1 py-3 text-xs transition-colors ${
              isActive ? 'text-white' : 'text-[#52525b] hover:text-[#a1a1aa]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span>Dashboard</span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/verlauf"
          className={({ isActive }) =>
            `flex flex-1 cursor-pointer flex-col items-center gap-1 py-3 text-xs transition-colors ${
              isActive ? 'text-white' : 'text-[#52525b] hover:text-[#a1a1aa]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <CalendarDays size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span>Verlauf</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
