'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SmilePlus, Meh, Frown } from "lucide-react";

interface Entry {
  title: string;
  content: string;
  emotional_status: 'good' | 'neutral' | 'bad';
}

interface EntryModalProps {
  entry: Entry | null;
  onClose: () => void;
}

export function EntryModal({ entry, onClose }: EntryModalProps) {
  const getEmotionIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <SmilePlus className="h-6 w-6 text-green-500" />;
      case 'neutral':
        return <Meh className="h-6 w-6 text-yellow-500" />;
      case 'bad':
        return <Frown className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={!!entry} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        {entry && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{entry.title}</DialogTitle>
                {getEmotionIcon(entry.emotional_status)}
              </div>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}