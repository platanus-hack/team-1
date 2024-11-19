'use client';

import { useEffect, useState } from "react";

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8 text-primary">
        Platanus Hack
      </h1>
      
      <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
        <h2 className="text-xl mb-4 text-card-foreground">
          Estado de la conexión con el backend
        </h2>
        
        {connectionStatus === 'loading' && (
          <p className="text-secondary">
            Verificando conexión...
          </p>
        )}
        
        {connectionStatus === 'success' && (
          <p className="text-green-500">
            ✓ Conexión con el backend exitosa
          </p>
        )}
        
        {connectionStatus === 'error' && (
          <p className="text-red-500">
            ✗ Problemas con la conexión al backend
          </p>
        )}
      </div>
    </div>
  );
}
