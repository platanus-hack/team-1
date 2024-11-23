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
      {filteredLogs.map((log) => (
        <div
          key={log.uuid}
          onClick={() => onEntryClick(log)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer 
                   hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className={`w-3 h-3 rounded-full ${
                  log.emotion_state === 'Neutral' ? 'bg-yellow-400' :
                  log.emotion_state === 'Positive' ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <h3 className="text-lg font-semibold">
                {log.title !== 'Sin título' ? log.title : 'Entrada del día'}
              </h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(log.created_at).toLocaleTimeString()}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-3">
            {log.summary}
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {log.transcription.length > 100 
              ? `${log.transcription.substring(0, 100)}...` 
              : log.transcription}
          </p>
        </div>
      ))}
    </div>
  );
}