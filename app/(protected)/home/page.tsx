'use client';

import { AudioPreview } from '@/components/AudioPreview';
import { EntriesList } from '@/components/EntriesList';
import { EntryModal } from '@/components/EntryModal';
import { MicrophoneButton } from '@/components/MicrophoneButton';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WeekdaySelector } from '@/components/WeekdaySelector';
import { useNotifications } from "@/contexts/NotificationContext";
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
interface Entry extends BitacoraEntry { }

export default function HomePage() {
  const router = useRouter();
  const { isRecording, startRecording, stopRecording, sendAudioToBackend, audioUrl, volume } = useAudioRecorder();
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [isRecordingLoading, setIsRecordingLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { addNotification } = useNotifications();
  const [justRecorded, setJustRecorded] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Extraer la función de fetchUserLogs fuera del useEffect para poder reutilizarla
  const fetchUserLogs = async () => {
    try {
      setIsDataLoading(true);
      const user = localStorage.getItem('user_data');
      const userId = user ? JSON.parse(user).id : null;

      if (!userId) {
        router.push('/login');
        throw new Error('Por favor inicia sesión');
      }

      const response = await fetch(`${API_BASE_URL}/api/bitacora?user_id=${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener bitácoras');
      }

      const { data } = await response.json();
      setLogs(data || []);

      // Agregamos logs para debug
      if (justRecorded) {
        console.log("Just recorded:", justRecorded);
        console.log("Latest entry:", data[0]);
        console.log("Follow up question:", data[0]?.follow_up_question);
      }

      // Solo mostrar la notificación si acabamos de grabar
      if (justRecorded && data && data.length > 0) {
        const latestEntry = data[0];
        if (latestEntry.follow_up_question) {
          console.log("Programando notificación...");
          setTimeout(() => {
            console.log("Mostrando notificación");
            addNotification({
              title: "Pregunta de seguimiento",
              message: latestEntry.follow_up_question,
            });
          }, 4000);
        }
        setJustRecorded(false);
      }
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

  const handleSendAudio = async () => {
    try {
      setIsProcessing(true);
      const result = await sendAudioToBackend();
      if (!result) return;
      
      console.log("Audio enviado, esperando respuesta...");
      // Primero hacemos el fetch
      const user = localStorage.getItem('user_data');
      const userId = user ? JSON.parse(user).id : null;
      
      if (!userId) return;
      
      const response = await fetch(`${API_BASE_URL}/api/bitacora?user_id=${userId}`);
      const { data } = await response.json();
      
      if (data && data.length > 0) {
        const latestEntry = data[0];
        console.log("Nueva entrada:", latestEntry);
        
        if (latestEntry.follow_up_question) {
          // Programamos la notificación directamente aquí
          setTimeout(() => {
            console.log("Mostrando notificación de seguimiento");
            addNotification({
              title: "Pregunta de seguimiento",
              message: latestEntry.follow_up_question,
            });
          }, 4000);
        }
      }
      
      // Actualizamos los logs después
      setLogs(data || []);
      
    } catch (error) {
      console.error("Error en handleSendAudio:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleToggleRecording = async () => {
    setError(null);

    try {
      if (!isRecording) {
        await startRecording();
      } else {
        setIsRecordingLoading(true);
        await stopRecording();
      }
    } catch (error) {
      console.error('Error detallado:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsRecordingLoading(false);
    }
  };

  useEffect(() => {
    const sendAudio = async () => {
      if (audioUrl) {
        await handleSendAudio();
      }
    };

    sendAudio();
  }, [audioUrl]);

  const handleTestNotification = () => {
    addNotification({
      title: "Nueva notificación",
      message: "Esta es una notificación de prueba para el menú de notificaciones",
    });
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="relative space-y-8">
          {/* Fondo expandible - Movido debajo del contenido principal */}
          <div
            className={`
              fixed inset-0 
              bg-primary/20 
              backdrop-blur-sm 
              transition-all duration-700 
              ${isRecording
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-0 rounded-full'
              }
              origin-center
              z-0
            `}
          />

          {/* Main Content */}
          <div className="relative z-10 space-y-8">
            {error && (
              <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className={`transition-opacity duration-500 ${isRecording ? 'opacity-0' : 'opacity-100'}`}>
              <WeekdaySelector
                selectedDay={selectedDay}
                completedDays={logs.map((log: any) => new Date(log.created_at).getDay())}
                onDayChange={handleDayChange}
              />
            </div>

            {/* Contenedor del micrófono con animación de volumen más dramática */}
            <div className="flex flex-col items-center justify-center relative h-[400px] w-full">
              {/* Círculo base siempre visible */}
              <div
                className="absolute rounded-full bg-primary/5"
                style={{
                  width: '120px',
                  height: '120px',
                  transform: 'translate(-50%, -50%)',
                  left: '50%',
                  top: '50%',
                }}
              />

              {/* Círculos de animación */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-primary/10 transition-all duration-75"
                  style={{
                    width: `${(volume * 800 + 120) * (1 + i * 0.2)}px`,
                    height: `${(volume * 800 + 120) * (1 + i * 0.2)}px`,
                    transform: 'translate(-50%, -50%)',
                    left: '50%',
                    top: '50%',
                    opacity: 0.8 - (i * 0.2),
                    animation: isRecording ? 'pulse 2s infinite' : 'none',
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}

              {/* Círculo principal que responde al volumen */}
              <div
                className="absolute rounded-full bg-primary/20 transition-all duration-75"
                style={{
                  width: `${volume * 600 + 140}px`,
                  height: `${volume * 600 + 140}px`,
                  transform: 'translate(-50%, -50%)',
                  left: '50%',
                  top: '50%',
                  boxShadow: `0 0 ${volume * 100}px ${volume * 40}px rgba(var(--primary), 0.3)`,
                }}
              />

              <div className="relative z-20">
                <MicrophoneButton
                  isRecording={isRecording}
                  onToggleRecording={handleToggleRecording}
                  isLoading={isRecordingLoading || isProcessing}
                />
              </div>
            </div>

            <div className={`transition-opacity duration-500 ${isRecording ? 'opacity-0' : 'opacity-100'}`}>
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
      </div>

      <EntryModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />

      {/* Indicador de procesamiento */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-foreground">Procesando audio...</p>
          </div>
        </div>
      )}

      <Button
        onClick={handleTestNotification}
        className="fixed bottom-4 right-4 z-50 opacity-0"
        variant="default"
      >
        Agregar Notificación
      </Button>

      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}