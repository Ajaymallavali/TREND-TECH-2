import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Bell, Columns, Settings, User as UserIcon, LogOut, Trash2, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { apiClient } from '../services/apiClient.js';

const formatINR = (val) => {
  if (val === null || val === undefined) return 'Price unavailable';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('wishlist');

  // Preferences form state
  const [prefEmail, setPrefEmail] = useState(user?.notificationPreferences?.email ?? true);
  const [prefInApp, setPrefInApp] = useState(user?.notificationPreferences?.inApp ?? true);
  const [prefAlerts, setPrefAlerts] = useState(user?.notificationPreferences?.priceDropAlerts ?? true);
  const [prefDigest, setPrefDigest] = useState(user?.notificationPreferences?.dealDigest ?? true);
  const [saveStatus, setSaveStatus] = useState('');

  // 1. Fetch Wishlist items
  const { data: wishlist = [], isLoading: wishlistLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await apiClient.get('/wishlist');
      return res.data.data;
    },
  });

  // 2. Fetch Price Alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['price-alerts'],
    queryFn: async () => {
      const res = await apiClient.get('/price-alerts');
      return res.data.data;
    },
  });

  // 3. Fetch Comparisons
  const { data: comparisons = [], isLoading: comparisonsLoading } = useQuery({
    queryKey: ['comparisons'],
    queryFn: async () => {
      const res = await apiClient.get('/comparisons');
      return res.data.data;
    },
  });

  // 4. Wishlist Remove mutation
  const removeWishlistMutation = useMutation({
    mutationFn: async (productId) => {
      await apiClient.delete(`/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  // 5. Price Alert Delete mutation
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId) => {
      await apiClient.delete(`/price-alerts/${alertId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });

  // 6. Comparison Delete mutation
  const deleteComparisonMutation = useMutation({
    mutationFn: async (compId) => {
      await apiClient.delete(`/comparisons/${compId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparisons'] });
    },
  });

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      // Simulate saving to backend profile
      await apiClient.patch('/auth/me/preferences', {
        notificationPreferences: {
          email: prefEmail,
          inApp: prefInApp,
          priceDropAlerts: prefAlerts,
          dealDigest: prefDigest,
        },
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-ink-900">TREND-TECH</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-ink-600 hover:text-ink-900">
              Search
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-sm font-medium text-accent-700 hover:text-accent-900">
                Admin Panel
              </Link>
            )}
            <button onClick={logout} className="btn-secondary py-1.5 px-3.5 text-xs flex items-center gap-1">
              <LogOut className="h-3.5 w-3.5" /> Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="mx-auto mt-8 max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row">
          
          {/* Sidebar Nav */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="card bg-white p-4 space-y-2">
              <div className="flex items-center gap-3 border-b border-ink-50 pb-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-ink-900 leading-none">{user?.name}</h3>
                  <span className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide">{user?.role} Account</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'wishlist' ? 'bg-accent-50 text-accent-700' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                <Heart className="h-4 w-4" />
                My Wishlist
                <span className="ml-auto rounded bg-ink-100 px-1.5 py-0.5 text-xs font-semibold text-ink-600">
                  {wishlist.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'alerts' ? 'bg-accent-50 text-accent-700' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                <Bell className="h-4 w-4" />
                Price Alerts
                <span className="ml-auto rounded bg-ink-100 px-1.5 py-0.5 text-xs font-semibold text-ink-600">
                  {alerts.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('comparisons')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'comparisons' ? 'bg-accent-50 text-accent-700' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                <Columns className="h-4 w-4" />
                Saved Comparisons
                <span className="ml-auto rounded bg-ink-100 px-1.5 py-0.5 text-xs font-semibold text-ink-600">
                  {comparisons.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'settings' ? 'bg-accent-50 text-accent-700' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                <Settings className="h-4 w-4" />
                Preferences
              </button>
            </div>
          </aside>

          {/* Tab Content Panel */}
          <section className="flex-grow">
            
            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="card bg-white p-6">
                <h2 className="text-lg font-bold text-ink-900 mb-4">My Wishlist</h2>
                
                {wishlistLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
                  </div>
                ) : wishlist.length === 0 ? (
                  <div className="border border-dashed border-ink-200 rounded-xl p-10 text-center">
                    <Heart className="mx-auto h-10 w-10 text-ink-300" />
                    <h3 className="mt-2 text-sm font-semibold text-ink-900">Your wishlist is empty</h3>
                    <p className="mt-1 text-xs text-ink-400">Save products to your wishlist to keep track of their prices.</p>
                    <Link to="/" className="btn-primary mt-4 inline-block text-xs px-4 py-2">Discover Products</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {wishlist.map((item) => (
                      <div key={item._id} className="relative flex items-center gap-4 rounded-xl border border-ink-100 p-4 hover:border-accent-200 transition-colors">
                        <button
                          onClick={() => removeWishlistMutation.mutate(item.product._id)}
                          className="absolute top-2 right-2 rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-ink-50 border p-1">
                          <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-grow pr-6">
                          <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wide">{item.product.brand}</span>
                          <h4 className="font-semibold text-ink-900 text-sm line-clamp-1 leading-snug">{item.product.name}</h4>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-xs font-bold text-accent-700">{formatINR(item.product.minPrice)}</span>
                            {item.product.mrp && item.product.mrp > item.product.minPrice && (
                              <span className="text-[10px] text-ink-400 line-through">{formatINR(item.product.mrp)}</span>
                            )}
                          </div>
                          <Link to={`/product/${item.product._id}`} className="mt-2 text-xs font-semibold text-accent-600 hover:underline inline-block">
                            Compare prices &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PRICE ALERTS TAB */}
            {activeTab === 'alerts' && (
              <div className="card bg-white p-6">
                <h2 className="text-lg font-bold text-ink-900 mb-4">Price Drop Alerts</h2>
                
                {alertsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="border border-dashed border-ink-200 rounded-xl p-10 text-center">
                    <Bell className="mx-auto h-10 w-10 text-ink-300" />
                    <h3 className="mt-2 text-sm font-semibold text-ink-900">No price alerts configured</h3>
                    <p className="mt-1 text-xs text-ink-400">Track price drops on your favorite electronics to buy at the best rate.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-ink-100 text-xs font-semibold text-ink-400">
                          <th className="py-2.5">Product</th>
                          <th className="py-2.5">Target Price</th>
                          <th className="py-2.5 text-center">Status</th>
                          <th className="py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-50">
                        {alerts.map((alert) => (
                          <tr key={alert._id} className="text-sm">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-ink-50 border p-1">
                                  <img src={alert.product?.image} alt={alert.product?.name} className="h-full w-full object-cover" />
                                </div>
                                <div>
                                  <Link to={`/product/${alert.product?._id}`} className="font-semibold text-ink-900 hover:text-accent-600">
                                    {alert.product?.name}
                                  </Link>
                                  <span className="block text-[10px] text-ink-400 capitalize">{alert.product?.brand}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 font-semibold text-accent-700">
                              {formatINR(alert.targetPrice)}
                            </td>
                            <td className="py-3 text-center">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                alert.isActive 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                  : 'bg-green-50 text-green-700 border border-green-100'
                              }`}>
                                {alert.isActive ? 'Active' : 'Triggered'}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => deleteAlertMutation.mutate(alert._id)}
                                className="rounded-lg p-1.5 text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SAVED COMPARISONS TAB */}
            {activeTab === 'comparisons' && (
              <div className="card bg-white p-6">
                <h2 className="text-lg font-bold text-ink-900 mb-4">Saved Comparisons</h2>
                
                {comparisonsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
                  </div>
                ) : comparisons.length === 0 ? (
                  <div className="border border-dashed border-ink-200 rounded-xl p-10 text-center">
                    <Columns className="mx-auto h-10 w-10 text-ink-300" />
                    <h3 className="mt-2 text-sm font-semibold text-ink-900">No comparisons saved</h3>
                    <p className="mt-1 text-xs text-ink-400">Save side-by-side spec sheets to view and review them later.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comparisons.map((comp) => {
                      const prodIds = comp.products.map((p) => p._id).join(',');
                      return (
                        <div key={comp._id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-ink-100 rounded-xl p-4 gap-3 hover:border-accent-200 transition-colors">
                          <div>
                            <h4 className="font-bold text-ink-900">{comp.name}</h4>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-500 flex-wrap">
                              {comp.products.map((p, idx) => (
                                <span key={p._id}>
                                  {p.name}
                                  {idx < comp.products.length - 1 && <span className="mx-1 text-ink-300">vs</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              onClick={() => deleteComparisonMutation.mutate(comp._id)}
                              className="rounded-lg p-2 text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <Link
                              to={`/compare?products=${prodIds}`}
                              className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1"
                            >
                              Launch Compare <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'settings' && (
              <div className="card bg-white p-6">
                <h2 className="text-lg font-bold text-ink-900 mb-4">Notification Preferences</h2>
                <form onSubmit={handleSavePreferences} className="space-y-4">
                  <div className="border-b border-ink-50 pb-4 mb-4">
                    <h3 className="text-sm font-semibold text-ink-800">Account Details</h3>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block text-ink-400">Name</span>
                        <span className="font-bold text-ink-900 text-sm mt-0.5 block">{user?.name}</span>
                      </div>
                      <div>
                        <span className="block text-ink-400">Email Address</span>
                        <span className="font-bold text-ink-900 text-sm mt-0.5 block">{user?.email}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-ink-800">Alert Options</h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefEmail}
                        onChange={(e) => setPrefEmail(e.target.checked)}
                        className="rounded border-ink-200 text-accent-600 mt-1"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-ink-900">Email price drops</span>
                        <span className="block text-xs text-ink-400">Send me instant emails as soon as tracked products fall below their target.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefInApp}
                        onChange={(e) => setPrefInApp(e.target.checked)}
                        className="rounded border-ink-200 text-accent-600 mt-1"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-ink-900">In-app notifications</span>
                        <span className="block text-xs text-ink-400">Show notification alerts in my dashboard notifications feed.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefAlerts}
                        onChange={(e) => setPrefAlerts(e.target.checked)}
                        className="rounded border-ink-200 text-accent-600 mt-1"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-ink-900">Smart deal digests</span>
                        <span className="block text-xs text-ink-400">Include my wishlist in the daily deal drop recommendations.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefDigest}
                        onChange={(e) => setPrefDigest(e.target.checked)}
                        className="rounded border-ink-200 text-accent-600 mt-1"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-ink-900">Weekly platform newsletter</span>
                        <span className="block text-xs text-ink-400">Subscribe to our weekly analysis of the best tech price drops in India.</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button type="submit" className="btn-primary px-5 py-2 text-xs">
                      Save Settings
                    </button>
                    {saveStatus === 'saving' && <span className="text-xs text-ink-400">Saving...</span>}
                    {saveStatus === 'success' && <span className="text-xs text-green-600 font-semibold">✓ Preferences updated successfully!</span>}
                    {saveStatus === 'error' && <span className="text-xs text-red-600 font-semibold">❌ Failed to update preferences</span>}
                  </div>
                </form>
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  );
}
