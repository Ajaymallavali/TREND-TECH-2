import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPasswordRequest } from '../services/auth.service.js';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[a-z]/, 'Needs a lowercase letter')
      .regex(/[A-Z]/, 'Needs an uppercase letter')
      .regex(/[0-9]/, 'Needs a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError(null);
    if (!token) {
      setServerError('Reset token is missing. Request a new password reset link.');
      return;
    }

    try {
      await resetPasswordRequest({ token, password: values.password });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Unable to reset password.');
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
          <h1 className="mb-1 text-xl font-semibold text-ink-900">Reset password</h1>
          <p className="mb-6 text-sm text-ink-500">Choose a new password for your account.</p>

          {!token && (
            <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This page needs a valid reset token.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700">
                New password
              </label>
              <input id="password" type="password" autoComplete="new-password" className="input-field" {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink-700">
                Confirm password
              </label>
              <input id="confirmPassword" type="password" autoComplete="new-password" className="input-field" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            {serverError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>}
            {success && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Password reset successful. Redirecting to login…</div>}

            <button type="submit" disabled={isSubmitting || success || !token} className="btn-primary w-full">
              {isSubmitting ? 'Resetting…' : 'Reset password'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-500">
            <Link to="/forgot-password" className="font-medium text-accent-600 hover:text-accent-700">
              Request another reset link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
