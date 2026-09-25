import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Radio, ShieldAlert, RotateCw, Settings, Play, Database, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [syncMessage, setSyncMessage] = useState('');

  // 1. Fetch Overview stats
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/overview');
      return res.data.data;
    },
  });

  // 2. Fetch Retailers
  const { data: retailers = [], isLoading: retailersLoading } = useQuery({
    queryKey: ['admin-retailers'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/retailers');
      return res.data.data;
    },
  });

  // 3. Fetch Data Quality report
  const { data: qualityReport = {}, isLoading: qualityLoading } = useQuery({
    queryKey: ['admin-data-quality'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/data-quality');
      return res.data.data;
    },
  });

  // 4. Fetch Sync Jobs & Errors logs
  const { data: jobsData = {}, isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/jobs');
      return res.data.data;
    },
    refetchInterval: activeSubTab === 'jobs' ? 5000 : false, // Poll every 5s if on jobs tab
  });

  // 5. Toggle Retailer Activation state mutation
  const toggleRetailerMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      await apiClient.patch(`/admin/retailers/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-retailers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });

  // 6. Manual Sync trigger mutation
  const triggerSyncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/admin/sync');
      return res.data.message;
    },
    onSuccess: (msg) => {
      setSyncMessage(msg);
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      setTimeout(() => setSyncMessage(''), 5000);
    },
  });

  const handleToggleRetailer = (id, currentStatus) => {
    toggleRetailerMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleTriggerSync = () => {
    triggerSyncMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-ink-50">
      
      {/* Header bar */}
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-ink-900">TREND-TECH Admin Console</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-xs font-semibold text-ink-600 hover:text-ink-900">
              User Dashboard
            </Link>
            <Link to="/" className="text-xs font-semibold text-ink-600 hover:text-ink-900">
              Go to platform
            </Link>
          </div>
        </div>
      </header>

      {/* Layout */}
      <main className="mx-auto mt-8 max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row">
          
          {/* Admin Sidebar */}
          <aside className="w-full md:w-60 flex-shrink-0">
            <div className="card bg-white p-4 space-y-1">
              
              <button
                onClick={() => setActiveSubTab('overview')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeSubTab === 'overview' ? 'bg-accent-50 text-accent-700' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </button>

              <button
                onClick={() => setActiveSubTab('retailers')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeSubTab === 'retailers' ? 'bg-accent-50 text-accent-700' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                <Radio className="h-4 w-4" />
                Manage Retailers
              </button>

              <button
                onClick={() => setActiveSubTab('data-quality')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeSubTab === 'data-quality' ? 'bg-accent-50 text-accent-700' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                Data Quality
              </button>

              <button
                onClick={() => setActiveSubTab('jobs')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeSubTab === 'jobs' ? 'bg-accent-50 text-accent-700' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                <RotateCw className="h-4 w-4" />
                Job Monitoring
              </button>

            </div>
          </aside>

          {/* Sub-tab content display */}
          <section className="flex-grow">
            
            {/* OVERVIEW PANEL */}
            {activeSubTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  
                  <div className="card bg-white p-4">
                    <span className="block text-xs font-semibold text-ink-400">Total Products</span>
                    <span className="mt-2 text-2xl font-black text-ink-900">{stats.totalProducts ?? 0}</span>
                  </div>

                  <div className="card bg-white p-4">
                    <span className="block text-xs font-semibold text-ink-400">Active Retailers</span>
                    <span className="mt-2 text-2xl font-black text-ink-900">{stats.totalRetailers ?? 0}</span>
                  </div>

                  <div className="card bg-white p-4">
                    <span className="block text-xs font-semibold text-ink-400">Offers Tracked</span>
                    <span className="mt-2 text-2xl font-black text-ink-900">{stats.totalOffers ?? 0}</span>
                  </div>

                  <div className="card bg-white p-4">
                    <span className="block text-xs font-semibold text-ink-400">Active Alerts</span>
                    <span className="mt-2 text-2xl font-black text-ink-900">{stats.priceAlerts ?? 0}</span>
                  </div>

                </div>

                <div className="card bg-white p-6">
                  <h3 className="text-base font-bold text-ink-900">Synchronize Price Feeds</h3>
                  <p className="mt-1 text-xs text-ink-500">
                    Trigger background synchronization scraping jobs manually to pull fresh listings, run product matching, update histories, and trigger email alerts.
                  </p>
                  
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={handleTriggerSync}
                      disabled={triggerSyncMutation.isPending}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" /> Trigger Price Sync
                    </button>
                    {triggerSyncMutation.isPending && <span className="text-xs text-ink-400">Queuing worker...</span>}
                    {syncMessage && <span className="text-xs text-green-600 font-semibold">{syncMessage}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* RETAILERS PANEL */}
            {activeSubTab === 'retailers' && (
              <div className="card bg-white p-6">
                <h2 className="text-lg font-bold text-ink-900 mb-4">Ingestion Feeds / Marketplaces</h2>

                {retailersLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {retailers.map((ret) => (
                      <div key={ret._id} className="flex items-center justify-between border border-ink-100 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-16 bg-ink-50 rounded border flex items-center justify-center p-1">
                            <img src={ret.logoUrl} alt={ret.name} className="h-full w-auto object-contain" />
                          </div>
                          <div>
                            <h4 className="font-bold text-ink-900 text-sm">{ret.name}</h4>
                            <span className="text-[10px] text-ink-400 block mt-0.5">{ret.baseUrl}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            ret.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {ret.isActive ? 'Active' : 'Disabled'}
                          </span>
                          <button
                            onClick={() => handleToggleRetailer(ret._id, ret.isActive)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold border shadow-sm transition-colors ${
                              ret.isActive
                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'
                            }`}
                          >
                            {ret.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DATA QUALITY PANEL */}
            {activeSubTab === 'data-quality' && (
              <div className="card bg-white p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-ink-900">Data Integrity Checks</h2>
                  <p className="text-xs text-ink-400">Scans the products catalog and price listings for missing data or alignment errors.</p>
                </div>

                {qualityLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
                  </div>
                ) : (
                  <div className="divide-y divide-ink-50 text-xs">
                    
                    <div className="py-4 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-ink-900 block text-sm">Unmatched Catalog Products</span>
                        <span className="text-ink-400 block mt-0.5">Products that currently have 0 active merchant price listings.</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        qualityReport.unmatchedCount === 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {qualityReport.unmatchedCount ?? 0} warnings
                      </span>
                    </div>

                    <div className="py-4 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-ink-900 block text-sm">Duplicate Products</span>
                        <span className="text-ink-400 block mt-0.5">Identical model/brand tags found in the database.</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        qualityReport.duplicatesCount === 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {qualityReport.duplicatesCount ?? 0} errors
                      </span>
                    </div>

                    <div className="py-4 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-ink-900 block text-sm">Missing Image Assets</span>
                        <span className="text-ink-400 block mt-0.5">Products without photo cover urls.</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        qualityReport.missingImagesCount === 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {qualityReport.missingImagesCount ?? 0} warnings
                      </span>
                    </div>

                    <div className="py-4 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-ink-900 block text-sm">Missing Spec Sheets</span>
                        <span className="text-ink-400 block mt-0.5">Products without technical spec attributes.</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        qualityReport.missingSpecsCount === 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {qualityReport.missingSpecsCount ?? 0} warnings
                      </span>
                    </div>

                    <div className="py-4 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-ink-900 block text-sm">Stale Price Listings</span>
                        <span className="text-ink-400 block mt-0.5">Offers that have not been successfully synchronized in over 24 hours.</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        qualityReport.stalePricesCount === 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {qualityReport.stalePricesCount ?? 0} items
                      </span>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* JOBS MONITOR TAB */}
            {activeTab === 'overview' ? null : activeSubTab === 'jobs' && (
              <div className="card bg-white p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-ink-900">Synchronization History</h2>
                  <p className="text-xs text-ink-400">Review status logs of recent worker execution triggers.</p>
                </div>

                {jobsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobsData.jobs?.length === 0 ? (
                      <p className="text-xs text-ink-400">No jobs have run yet.</p>
                    ) : (
                      <div className="overflow-x-auto text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-ink-100 font-semibold text-ink-400">
                              <th className="py-2">Start Time</th>
                              <th className="py-2">Status</th>
                              <th className="py-2 text-center">Updated Offers</th>
                              <th className="py-2 text-center">Failed Offers</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-ink-50">
                            {jobsData.jobs?.map((job) => (
                              <tr key={job._id}>
                                <td className="py-2.5 font-medium text-ink-800">
                                  {new Date(job.startTime).toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                    job.status === 'completed'
                                      ? 'bg-green-50 text-green-700'
                                      : job.status === 'failed'
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-yellow-50 text-yellow-700 animate-pulse'
                                  }`}>
                                    {job.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                                    {job.status === 'failed' && <XCircle className="h-3 w-3" />}
                                    {job.status}
                                  </span>
                                </td>
                                <td className="py-2.5 text-center font-semibold text-ink-700">
                                  {job.offersUpdated}
                                </td>
                                <td className="py-2.5 text-center font-semibold text-ink-700">
                                  {job.failedCount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {jobsData.errors?.length > 0 && (
                      <div className="pt-6 border-t border-ink-50">
                        <h3 className="text-sm font-bold text-ink-950 mb-3 flex items-center gap-1">
                          <ShieldAlert className="h-4 w-4 text-red-500" /> Recent Synchronization Failures
                        </h3>
                        <div className="rounded-xl border bg-red-50/10 p-3 max-h-60 overflow-y-auto space-y-2 text-[11px] font-mono leading-relaxed">
                          {jobsData.errors.map((err) => (
                            <div key={err._id} className="text-red-800 border-b border-red-100/50 pb-2 last:border-0 last:pb-0">
                              <span className="font-semibold">[{err.marketplace}]</span>: SKU {err.sku} - {err.error}
                              <span className="block text-[9px] text-ink-400 mt-0.5">{new Date(err.timestamp).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  );
}
