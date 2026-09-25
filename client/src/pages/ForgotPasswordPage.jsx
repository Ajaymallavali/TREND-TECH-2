import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPasswordRequest } from '../services/auth.service.js';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState(null);
  const [message, setMessage] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError(null);
    setMessage(null);
    setResetToken(null);

    try {
      const data = await forgotPasswordRequest(values);
      setMessage(data.message || 'If the account exists, a reset link has been sent.');
      if (data.resetToken) setResetToken(data.resetToken);
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Unable to process the request.');
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
          <h1 className="mb-1 text-xl font-semibold text-ink-900">Forgot password?</h1>
          <p className="mb-6 text-sm text-ink-500">
            Enter your email to request a password reset.
          </p>

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

            {serverError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>}
            {message && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}

            {resetToken && (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Development reset token generated. Continue to the reset page with this token:
                <div className="mt-2 break-all font-mono">{resetToken}</div>
                <Link
                  to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="mt-2 inline-block font-medium text-accent-700 hover:text-accent-800"
                >
                  Open reset password page
                </Link>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Sending…' : 'Request reset'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-500">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-accent-600 hover:text-accent-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
