'use client';

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BookOpen, SmilePlus, Meh, Frown } from "lucide-react";

interface BitacoraEntry {
  uuid: string;
  title: string;
  transcription: string;
  analysis: string;
  emotion_state: string;
  follow_up_question: string;
  summary: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface EntriesListProps {
  logs: BitacoraEntry[];
  selectedDay: number;
  onEntryClick: (entry: BitacoraEntry) => void;
}

const EMOTION_COLORS = {
  'Felicidad': '#FFD700',
  'Tristeza': '#4682B4',
  'Ira': '#FF4500',
  'Miedo': '#800080',
  'Ansiedad': '#32CD32',
  'Amor': '#FF69B4',
  'Sorpresa': '#00FFFF',
  'Vergüenza': '#CD853F',
  'Esperanza': '#87CEEB',
  'Orgullo': '#FFB6C1'
} as const;

export function EntriesList({ logs, selectedDay, onEntryClick }: EntriesListProps) {
  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.created_at);
    return logDate.getDay() === selectedDay;
  });

  if (filteredLogs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No hay entradas para este día
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
        {filteredLogs.length} {filteredLogs.length === 1 ? 'entrada' : 'entradas'} este día
      </div>
      
      {filteredLogs.map((log) => (
        <div
          key={log.uuid}
          onClick={() => onEntryClick(log)}
          className={`rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200`}
          style={{
            background: `linear-gradient(to bottom right, ${EMOTION_COLORS[log.emotion_state] || ''}20, transparent)`,
            borderLeft: `4px solid ${EMOTION_COLORS[log.emotion_state] || ''}`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {log.title !== 'Sin título' ? log.title : 'Entrada del día'}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(log.created_at).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            {log.summary}
          </p>
        </div>
      ))}
    </div>
  );
}