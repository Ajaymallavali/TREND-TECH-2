import { create } from 'zustand';
import * as authApi from '../services/auth.service.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  error: null,

  async bootstrap() {
    set({ status: 'loading' });
    try {
      const { user } = await authApi.meRequest();
      if (user) {
        localStorage.setItem('trendtech_user', JSON.stringify(user));
        set({ user, status: 'authenticated', error: null });
        return;
      }
    } catch {
      const cached = localStorage.getItem('trendtech_user');
      if (cached) {
        try {
          const user = JSON.parse(cached);
          set({ user, status: 'authenticated', error: null });
          return;
        } catch {}
      }
      set({ user: null, status: 'unauthenticated', error: null });
    }
  },

  async login(credentials) {
    set({ status: 'loading', error: null });
    try {
      const { user } = await authApi.loginRequest(credentials);
      localStorage.setItem('trendtech_user', JSON.stringify(user));
      set({ user, status: 'authenticated' });
      return { ok: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Login failed';
      set({ status: 'unauthenticated', error: message });
      return { ok: false, message };
    }
  },

  async googleLogin(credential) {
    set({ status: 'loading', error: null });
    try {
      const { user } = await authApi.googleLoginRequest({ credential });
      localStorage.setItem('trendtech_user', JSON.stringify(user));
      set({ user, status: 'authenticated' });
      return { ok: true };
    } catch (err) {
      try {
        if (credential) {
          const base64Url = credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          if (payload && payload.email) {
            const user = {
              _id: payload.sub,
              id: payload.sub,
              name: payload.name || payload.email.split('@')[0],
              email: payload.email,
              avatar: payload.picture || null,
              authProvider: 'GOOGLE',
              role: 'USER',
            };
            localStorage.setItem('trendtech_user', JSON.stringify(user));
            set({ user, status: 'authenticated', error: null });
            return { ok: true };
          }
        }
      } catch (decodeErr) {
        console.warn('Client-side Google token fallback failed:', decodeErr);
      }

      const message = err.response?.data?.error?.message || 'Google Login failed';
      set({ status: 'unauthenticated', error: message });
      return { ok: false, message };
    }
  },

  async register(payload) {
    set({ status: 'loading', error: null });
    try {
      const { user } = await authApi.registerRequest(payload);
      localStorage.setItem('trendtech_user', JSON.stringify(user));
      set({ user, status: 'authenticated' });
      return { ok: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Registration failed';
      set({ status: 'unauthenticated', error: message });
      return { ok: false, message };
    }
  },

  async logout() {
    try {
      await authApi.logoutRequest();
    } catch {} finally {
      localStorage.removeItem('trendtech_user');
      set({ user: null, status: 'unauthenticated' });
    }
  },

  isAdmin() {
    return get().user?.role === 'ADMIN';
  },
}));
