"use client"
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient'; // Asegúrate de tener el archivo de configuración supabaseClient.js


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log(1, error);

        setError("Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente más tarde.");
      } else {
        setSuccess('Logged in successfully!');
        redirect('/home')
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
        console.log(2, error);
        setError("Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente más tarde.");
      } else {
        setSuccess('Logged in successfully!');
        redirect('/home')
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
            {loading ? 'Loading...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {loading ? 'Loading...' : 'Register'}
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
}
