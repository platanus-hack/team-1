'use client';

import { useState, useCallback } from 'react';

interface AudioRecorderState {
  isRecording: boolean;
  audioUrl: string | null;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
}

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    audioUrl: null,
    mediaRecorder: null,
    audioChunks: [],
  });

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.start();

      setState((prev) => ({
        ...prev,
        isRecording: true,
        mediaRecorder,
        audioChunks,
      }));
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Por favor, permite el acceso al micrófono para grabar audio.');
        } else {
          throw new Error('Error al iniciar la grabación. Por favor, verifica tu micrófono.');
        }
      }
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    return new Promise<void>((resolve) => {
      if (!state.mediaRecorder) {
        resolve();
        return;
      }

      state.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(state.audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Stop all tracks in the stream
        state.mediaRecorder?.stream.getTracks().forEach((track) => track.stop());

        setState((prev) => ({
          ...prev,
          isRecording: false,
          audioUrl,
          mediaRecorder: null,
        }));

        resolve();
      };

      state.mediaRecorder.stop();
    });
  }, [state.mediaRecorder, state.audioChunks]);

  const sendAudioToBackend = useCallback(async () => {
    if (!state.audioUrl) return;

    try {
      // Obtener el user_id del localStorage de Supabase
      const supabaseUserId = localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF + '-auth-token');
      let userId;
      
      if (supabaseUserId) {
        const userData = JSON.parse(supabaseUserId);
        userId = userData.user.id;
        console.log('User ID encontrado:', userId); // Debug log
      }

      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(state.audioUrl);
      const audioBlob = await response.blob();

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('user_id', userId.toString()); // Aseguramos que sea string

      console.log('FormData contenido:', {
        user_id: userId,
        audio: audioBlob
      }); // Debug log

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const uploadResponse = await fetch(`${API_BASE_URL}/api/bitacora`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.text();
        console.error('Error response:', errorData);
        throw new Error('Error al procesar el audio');
      }

      // Clean up the audio URL
      URL.revokeObjectURL(state.audioUrl);
      setState((prev) => ({ ...prev, audioUrl: null }));

      return await uploadResponse.json();
    } catch (error) {
      throw new Error('Error al enviar el audio al servidor');
    }
  }, [state.audioUrl]);

  return {
    isRecording: state.isRecording,
    audioUrl: state.audioUrl,
    startRecording,
    stopRecording,
    sendAudioToBackend,
  };
}