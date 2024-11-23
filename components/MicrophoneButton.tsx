'use client';

import { useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface MicrophoneButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  isLoading: boolean;
}

export function MicrophoneButton({ isRecording, onToggleRecording, isLoading }: MicrophoneButtonProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isRecording) {
      // Inicializar el análisis de audio
      const initAudioAnalysis = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          
          analyserRef.current.fftSize = 256;
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const animate = () => {
            if (!analyserRef.current || !buttonRef.current) return;
            
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            const scale = 1 + (average / 256) * 0.5; // Escala entre 1 y 1.5
            
            buttonRef.current.style.transform = `scale(${scale})`;
            animationFrameRef.current = requestAnimationFrame(animate);
          };

          animate();
        } catch (error) {
          console.error('Error initializing audio analysis:', error);
        }
      };

      initAudioAnalysis();
    } else {
      // Limpiar cuando se detiene la grabación
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (buttonRef.current) {
        buttonRef.current.style.transform = 'scale(1)';
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isRecording]);

  return (
    <button
      ref={buttonRef}
      disabled={isLoading}
      className={`
        relative w-36 h-36 
        ${isRecording 
          ? 'bg-white text-primary shadow-lg' 
          : 'bg-primary text-white shadow-xl'
        }
        rounded-full 
        flex items-center justify-center 
        transition-all duration-300
        hover:scale-110
        disabled:opacity-50
        z-50
      `}
      onClick={onToggleRecording}
    >
      {isLoading ? (
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      ) : (
        isRecording ? <Square size={32} /> : <Mic size={32} />
      )}
    </button>
  );
}