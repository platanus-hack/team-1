"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/lib/supabase';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          try {
            await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: process.env.NEXT_PUBLIC_UPDATE_PASSWORD_REDIRECT,
            });
            setError("El usuario ya existe. Se ha enviado un correo para restablecer la contraseña.");
          } catch {
            setError("El usuario ya existe. Por favor, intenta recuperar tu contraseña.");
          }
        } else {
          setError("Error al registrarte. Por favor, verifica tus datos e inténtalo nuevamente.");
        }
        return;
      }

      if (data?.user) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
        router.push('/home');
      }
    } catch (error) {
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="register-email"
            type="email"
            placeholder="ejemplo@correo.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="register-password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
          />
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" variant="outline" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 h-4 w-4" />
        )}
        Registrarse
      </Button>
    </form>
  );
}