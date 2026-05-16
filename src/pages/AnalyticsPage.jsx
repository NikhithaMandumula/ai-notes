import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { fetchAnalytics } from '../services/api';
import { formatRelativeTime } from '../utils/helpers';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];

const FILTERS = [
  { id: '', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
];

function StatCard({ title, value, icon, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-5 card-glow"
    >
      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} border border-[var(--border)] flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-3xl font-bold font-geist text-[var(--text-primary)]">{value}</p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">{title}</p>
    </motion.div>
  );
}

function ChartCard({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-[var(--card-bg)] backdrop-blur-xl border border-blue-400/40 rounded-2xl p-5 card-glow"
    >
      <h3 className="text-base font-semibold font-geist text-[var(--text-primary)] mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-blue-400/30 rounded-xl px-3 py-2 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
      <p className="text-xs text-[var(--text-secondary)] mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)]">{payload[0].value}</p>
    </div>
  );
};

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('');
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchAnalytics(period);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  const layoutWrapper = (content) => (
    <div className="min-h-screen relative z-10">
      <Navbar
        searchTerm=""
        onSearchChange={() => {}}
        pendingCount={0}
        onNotificationClick={() => {}}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarOpen(true)}
      />
      <Sidebar
        noteCount={0}
        favoriteCount={0}
        pinnedCount={0}
        trashCount={0}
        activeFilter=""
        onFilterChange={() => {}}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        receivedShareCount={0}
        sentShareCount={0}
      />
      <div className={`min-h-screen transition-all duration-300 pt-16 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        {content}
      </div>
    </div>
  );

  if (loading) {
    return layoutWrapper(
      <div className="flex items-center justify-center h-[60vh]">
        <div className="inline-flex items-center gap-2.5">
          <div className="h-5 w-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return layoutWrapper(
      <div className="flex items-center justify-center h-[60vh]">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl py-3 px-5 text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return layoutWrapper(
    <div className="px-4 lg:px-6 py-6">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold font-geist text-[var(--text-primary)]">Analytics</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Track your productivity and note-taking habits</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 bg-[var(--surface-hover)] rounded-xl p-1"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setPeriod(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                period === f.id
                  ? 'bg-blue-400/20 text-blue-300 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Notes"
          value={data.totalNotes}
          delay={0}
          gradient="from-blue-500/20 to-blue-600/10"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          title="This Week"
          value={data.notesThisWeek}
          delay={0.05}
          gradient="from-cyan-500/20 to-teal-500/10"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <StatCard
          title="Favorites"
          value={data.totalFavorites}
          delay={0.1}
          gradient="from-yellow-500/20 to-amber-500/10"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24" stroke="none"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
        />
        <StatCard
          title="Total Words"
          value={data.wordStats.totalWords.toLocaleString()}
          delay={0.15}
          gradient="from-purple-500/20 to-violet-500/10"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Notes Over Time */}
        <ChartCard title="Notes Created Over Time" delay={0.2}>
          <div className="h-[250px]">
            {data.notesOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.notesOverTime}>
                  <defs>
                    <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorNotes)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--text-muted)]">No data for this period</div>
            )}
          </div>
        </ChartCard>

        {/* Category Distribution */}
        <ChartCard title="Category Distribution" delay={0.25}>
          <div className="h-[250px]">
            {data.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {data.categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--text-muted)]">No categories yet</div>
            )}
          </div>
          {data.categoryDistribution.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {data.categoryDistribution.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {cat.name} ({cat.count})
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Daily Activity */}
        <ChartCard title="Daily Activity" delay={0.3}>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.dailyActivity.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Word Count Stats */}
        <ChartCard title="Word Count Analytics" delay={0.35}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-xl">
              <span className="text-sm text-[var(--text-secondary)]">Total Words</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">{data.wordStats.totalWords.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-xl">
              <span className="text-sm text-[var(--text-secondary)]">Avg per Note</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">{data.wordStats.avgWords}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-xl">
              <span className="text-sm text-[var(--text-secondary)]">Longest Note</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">{data.wordStats.maxWords} words</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-xl">
              <span className="text-sm text-[var(--text-secondary)]">Categories</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">{data.categoryDistribution.length}</span>
            </div>
          </div>
        </ChartCard>

        {/* Top Tags */}
        <ChartCard title="Top Tags" delay={0.4}>
          <div className="flex flex-col gap-2">
            {data.tagUsage.length > 0 ? (
              data.tagUsage.map((t, i) => (
                <div key={t.tag} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-300 min-w-[80px] truncate">#{t.tag}</span>
                  <div className="flex-1 h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(t.count / data.tagUsage[0].count) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.4 + i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] w-6 text-right">{t.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-6">No tags used yet</p>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Recently Active Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-5 card-glow"
      >
        <h3 className="text-base font-semibold font-geist text-[var(--text-primary)] mb-4">Recently Active Notes</h3>
        <div className="flex flex-col gap-2">
          {data.recentNotes.length > 0 ? (
            data.recentNotes.map((note, i) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-[var(--border)] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{note.title}</p>
                  {note.folder && (
                    <p className="text-xs text-[var(--text-secondary)]">{note.folder}</p>
                  )}
                </div>
                <span className="text-xs text-[var(--text-secondary)] shrink-0">
                  {formatRelativeTime(note.updatedAt)}
                </span>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-6">No recent activity</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default AnalyticsPage;

