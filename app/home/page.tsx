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

interface Entry {
  title: string;
  content: string;
  emotional_status: 'good' | 'neutral' | 'bad';
}

export default function HomePage() {
  const { isRecording, startRecording, stopRecording, sendAudioToBackend, audioUrl } = useAudioRecorder();
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [isRecordingLoading, setIsRecordingLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUserLogs = async () => {
      try {
        setIsDataLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/logs`);
        if (!response.ok) {
          throw new Error(`Failed fetching user logs with status ${response.status}`);
        }
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Failed fetchUserLogs, couldnt retrieve bitacoras: ', error);
      } finally {
        setIsDataLoading(false);
      }
    };
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