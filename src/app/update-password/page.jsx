"use client";
import { useRouter } from 'next/navigation'; // Importa useRouter
import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";


export default function UpdatePassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        if (error.code === 'same_password') {
          setError("La nueva contraseña no puede ser la misma que la anterior.");
        } else {
          setError("Error al actualizar la contraseña. Por favor, inténtalo nuevamente más tarde.");
        }
      } else {
        router.push('/home');
      }
    } catch (err) {
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Actualizar Contraseña</h1>
      <form className="bg-white p-6 rounded shadow-md w-80" onSubmit={handleUpdatePassword}>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Nueva Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full p-2 border rounded mt-1"
            placeholder="Ingresa tu nueva contraseña"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
        >
          {loading ? "Actualizando..." : "Actualizar Contraseña"}
        </button>
      </form>
      {message && <p className="text-green-500 mt-4">{message}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
