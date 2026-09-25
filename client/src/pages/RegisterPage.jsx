import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[0-9]/, 'Needs a number'),
});

export default function RegisterPage() {
  const registerUser = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError(null);
    const result = await registerUser(values);
    if (result.ok) {
      navigate('/dashboard', { replace: true });
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent-600" />
          <span className="text-lg font-semibold tracking-tight">TREND-TECH</span>
        </div>

        <div className="card">
          <h1 className="mb-1 text-xl font-semibold text-ink-900">Create your account</h1>
          <p className="mb-6 text-sm text-ink-500">
            Track prices, get alerts, shop smarter.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-700">
                Name
              </label>
              <input id="name" type="text" className="input-field" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

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
                autoComplete="new-password"
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
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent-600 hover:text-accent-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
