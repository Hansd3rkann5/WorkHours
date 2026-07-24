import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import type { WorkEntry } from '../../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';

interface ExportMenuProps {
  entries: WorkEntry[];
}

export function ExportMenu({ entries }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = [
    {
      label: 'Excel (.xlsx)',
      icon: <FileSpreadsheet size={16} />,
      action: () => exportToExcel(entries),
    },
    {
      label: 'CSV',
      icon: <FileText size={16} />,
      action: () => exportToCSV(entries),
    },
    {
      label: 'PDF',
      icon: <File size={16} />,
      action: () => exportToPDF(entries),
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-2.5 text-sm text-[#f4f4f5] transition-colors hover:border-[#3f3f46] hover:bg-[#27272a]"
      >
        <Download size={16} />
        Exportieren
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-[#27272a] bg-[#18181b] shadow-2xl">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
