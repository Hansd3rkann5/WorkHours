import { createContext, useContext, type ReactNode } from 'react';
import { useWorkEntries } from './useWorkEntries';

type WorkEntriesContextType = ReturnType<typeof useWorkEntries>;

const WorkEntriesContext = createContext<WorkEntriesContextType | null>(null);

export function WorkEntriesProvider({ children }: { children: ReactNode }) {
  const value = useWorkEntries();
  return <WorkEntriesContext.Provider value={value}>{children}</WorkEntriesContext.Provider>;
}

export function useWorkEntriesContext(): WorkEntriesContextType {
  const ctx = useContext(WorkEntriesContext);
  if (!ctx) throw new Error('WorkEntriesProvider missing');
  return ctx;
}
