import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AIAnalysisPage from './pages/AIAnalysisPage.jsx';

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/category/:category/brand/:brand" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/analysis" element={<AIAnalysisPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route element={<ProtectedRoute adminOnly={true} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  );
}
