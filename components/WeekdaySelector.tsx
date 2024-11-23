'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface WeekdaySelectorProps {
  selectedDay: number;
  completedDays: number[];
  onDayChange: (day: number) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function WeekdaySelector({ selectedDay, completedDays, onDayChange }: WeekdaySelectorProps) {
  const uiToJsDay = (uiDay: number) => (uiDay + 1) % 7;
  const jsTouiDay = (jsDay: number) => (jsDay + 6) % 7;

  const uiCompletedDays = completedDays.map(jsDay => jsTouiDay(jsDay));
  const uiSelectedDay = jsTouiDay(selectedDay);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Seleccionar día
        </h2>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day, uiIndex) => {
          const isCompleted = uiCompletedDays.includes(uiIndex);
          const isSelected = uiSelectedDay === uiIndex;

          return (
            <Button
              key={day}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "h-12 relative",
                isCompleted && !isSelected && "border-primary/50"
              )}
              onClick={() => onDayChange(uiToJsDay(uiIndex))}
            >
              <span className="text-sm">{day}</span>
              {isCompleted && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}