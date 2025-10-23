'use client';
import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Eye, EyeOff, Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { error, data: session } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      localStorage.setItem('session', JSON.stringify(session));
      router.push('/home');
    } catch (error) {
      setErrorMessage('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto backdrop-blur-sm rounded-lg p-8 space-x-8">
          {/* Left side with logo and text */}
          <div className="w-full md:w-1/2 text-white space-y-6">
            <div className="flex justify-center md:justify-start items-center">
              <div className="w-64 md:w-80 lg:w-96">
                <img alt="logo" src="/assets/logo.png" className="w-full h-auto" />
              </div>
            </div>

            <p className="text-xl text-center md:text-left">
              Te impulsamos a transformar tus ideas en negocios
            </p>
          </div>

          {/* Right side with form */}
          <div className="w-full md:w-1/2 mt-8 md:mt-0">
            <div className="mb-4 md:mb-6 flex justify-end">
              <ThemeToggle />
            </div>

            <form className="space-y-6">
              {/* Email input */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full px-4 py-2 bg-transparent border-2 border-dotted border-white/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white"
                  placeholder="nombre@ejemplo.com"
                  autoComplete="email"
                />
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    className="w-full px-4 py-2 bg-transparent border-2 border-dotted border-white/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white"
                    placeholder="*************"
                    autoComplete="password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {errorMessage && <div className="text-red-300 text-sm">{errorMessage}</div>}

              {/* Login button */}
              <button
                type="button" // Asegúrate de que sea de tipo "button"
                onClick={handleSignIn}
                disabled={loading}
                className="w-full py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                {loading ? <div className="flex items-center justify-center">
                  <Loader2Icon className="w-8 h-8 animate-spin" />
                </div> : 'Iniciar sesión'}
              </button>

              {/* Register button */}
              <button
                type="button" // Asegúrate de que sea de tipo "button"
                onClick={() => router.push('/register')}
                className="w-full py-2 bg-transparent border-2 border-dotted border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Regístrate y crea tu negocio
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
