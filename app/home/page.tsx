'use client';

import { AudioPreview } from '@/components/AudioPreview';
import { EntriesList } from '@/components/EntriesList';
import { EntryModal } from '@/components/EntryModal';
import { MicrophoneButton } from '@/components/MicrophoneButton';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WeekdaySelector } from '@/components/WeekdaySelector';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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
  const { isRecording, startRecording, stopRecording, sendAudioToBackend, audioUrl, volume } = useAudioRecorder();
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [isRecordingLoading, setIsRecordingLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notifications_enabled') === 'true';
    }
    return false;
  });

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

  // Función para mostrar notificación
  const showNotification = (title: string, body: string) => {
    // Primero intentar la notificación nativa
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body,
          icon: '/icon.png',
          silent: false,
        });
      } catch (error) {
        console.error('Error showing native notification:', error);
      }
    }

    // Siempre mostrar el toast como respaldo
    toast(title, {
      description: body,
      duration: 8000,
      style: {
        backgroundColor: 'var(--primary)',
        color: 'white',
        fontSize: '1.2rem',
        padding: '1rem',
      },
    });
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    console.log('Toggle clicked, enabled:', enabled);
    
    if (enabled) {
      try {
        // Verificar si las notificaciones están soportadas
        if (!("Notification" in window)) {
          toast.error('Tu navegador no soporta notificaciones');
          return;
        }

        console.log('Requesting notification permission...');
        
        // Si ya tenemos permiso, no necesitamos pedirlo de nuevo
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true);
          localStorage.setItem('notifications_enabled', 'true');
          toast.success('Notificaciones activadas');
          return;
        }
        
        // Si los permisos están denegados, no podemos pedirlos de nuevo
        if (Notification.permission === 'denied') {
          toast.error('Las notificaciones están bloqueadas. Por favor, habilítalas en la configuración de tu navegador.');
          return;
        }

        // Pedir permisos
        const permission = await Notification.requestPermission();
        console.log('Permission result:', permission);
        
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          localStorage.setItem('notifications_enabled', 'true');
          toast.success('Notificaciones activadas');
          
          // Enviar notificación de prueba
          new Notification('¡Notificaciones activadas!', {
            body: 'Las notificaciones están funcionando correctamente',
            icon: '/icon.png',
          });
        } else {
          setNotificationsEnabled(false);
          localStorage.setItem('notifications_enabled', 'false');
          toast.error('Necesitamos tu permiso para mostrar notificaciones');
        }
      } catch (error) {
        console.error('Error requesting permission:', error);
        toast.error('Error al solicitar permisos de notificación');
        setNotificationsEnabled(false);
        localStorage.setItem('notifications_enabled', 'false');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('notifications_enabled', 'false');
      toast('Notificaciones desactivadas');
    }
  };

  const handleToggleRecording = async () => {
    setError(null);
    try {
      if (!isRecording) {
        await startRecording();
      } else {
        setIsRecordingLoading(true);
        await stopRecording();
        setIsProcessing(true);
        const result = await sendAudioToBackend();
        console.log('Respuesta del servidor:', result);
        await fetchUserLogs();

        if (notificationsEnabled && result.follow_up_question) {
          setTimeout(() => {
            showNotification(
              'Pregunta de seguimiento',
              result.follow_up_question
            );
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error detallado:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsRecordingLoading(false);
      setIsProcessing(false);
    }
  };

  // Modificar el TestNotificationButton
  const TestNotificationButton = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <button
        className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md"
        onClick={() => {
          console.log('Test button clicked');
          console.log('Notifications enabled:', notificationsEnabled);
          console.log('Notification permission:', Notification.permission);
          
          if (notificationsEnabled && Notification.permission === 'granted') {
            showNotification(
              'Pregunta de seguimiento',
              '¿Cómo te sientes después de compartir esto?'
            );
          } else {
            toast.error(
              'Las notificaciones están desactivadas o no están permitidas. ' +
              `(Enabled: ${notificationsEnabled}, Permission: ${Notification.permission})`
            );
          }
        }}
      >
        Test Notification
      </button>
    );
  };

  // Agregar este useEffect después de las declaraciones de estado
  useEffect(() => {
    // Verificar permisos al cargar
    const checkNotificationPermission = async () => {
      if (typeof Notification !== 'undefined') {
        const permission = Notification.permission;
        console.log('Current notification permission:', permission);
        
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          localStorage.setItem('notifications_enabled', 'true');
        } else {
          setNotificationsEnabled(false);
          localStorage.setItem('notifications_enabled', 'false');
        }
      }
    };

    checkNotificationPermission();
  }, []);

  // Agregar este componente de debug
  const DebugButton = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <button
        className="fixed bottom-20 right-4 bg-gray-500 text-white px-4 py-2 rounded-md"
        onClick={() => {
          console.log({
            notificationsEnabled,
            notificationPermission: Notification.permission,
            browserSupport: 'Notification' in window,
          });
          
          toast.info(`Estado actual:
            Activadas: ${notificationsEnabled}
            Permiso: ${Notification.permission}
            Soporte: ${'Notification' in window}`
          );
        }}
      >
        Debug Notifications
      </button>
    );
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 justify-end mb-4 bg-primary/5 p-4 rounded-lg">
          <Switch
            id="notifications"
            checked={notificationsEnabled}
            onCheckedChange={handleNotificationToggle}
          />
          <Label htmlFor="notifications" className="font-medium">
            Activar notificaciones
          </Label>
        </div>

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
      <TestNotificationButton />
      <DebugButton />
    </div>
  );
}