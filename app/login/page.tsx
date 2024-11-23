"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Bienvenido de nuevo' : 'Crear cuenta'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Inicia sesión para continuar' 
              : 'Registra una nueva cuenta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm"
          >
            {isLogin 
              ? '¿No tienes una cuenta? Regístrate' 
              : '¿Ya tienes una cuenta? Inicia sesión'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}