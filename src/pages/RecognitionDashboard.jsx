import React, { useEffect, useState } from 'react';
import { Activity, Camera, Clock3, ScanFace, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchRecognitionEvents } from '../utils/analyticsService';

const CONFIDENCE_COLORS = ['#1d4ed8', '#0f766e', '#f59e0b'];

const formatTime = value => {
  try {
    return new Date(value.replace(' ', 'T')).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return value;
  }
};

const formatDateTime = value => {
  try {
    return new Date(value.replace(' ', 'T')).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return value;
  }
};

const formatConfidence = value => `${(Number(value || 0) * 100).toFixed(1)}%`;

const RecognitionDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let intervalId;

    const loadRecognitionEvents = async isInitialLoad => {
      try {
        const data = await fetchRecognitionEvents();
        if (!mounted) return;
        setEvents(Array.isArray(data) ? data : []);
      } finally {
        if (mounted && isInitialLoad) setLoading(false);
      }
    };

    loadRecognitionEvents(true);
    intervalId = window.setInterval(() => {
      loadRecognitionEvents(false);
    }, 10000);

    return () => {
      mounted = false;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  const latestEvent = events[events.length - 1] || null;
  const totalDetections = events.length;
  const uniquePeople = new Set(events.map(event => event.name)).size;
  const averageConfidence =
    totalDetections > 0
      ? events.reduce((sum, event) => sum + Number(event.confidence || 0), 0) / totalDetections
      : 0;
  const strongestDetection = events.reduce(
    (best, current) => (Number(current.confidence) > Number(best.confidence) ? current : best),
    events[0] || { confidence: 0 }
  );

  const bboxStats = events.reduce(
    (acc, event) => {
      const [x1, y1, x2, y2] = event.bbox || [0, 0, 0, 0];
      const width = Math.max(0, x2 - x1);
      const height = Math.max(0, y2 - y1);
      return {
        averageWidth: acc.averageWidth + width,
        averageHeight: acc.averageHeight + height,
        maxX: Math.max(acc.maxX, x2),
        maxY: Math.max(acc.maxY, y2),
      };
    },
    { averageWidth: 0, averageHeight: 0, maxX: 640, maxY: 360 }
  );

  const averageBoxWidth =
    totalDetections > 0 ? Math.round(bboxStats.averageWidth / totalDetections) : 0;
  const averageBoxHeight =
    totalDetections > 0 ? Math.round(bboxStats.averageHeight / totalDetections) : 0;

  const timelineData = Object.values(
    events.reduce((acc, event) => {
      const label = formatTime(event.timestamp);
      if (!acc[label]) {
        acc[label] = { time: label, detections: 0, averageConfidence: 0, totalConfidence: 0 };
      }
      acc[label].detections += 1;
      acc[label].totalConfidence += Number(event.confidence || 0);
      acc[label].averageConfidence = Number(
        (acc[label].totalConfidence / acc[label].detections).toFixed(3)
      );
      return acc;
    }, {})
  );

  const peopleData = Object.values(
    events.reduce((acc, event) => {
      if (!acc[event.name]) {
        acc[event.name] = { name: event.name, detections: 0, maxConfidence: 0 };
      }
      acc[event.name].detections += 1;
      acc[event.name].maxConfidence = Math.max(
        acc[event.name].maxConfidence,
        Number(event.confidence || 0)
      );
      return acc;
    }, {})
  );

  const confidenceData = [
    {
      name: 'Under 55%',
      value: events.filter(event => Number(event.confidence) < 0.55).length,
    },
    {
      name: '55% to 60%',
      value: events.filter(
        event => Number(event.confidence) >= 0.55 && Number(event.confidence) < 0.6
      ).length,
    },
    {
      name: 'Above 60%',
      value: events.filter(event => Number(event.confidence) >= 0.6).length,
    },
  ];

  const frameWidth = Math.max(640, bboxStats.maxX + 40);
  const frameHeight = Math.max(360, bboxStats.maxY + 40);
  const latestBox = latestEvent?.bbox || [0, 0, 0, 0];
  const boxLeft = `${(latestBox[0] / frameWidth) * 100}%`;
  const boxTop = `${(latestBox[1] / frameHeight) * 100}%`;
  const boxWidth = `${((latestBox[2] - latestBox[0]) / frameWidth) * 100}%`;
  const boxHeight = `${((latestBox[3] - latestBox[1]) / frameHeight) * 100}%`;

  const stats = [
    {
      label: 'Total Detections',
      value: totalDetections,
      meta: 'Frames received',
      icon: Activity,
      accent: 'from-blue-600 to-cyan-500',
    },
    {
      label: 'Recognized People',
      value: uniquePeople,
      meta: 'Unique identities',
      icon: UserRound,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Average Confidence',
      value: formatConfidence(averageConfidence),
      meta: 'Model confidence',
      icon: ShieldCheck,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Latest Update',
      value: latestEvent ? formatTime(latestEvent.received_at) : '--',
      meta: 'Last payload received',
      icon: Clock3,
      accent: 'from-fuchsia-500 to-pink-500',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-200">Loading recognition feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_42%,#e2e8f0_42%,#f8fafc_100%)] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-[28px] overflow-hidden border border-cyan-400/20 shadow-2xl shadow-slate-950/30 mb-8">
          <div className="bg-slate-950/90 px-6 py-8 md:px-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                  <Camera className="h-4 w-4" />
                  Admin Only
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
                  Recognition Command Center
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">
                  Dashboard مخصصة لعرض detections القادمة من الكاميرا بشكل مباشر وواضح للإدمن، مع
                  confidence timeline وآخر bounding box تم استقباله.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-slate-200 md:min-w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-slate-400">Current Identity</div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {latestEvent?.name || 'Unknown'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-slate-400">Peak Confidence</div>
                  <div className="mt-2 text-2xl font-semibold text-emerald-300">
                    {formatConfidence(strongestDetection.confidence)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg shadow-slate-200/60 backdrop-blur"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                    <div className="mt-3 text-3xl font-bold text-slate-900">{stat.value}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {stat.meta}
                    </div>
                  </div>
                  <div className={`rounded-2xl bg-gradient-to-br ${stat.accent} p-3 text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr] mb-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Live Confidence Timeline</h2>
                <p className="text-sm text-slate-500">Average confidence per timestamp</p>
              </div>
              <Sparkles className="h-5 w-5 text-cyan-600" />
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="confidenceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0.5, 0.7]} />
                <Tooltip formatter={value => formatConfidence(value)} />
                <Area
                  type="monotone"
                  dataKey="averageConfidence"
                  stroke="#0891b2"
                  strokeWidth={3}
                  fill="url(#confidenceFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Latest Face Box</h2>
                <p className="text-sm text-slate-500">Visualized from the last bbox payload</p>
              </div>
              <ScanFace className="h-5 w-5 text-fuchsia-600" />
            </div>
            <div className="relative h-[320px] overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#111827_48%,#164e63_100%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_34%)]"></div>
              <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:34px_34px]"></div>
              {latestEvent && (
                <div
                  className="absolute rounded-[24px] border-4 border-emerald-400 shadow-[0_0_0_9999px_rgba(2,6,23,0.18)]"
                  style={{ left: boxLeft, top: boxTop, width: boxWidth, height: boxHeight }}
                >
                  <div className="absolute -top-9 left-0 rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950">
                    {latestEvent.name} • {formatConfidence(latestEvent.confidence)}
                  </div>
                </div>
              )}
              <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                Camera Feed Simulation
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-200 backdrop-blur">
                <span>{latestEvent ? formatDateTime(latestEvent.received_at) : 'No feed'}</span>
                <span>
                  Avg box {averageBoxWidth} x {averageBoxHeight}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Identity Breakdown</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={peopleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip formatter={value => value} />
                <Bar dataKey="detections" radius={[12, 12, 0, 0]}>
                  {peopleData.map(entry => (
                    <Cell key={entry.name} fill="#0f766e" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Confidence Distribution</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={confidenceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={100}
                  paddingAngle={6}
                >
                  {confidenceData.map(entry => (
                    <Cell
                      key={entry.name}
                      fill={CONFIDENCE_COLORS[confidenceData.indexOf(entry)]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {confidenceData.map((item, index) => (
                <div key={item.name} className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
                  <div
                    className="mx-auto mb-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: CONFIDENCE_COLORS[index] }}
                  ></div>
                  <div className="text-xs text-slate-500">{item.name}</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Detection Stream</h2>
              <p className="text-sm text-slate-500">
                Same payload shape your backend can send directly
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Confidence</th>
                  <th className="px-4 py-3 font-semibold">Timestamp</th>
                  <th className="px-4 py-3 font-semibold">Received At</th>
                  <th className="px-4 py-3 font-semibold">Bounding Box</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events
                  .slice()
                  .reverse()
                  .map((event, index) => (
                    <tr key={`${event.timestamp}-${index}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{event.name}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                          {formatConfidence(event.confidence)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDateTime(event.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDateTime(event.received_at)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        [{event.bbox.join(', ')}]
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecognitionDashboard;
