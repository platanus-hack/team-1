'use client';

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BookOpen, SmilePlus, Meh, Frown } from "lucide-react";

interface Entry {
  title: string;
  content: string;
  emotional_status: 'good' | 'neutral' | 'bad';
  created_at: string;
}

interface EntriesListProps {
  logs: Entry[];
  selectedDay: number;
  onEntryClick: (entry: Entry) => void;
}

export function EntriesList({ logs, selectedDay, onEntryClick }: EntriesListProps) {
  const filteredLogs = logs.filter(
    (log) => new Date(log.created_at).getDay() === selectedDay
  );

  const getEmotionIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <SmilePlus className="h-5 w-5 text-green-500" />;
      case 'neutral':
        return <Meh className="h-5 w-5 text-yellow-500" />;
      case 'bad':
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Entradas del día</h2>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <BookOpen className="h-8 w-8 mb-2" />
            <p>No hay entradas para este día</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto p-4 space-y-2"
                onClick={() => onEntryClick(log)}
              >
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-medium text-left">{log.title}</h3>
                  {getEmotionIcon(log.emotional_status)}
                </div>
                <p className="text-sm text-muted-foreground text-left line-clamp-2">
                  {log.content}
                </p>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}