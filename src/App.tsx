import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Header } from './components/Layout/Header';
import { BottomNav } from './components/Layout/BottomNav';
import { Dashboard } from './components/Dashboard/Dashboard';
import { WorkEntriesProvider, useWorkEntriesContext } from './hooks/WorkEntriesContext';

const CalendarPage = lazy(() =>
  import('./components/Calendar/CalendarPage').then((m) => ({ default: m.CalendarPage }))
);

function AppShell() {
  const { activeEntry } = useWorkEntriesContext();

  return (
    <div className="flex min-h-dvh flex-col bg-[#09090b]">
      <Header activeEntry={!!activeEntry} />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Suspense fallback={<div className="flex flex-1 items-center justify-center"><Loader2 size={28} className="animate-spin text-[#52525b]" /></div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/verlauf" element={<CalendarPage />} />
          </Routes>
        </Suspense>
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/WorkHours">
      <WorkEntriesProvider>
        <AppShell />
      </WorkEntriesProvider>
    </BrowserRouter>
  );
}
