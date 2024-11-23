'use client';

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SmilePlus, Meh, Frown } from "lucide-react";

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

interface EntryModalProps {
  entry: BitacoraEntry | null;
  onClose: () => void;
}

export function EntryModal({ entry, onClose }: EntryModalProps) {
  if (!entry) return null;

  // Manejar click fuera del modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Si el click fue directamente en el backdrop (no en el contenido)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} // Prevenir que clicks en el contenido cierren el modal
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div 
                className={`w-3 h-3 rounded-full ${
                  entry.emotion_state === 'Neutral' ? 'bg-yellow-400' :
                  entry.emotion_state === 'Positive' ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <h2 className="text-2xl font-bold">
                {entry.title !== 'Sin título' ? entry.title : 'Entrada del día'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="sr-only">Cerrar</span>
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Transcripción</h3>
              <p className="text-gray-600 dark:text-gray-300">{entry.transcription}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Resumen</h3>
              <p className="text-gray-600 dark:text-gray-300">{entry.summary}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Análisis</h3>
              <p className="text-gray-600 dark:text-gray-300">{entry.analysis}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Pregunta de seguimiento</h3>
              <p className="text-primary italic">{entry.follow_up_question}</p>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Creado el {new Date(entry.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}