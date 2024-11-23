'use client';

import { Card } from "@/components/ui/card";
import { Volume2 } from "lucide-react";

interface AudioPreviewProps {
  audioUrl: string;
}

export function AudioPreview({ audioUrl }: AudioPreviewProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <Volume2 className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Vista previa del audio</h3>
      </div>
      <audio controls className="w-full">
        <source src={audioUrl} type="audio/wav" />
        Tu navegador no soporta el elemento de audio.
      </audio>
    </Card>
  );
}