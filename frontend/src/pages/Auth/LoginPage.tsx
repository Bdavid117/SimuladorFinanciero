import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Landmark, Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabels = ['', 'Débil', 'Media', 'Fuerte'];
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        if (!nombre.trim()) { setError('El nombre es obligatorio'); setLoading(false); return; }
        await register(nombre, email, password);
      } else {
        await login(email, password);
      }
      // Navegación automática tras auth exitosa (useEffect reacciona al cambio de user)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(msg || (isRegister ? 'Error al registrarse' : 'Correo o contraseña incorrectos'));
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsRegister(!isRegister);
    setError('');
    setNombre('');
    setPassword('');
  }

  return (
    <div className="min-h-screen bg-[#0c1222] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.02] blur-3xl" />
      </div>

      <div className={`w-full max-w-[420px] relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Landmark size={30} className="text-white" />
          </div>
          <h1 className="text-[26px] font-bold text-white tracking-tight">SimInversiones</h1>
          <p className="text-[13px] text-slate-500 mt-1.5 tracking-wide">Simulador de Portafolio de Inversiones</p>
        </div>

        {/* Card */}
        <div className="bg-[#151d2e] border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/30 p-8 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-[17px] font-semibold text-white mb-1">
              {isRegister ? 'Crear cuenta' : 'Bienvenido'}
            </h2>
            <p className="text-[13px] text-slate-500">
              {isRegister ? 'Completa los datos para registrarte' : 'Ingresa tus credenciales para continuar'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre — solo registro */}
            {isRegister && (
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Nombre completo
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    autoComplete="name"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-[#1a2338] border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a2338] border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a2338] border border-slate-700/80 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength — solo registro */}
              {isRegister && password.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] font-medium ${
                    passwordStrength === 1 ? 'text-red-400' : passwordStrength === 2 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 shrink-0">
                  <span className="text-red-400 text-[10px] font-bold">!</span>
                </div>
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-[#151d2e] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Procesando...
                </span>
              ) : (
                <>
                  {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider + toggle */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <button
              onClick={toggleMode}
              className="text-[13px] text-slate-500 hover:text-emerald-400 transition-colors duration-200"
            >
              {isRegister ? (
                <>¿Ya tienes cuenta? <span className="font-semibold text-emerald-400">Inicia sesión</span></>
              ) : (
                <>¿No tienes cuenta? <span className="font-semibold text-emerald-400">Regístrate</span></>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-600">
          <ShieldCheck size={13} />
          <p className="text-[11px]">Proyecto académico &mdash; Datos protegidos con JWT</p>
        </div>
      </div>
    </div>
  );
}
