import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { apiClient } from '../services/apiClient.js';

/**
 * Hook to manage Saved / Liked products using authenticated user API
 * with automatic fallback to browser localStorage for guest users.
 */
export function useSavedProducts() {
  const { user } = useAuthStore();
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const local = localStorage.getItem('trendtech_saved_products');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  // Sync with backend if logged in
  useEffect(() => {
    if (user) {
      apiClient
        .get('/wishlist')
        .then((res) => {
          if (res.data?.data) {
            const ids = res.data.data.map((item) => (item.product ? item.product._id : item._id));
            setSavedIds(ids);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const isSaved = (productId) => {
    return savedIds.includes(productId);
  };

  const toggleSave = async (productId) => {
    if (!productId) return;

    const nextIds = isSaved(productId)
      ? savedIds.filter((id) => id !== productId)
      : [...savedIds, productId];

    setSavedIds(nextIds);
    try {
      localStorage.setItem('trendtech_saved_products', JSON.stringify(nextIds));
    } catch {
      // ignore local storage errors
    }

    if (user) {
      try {
        if (isSaved(productId)) {
          await apiClient.delete(`/wishlist/${productId}`);
        } else {
          await apiClient.post('/wishlist', { productId });
        }
      } catch {
        // graceful fallback to local storage state
      }
    }
  };

  return {
    savedIds,
    isSaved,
    toggleSave,
  };
}
