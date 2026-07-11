import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchAnalyticsSummary } from '../utils/analyticsService';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#6366f1'];

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [summary, setSummary] = useState({
    totalEvents: 0,
    activeUsers: 0,
    successLogins: 0,
    failedLogins: 0,
    uploadsCount: 0,
    peakHour: { hour: '00:00', logins: 0 },
  });
  const [hourlyLoad, setHourlyLoad] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [actionBreakdown, setActionBreakdown] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadAnalytics = async () => {
      const data = await fetchAnalyticsSummary();
      if (!mounted) return;
      setSummary(data.summary || {});
      setHourlyLoad(Array.isArray(data.hourlyLoad) ? data.hourlyLoad : []);
      setDailyActivity(Array.isArray(data.dailyActivity) ? data.dailyActivity : []);
      setActionBreakdown(Array.isArray(data.actionBreakdown) ? data.actionBreakdown : []);
    };
    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, []);

  const successLogins = summary.successLogins || 0;
  const failedLogins = summary.failedLogins || 0;
  const uploadsCount = summary.uploadsCount || 0;
  const activeUsers = summary.activeUsers || 0;
  const peakHour = summary.peakHour || { hour: '00:00', logins: 0 };

  const stats = [
    {
      label: 'Active Sessions',
      value: String(activeUsers),
      change: 'Live now',
      icon: '🟢',
      color: 'blue',
    },
    {
      label: 'Successful Logins',
      value: String(successLogins),
      change: 'Audit trail',
      icon: '🔐',
      color: 'green',
    },
    {
      label: 'Failed Logins',
      value: String(failedLogins),
      change: 'Security signal',
      icon: '⚠️',
      color: 'orange',
    },
    {
      label: 'Peak Hour',
      value: peakHour.hour,
      change: `${peakHour.logins} logins`,
      icon: '📈',
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Live usage, traffic, and audit insights
            </p>
          </div>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    stat.color === 'blue'
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : stat.color === 'green'
                        ? 'bg-green-100 dark:bg-green-900'
                        : stat.color === 'purple'
                          ? 'bg-purple-100 dark:bg-purple-900'
                          : 'bg-orange-100 dark:bg-orange-900'
                  }`}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.change}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              System Load by Hour
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyLoad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="logins"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Logins"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Activity (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="events" fill="#10b981" name="Events" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Actions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={actionBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  nameKey="name"
                >
                  {actionBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Total Audit Events</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {summary.totalEvents || 0}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Successful Logins</span>
                <span className="font-semibold text-gray-900 dark:text-white">{successLogins}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Failed/Suspicious Attempts</span>
                <span className="font-semibold text-red-600">{failedLogins}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Upload Activities</span>
                <span className="font-semibold text-gray-900 dark:text-white">{uploadsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Active Sessions</span>
                <span className="font-semibold text-blue-600">{activeUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
