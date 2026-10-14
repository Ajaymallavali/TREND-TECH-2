import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { GoogleLogin } from '@react-oauth/google';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError(null);
    const result = await login(values);
    if (result.ok) {
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } else {
      setServerError(result.message);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    setServerError(null);
    const result = await googleLogin(credentialResponse.credential);
    if (result.ok) {
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } else {
      setServerError(result.message);
    }
  };

  const onGoogleError = () => {
    setServerError('Google Sign-In was unsuccessful. Try again later.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent-600" />
          <span className="text-lg font-semibold tracking-tight">TREND-TECH</span>
        </div>

        <div className="card">
          <h1 className="mb-1 text-xl font-semibold text-ink-900">Welcome back</h1>
          <p className="mb-6 text-sm text-ink-500">Log in to track prices and manage alerts.</p>

          <div className="mb-4 flex justify-center">
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              text="signin_with"
              width="100%"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-ink-500">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input-field"
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input-field"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-ink-500 hover:text-ink-800">
              Forgot password?
            </Link>
            <Link to="/register" className="font-medium text-accent-600 hover:text-accent-700">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
