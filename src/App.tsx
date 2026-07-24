import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Header } from './components/Layout/Header';
import { BottomNav } from './components/Layout/BottomNav';
import { Dashboard } from './components/Dashboard/Dashboard';
import { DashboardContent } from './components/Dashboard/DashboardContent';
import { YearCalendar } from './components/Calendar/YearCalendar';
import { HistoryList } from './components/Calendar/HistoryList';
import { WorkEntriesProvider, useWorkEntriesContext } from './hooks/WorkEntriesContext';

const CalendarPage = lazy(() =>
  import('./components/Calendar/CalendarPage').then((m) => ({ default: m.CalendarPage }))
);

const SPINNER = (
  <div className="flex flex-1 items-center justify-center">
    <Loader2 size={28} className="animate-spin text-[#52525b]" />
  </div>
);

function ColumnLabel({ label }: { label: string }) {
  return (
    <div className="border-b border-[#27272a] px-4 py-3">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#3f3f46]">
        {label}
      </span>
    </div>
  );
}

function AppShell() {
  const { activeEntry, entries } = useWorkEntriesContext();

  return (
    <div className="flex min-h-dvh flex-col bg-[#09090b] xl:h-dvh xl:overflow-hidden">
      <Header activeEntry={!!activeEntry} />

      {/* ── Desktop layout (≥1280px): 3 columns, no bottom nav ── */}
      <div className="hidden xl:flex flex-1 min-h-0 divide-x divide-[#27272a]">
        {/* Left — Dashboard */}
        <div className="flex w-[360px] shrink-0 flex-col overflow-y-hidden">
          <ColumnLabel label="Dashboard" />
          <DashboardContent />
        </div>

        {/* Center — Year calendar */}
        <div className="flex flex-1 flex-col overflow-y-hidden">
          <ColumnLabel label="Jahresübersicht" />
          <div className="p-5">
            <YearCalendar entries={entries} />
          </div>
        </div>

        {/* Right — History */}
        <div className="flex w-[360px] shrink-0 flex-col overflow-y-auto">
          <ColumnLabel label="Verlauf" />
          <HistoryList />
        </div>
      </div>

      {/* ── Mobile layout (<1280px): tabs + bottom nav ── */}
      <div className="flex flex-1 flex-col overflow-y-auto xl:hidden">
        <Suspense fallback={SPINNER}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/verlauf" element={<CalendarPage />} />
          </Routes>
        </Suspense>
      </div>
      <div className="xl:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <WorkEntriesProvider>
        <AppShell />
      </WorkEntriesProvider>
    </HashRouter>
  );
}
