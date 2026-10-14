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
      set({ user, status: 'authenticated', error: null });
    } catch {
      set({ user: null, status: 'unauthenticated', error: null });
    }
  },

  async login(credentials) {
    set({ status: 'loading', error: null });
    try {
      const { user } = await authApi.loginRequest(credentials);
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
      set({ user, status: 'authenticated' });
      return { ok: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Google Login failed';
      set({ status: 'unauthenticated', error: message });
      return { ok: false, message };
    }
  },

  async register(payload) {
    set({ status: 'loading', error: null });
    try {
      const { user } = await authApi.registerRequest(payload);
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
    } finally {
      set({ user: null, status: 'unauthenticated' });
    }
  },

  isAdmin() {
    return get().user?.role === 'ADMIN';
  },
}));
