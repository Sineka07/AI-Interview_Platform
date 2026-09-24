import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewApi } from '../api/interviewApi';
import {
  Trophy,
  Target,
  FileText,
  PlayCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Upload,
  Cpu,
  Eye,
  Camera,
  Mic,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function Dashboard() {
  const { user, updateProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeInput, setResumeInput] = useState(user?.resumeText || '');
  const [savingResume, setSavingResume] = useState(false);
  const [resumeSuccessMsg, setResumeSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await interviewApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleSaveResume = async () => {
    if (!resumeInput.trim()) return;
    setSavingResume(true);
    setResumeSuccessMsg('');
    try {
      await updateProfile({ resumeText: resumeInput.trim() });
      setResumeSuccessMsg('Resume text parsed and saved successfully!');
      setTimeout(() => setResumeSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save resume:', err);
    } finally {
      setSavingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading placement dashboard...</p>
        </div>
      </div>
    );
  }

  // Chart data (only when user has completed interviews)
  const chartData = stats?.recentInterviews?.length
    ? stats.recentInterviews
        .slice()
        .reverse()
        .map((item, idx) => ({
          name: `Mock #${idx + 1}`,
          score: Math.round(item.overallScore || 0),
        }))
    : [];

  const getReadinessBadge = (status) => {
    if (status === 'Ready for Placements') {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        icon: CheckCircle2,
        label: 'Ready for Placements',
      };
    }
    if (status === 'Needs Minor Polish') {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        icon: TrendingUp,
        label: 'Needs Minor Polish',
      };
    }
    return {
      bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      icon: Target,
      label: status || 'Ready to Practice',
    };
  };

  const badge = getReadinessBadge(stats?.placementReadinessStatus);
  const BadgeIcon = badge.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome, {user?.fullName || 'Candidate'}!
              </h1>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                <BadgeIcon className="w-3.5 h-3.5" />
                <span>{badge.label}</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Targeting <span className="text-white font-semibold">{user?.targetRole || 'Software Engineer'}</span>.
              Practice placement interviews with live AI voice questioning, webcam eye-contact tracking, and instant answer evaluations.
            </p>
          </div>

          <Link
            to="/new-interview"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Launch Mock Interview</span>
          </Link>
        </div>
      </div>

      {/* Quick Launch CTA Banner */}
      <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Ready for your interview round?</div>
            <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-emerald-400" /> Webcam Vision Active</span>
              <span className="flex items-center gap-1"><Mic className="w-3.5 h-3.5 text-emerald-400" /> Voice AI Interviewer</span>
            </div>
          </div>
        </div>
        <Link
          to="/new-interview"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
        >
          Start Now →
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Interviews */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Mock Sessions</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {stats?.completedInterviews ?? 0}
            <span className="text-xs font-normal text-slate-500 ml-2">completed</span>
          </div>
        </div>

        {/* Avg Overall Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Average Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {stats?.completedInterviews > 0 && stats?.averageOverallScore != null
              ? `${Math.round(stats.averageOverallScore)}`
              : '—'}
            <span className="text-xs font-normal text-slate-500 ml-1">/100</span>
          </div>
        </div>

        {/* Technical Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Technical Accuracy</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {stats?.completedInterviews > 0 && stats?.averageTechnicalScore != null
              ? `${Math.round(stats.averageTechnicalScore)}%`
              : '—'}
          </div>
        </div>

        {/* Confidence & Eye Contact */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Eye Contact & Posture</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {stats?.completedInterviews > 0 && stats?.averageConfidenceScore != null
              ? `${Math.round(stats.averageConfidenceScore)}%`
              : '—'}
          </div>
        </div>
      </div>

      {/* 2-Column: Performance Chart & Resume Profiler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Progress Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Performance Score Trajectory</h2>
              <p className="text-xs text-slate-400">Score progression across your mock interview sessions</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
              Recent Sessions
            </span>
          </div>

          {chartData.length > 0 ? (
            <div className="w-full pt-4 min-h-[240px]">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <Clock className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No mock sessions completed yet</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Your performance score progression and placement readiness trajectory will appear here after your first interview.
              </p>
              <Link
                to="/new-interview"
                className="mt-3 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                Start First Mock Interview
              </Link>
            </div>
          )}
        </div>

        {/* Resume & Profile Knowledge Base */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Resume & Skills Engine</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Paste your resume or project highlights. The AI extracts your key skills to generate personalized interview questions.
            </p>

            {resumeSuccessMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{resumeSuccessMsg}</span>
              </div>
            )}

            <textarea
              value={resumeInput}
              onChange={(e) => setResumeInput(e.target.value)}
              placeholder="Paste your skills or resume summary here (e.g. Java, Spring Boot, React, MySQL, Data Structures, projects...)"
              rows={6}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed resize-none"
            />
          </div>

          <button
            onClick={handleSaveResume}
            disabled={savingResume || !resumeInput.trim()}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
          >
            {savingResume ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Save & Parse Skills</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Interviews Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Recent Interview Sessions</h2>
            <p className="text-xs text-slate-400">Review your past scores and detailed post-interview reports</p>
          </div>
          <Link
            to="/new-interview"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Start Another</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentInterviews?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Interview Title</th>
                  <th className="pb-3 font-semibold">Target Role</th>
                  <th className="pb-3 font-semibold">Difficulty</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.recentInterviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-medium text-slate-200">{item.title}</td>
                    <td className="py-3.5 text-slate-400">{item.roleTarget || 'Software Engineer'}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        item.difficulty === 'HARD'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : item.difficulty === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {item.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-white">
                      {item.overallScore ? `${Math.round(item.overallScore)}/100` : 'In Progress'}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {item.status === 'COMPLETED' ? (
                        <Link
                          to={`/feedback/${item.id}`}
                          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          <span>View Report</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          to={`/interview/${item.id}`}
                          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                        >
                          <span>Resume</span>
                          <PlayCircle className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
            <Trophy className="w-10 h-10 text-indigo-400/50 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No mock interviews yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Practice placement questions under live camera & voice evaluation to build confidence and eliminate interview nervousness.
            </p>
            <Link
              to="/new-interview"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch First Mock Interview</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
