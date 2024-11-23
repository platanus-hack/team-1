'use client';

import { useState, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { WeekdaySelector } from '@/components/WeekdaySelector';
import { MicrophoneButton } from '@/components/MicrophoneButton';
import { EntriesList } from '@/components/EntriesList';
import { AudioPreview } from '@/components/AudioPreview';
import { EntryModal } from '@/components/EntryModal';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Definir la interfaz para una entrada de bitácora
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

// Actualizar la interfaz Entry existente o reemplazarla
interface Entry extends BitacoraEntry {}

export default function HomePage() {
  const { isRecording, startRecording, stopRecording, sendAudioToBackend, audioUrl } = useAudioRecorder();
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [isRecordingLoading, setIsRecordingLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Extraer la función de fetchUserLogs fuera del useEffect para poder reutilizarla
  const fetchUserLogs = async () => {
    try {
      setIsDataLoading(true);
      
      const user = localStorage.getItem('user_data');
      const userId = user ? JSON.parse(user).id : null;
      
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/api/bitacora?user_id=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener bitácoras');
      }
      
      const { data } = await response.json();
      setLogs(data || []);
    } catch (error) {
      console.error('Error al obtener bitácoras:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar las bitácoras');
    } finally {
      setIsDataLoading(false);
    }
  };

  // Usar la función en el useEffect inicial
  useEffect(() => {
    fetchUserLogs();
  }, [API_BASE_URL]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedEntry) {
        setSelectedEntry(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [selectedEntry]);

  const handleDayChange = (dayIndex: number) => {
    setSelectedDay(dayIndex);
  };

  const handleToggleRecording = async () => {
    setError(null);
    try {
      if (!isRecording) {
        await startRecording();
      } else {
        setIsRecordingLoading(true);
        await stopRecording();
        const result = await sendAudioToBackend();
        console.log('Respuesta del servidor:', result);
        
        // Recargar la lista de bitácoras después de una subida exitosa
        await fetchUserLogs();
      }
    } catch (error) {
      console.error('Error detallado:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsRecordingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="relative space-y-8">
          {/* Recording Background Effect */}
          <div
            className={`fixed inset-0 z-0 bg-primary/20 backdrop-blur-sm transition-all duration-300 ${
              isRecording ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Main Content */}
          <div className="relative z-10 space-y-8">
            {error && (
              <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <WeekdaySelector
              selectedDay={selectedDay}
              completedDays={logs.map((log: any) => new Date(log.created_at).getDay())}
              onDayChange={handleDayChange}
            />

            <div className="flex flex-col items-center space-y-4">
              <MicrophoneButton
                isRecording={isRecording}
                onToggleRecording={handleToggleRecording}
                isLoading={isRecordingLoading}
              />
              
              {error && (
                <Alert variant="destructive" className="max-w-md">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {audioUrl && (
              <div className="max-w-2xl mx-auto">
                <AudioPreview audioUrl={audioUrl} />
              </div>
            )}

            {isDataLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <EntriesList
                logs={logs}
                selectedDay={selectedDay}
                onEntryClick={setSelectedEntry}
              />
            )}
          </div>
        </div>
      </div>

      <EntryModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}