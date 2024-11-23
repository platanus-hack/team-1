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
      const user = localStorage.getItem('user_data')  
      const userId = user ? JSON.parse(user).id : null

      const response = await fetch(state.audioUrl);
      const audioBlob = await response.blob();

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('user_id', userId.toString());

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_BASE_URL) {
        throw new Error('URL del API no configurada');
      }

      console.log('Enviando petición a:', `${API_BASE_URL}/api/bitacora`);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/api/bitacora`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Error del servidor: ${errorData.error || uploadResponse.statusText}`);
      }

      // Clean up the audio URL
      URL.revokeObjectURL(state.audioUrl);
      setState((prev) => ({ ...prev, audioUrl: null }));

      return await uploadResponse.json();
    } catch (error) {
      console.error('Error detallado:', error);
      if (error instanceof Error) {
        throw new Error(`Error al enviar el audio al servidor: ${error.message}`);
      }
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