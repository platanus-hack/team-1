'use client';

import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicrophoneButtonProps {
  isRecording: boolean;
  isLoading: boolean;
  onToggleRecording: () => void;
}

export function MicrophoneButton({
  isRecording,
  isLoading,
  onToggleRecording,
}: MicrophoneButtonProps) {
  return (
    <Button
      size="lg"
      variant={isRecording ? "destructive" : "default"}
      className={cn(
        "w-36 h-36 rounded-full p-0 transition-all duration-300",
        isRecording && "bg-red-50 border-red-500 text-red-500 animate-pulse",
        !isRecording && "border-2 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500",
        isLoading && "opacity-80"
      )}
      onClick={onToggleRecording}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-10 w-10 animate-spin" />
      ) : isRecording ? (
        <Square className="h-10 w-10" />
      ) : (
        <Mic className="h-10 w-10" />
      )}
    </Button>
  );
}