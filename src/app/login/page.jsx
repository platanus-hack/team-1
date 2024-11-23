"use client";
import { useRouter } from 'next/navigation'; // Importa useRouter
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient'; // Asegúrate de tener el archivo de configuración supabaseClient.js


export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.code === 'invalid_credentials') {
          setError("Usuario o contraseña incorrectos.");
        } else {
          setError("Credenciales incorrectas o error inesperado. Por favor, inténtalo nuevamente.");
        }
      } else {
        router.push('/home');
      }
    } catch (error) {
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        if (error.code === 'unexpected_failure') {
          setError("Por favor, verifica que el correo sea válido.");

        } else if (error.message === 'User already registered') {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: process.env.NEXT_PUBLIC_UPDATE_PASSWORD_REDIRECT, // Cambia esto al URL de tu página de restablecimiento
          });

          if (error) {
            setError("Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente más tarde.");
          }
          
          setError("El usuario ya existe. Se ha enviado un correo para restablecer la contraseña.");
        } else {
          setError("Error al registrarte. Por favor, inténtalo nuevamente.");
        }
      } else {
        router.push('/home'); // Descomenta si deseas redirigir al usuario después del registro
      }
    } catch (error) {
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form className="bg-white p-6 rounded shadow-md w-80">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full p-2 border rounded mt-1"
            placeholder="example@mail.com"
            required
          />
        </label>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full p-2 border rounded mt-1"
            placeholder="Your password"
            required
          />
        </label>
        <div className="flex justify-between mt-4">
          <button
            type="submit"
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
