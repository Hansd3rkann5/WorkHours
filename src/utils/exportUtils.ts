import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WorkEntry } from '../types';
import { formatTime, formatDateShort, minutesToDisplay } from './timeCalc';

interface ExportRow {
  Datum: string;
  Eingestempelt: string;
  Ausgestempelt: string;
  'Gestempelte Zeit': string;
  'Effektive Zeit': string;
}

function buildRows(entries: WorkEntry[]): ExportRow[] {
  return entries
    .filter((e) => e.clock_out !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      Datum: formatDateShort(e.date),
      Eingestempelt: formatTime(e.clock_in),
      Ausgestempelt: e.clock_out ? formatTime(e.clock_out) : '–',
      'Gestempelte Zeit': e.clocked_minutes !== null ? minutesToDisplay(e.clocked_minutes) : '–',
      'Effektive Zeit': e.effective_minutes !== null ? minutesToDisplay(e.effective_minutes) : '–',
    }));
}

export function exportToCSV(entries: WorkEntry[]): void {
  const rows = buildRows(entries);
  const headers = Object.keys(rows[0] ?? {});
  const csvLines = [
    headers.join(';'),
    ...rows.map((r) => headers.map((h) => (r as unknown as Record<string, string>)[h]).join(';')),
  ];
  const blob = new Blob(['﻿' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, 'arbeitszeiten.csv');
}

export function exportToExcel(entries: WorkEntry[]): void {
  const rows = buildRows(entries);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Arbeitszeiten');
  XLSX.writeFile(wb, 'arbeitszeiten.xlsx');
}

export function exportToPDF(entries: WorkEntry[]): void {
  const rows = buildRows(entries);
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text('Arbeitszeiten Übersicht', 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Exportiert am ${new Date().toLocaleDateString('de-DE')}`, 14, 23);

  autoTable(doc, {
    startY: 30,
    head: [Object.keys(rows[0] ?? {})],
    body: rows.map((r) => Object.values(r)),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  });

  doc.save('arbeitszeiten.pdf');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
