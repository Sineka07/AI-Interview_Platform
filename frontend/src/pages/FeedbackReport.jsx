import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewApi } from '../api/interviewApi';
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Eye,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Printer,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  ThumbsUp,
  Target,
  FileText,
  Volume2,
  Video,
  Check,
  XCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function FeedbackReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await interviewApi.getReport(id);
        setReport(data);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Synthesizing placement evaluation report & multi-signal analytics...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Interview Report Not Found</h2>
        <p className="text-sm text-slate-400">The requested report could not be found or has not been completed yet.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Radar chart data for 5 competency dimensions
  const radarData = [
    { subject: 'Technical', value: report.technicalScore || 75 },
    { subject: 'Eye Contact', value: report.avgEyeContact || 80 },
    { subject: 'Fluency', value: report.communicationScore || 78 },
    { subject: 'Posture', value: report.avgPostureScore || 85 },
    { subject: 'Confidence', value: report.confidenceScore || 82 },
  ];

  // Question trajectory bar chart data
  const questionTrajectory = report.questions?.map((q, idx) => ({
    name: `Q${idx + 1}`,
    score: Math.round(q.score || 0),
    eyeContact: Math.round(q.eyeContactPercentage || 0),
  })) || [];

  const getVerdict = (readiness) => {
    if (readiness === 'READY_FOR_PLACEMENTS') {
      return {
        label: 'Placement Ready',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        desc: 'Exceptional performance. Strong technical clarity, eye contact, and structured delivery.',
      };
    }
    if (readiness === 'NEEDS_MINOR_POLISH') {
      return {
        label: 'Needs Minor Polish',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        desc: 'Solid foundation. Focus on reducing filler words and speaking with concrete examples.',
      };
    }
    return {
      label: 'Needs Focused Revision',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      desc: 'Revise core fundamentals and practice speaking answers using the STAR technique.',
    };
  };

  const verdict = getVerdict(report.placementReadiness);

  const renderCorrectnessBadge = (status) => {
    if (status === 'CORRECT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
          <Check className="w-3 h-3" />
          <span>Correct Answer</span>
        </span>
      );
    }
    if (status === 'PARTIALLY_CORRECT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
          <AlertTriangle className="w-3 h-3" />
          <span>Partially Correct</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
        <XCircle className="w-3 h-3" />
        <span>Needs Improvement</span>
      </span>
    );
  };

  const renderToneBadge = (tone) => {
    if (tone === 'CALM_STEADY') {
      return <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">Calm & Steady Tone</span>;
    }
    if (tone === 'RUSHED_NERVOUS') {
      return <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">Rushed / Elevated Fillers</span>;
    }
    return <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-medium">Hesitant / Deliberate</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{report.title}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {report.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Role: <span className="text-slate-200">{report.roleTarget || 'Software Engineer'}</span> • Completed on{' '}
              {new Date(report.completedAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <Link
            to="/new-interview"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Practice Another Session</span>
          </Link>
        </div>
      </div>

      {/* Main Placement Verdict Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${verdict.color}`}>
                {verdict.label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Placement Readiness & Competency Assessment
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {report.feedbackSummary || verdict.desc}
            </p>
          </div>

          {/* Big Score Gauge */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl flex-shrink-0">
            <div className="text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Overall Score
              </div>
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                {Math.round(report.overallScore || 0)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">out of 100 points</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Technical Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Technical Accuracy</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{Math.round(report.technicalScore || 0)}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${report.technicalScore || 0}%` }}
            />
          </div>
        </div>

        {/* Eye Contact */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Camera Eye Contact</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{Math.round(report.avgEyeContact || 0)}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${report.avgEyeContact || 0}%` }}
            />
          </div>
        </div>

        {/* Filler Words */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Filler Words</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{report.totalFillerWords || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {report.totalFillerWords <= 4 ? 'Minimal hesitation' : 'Aim to reduce with pauses'}
          </p>
        </div>

        {/* Speech Pace */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Speech Rate (WPM)</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{report.avgWpm || 130} WPM</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ideal range: 120 - 150 WPM
          </p>
        </div>
      </div>

      {/* Voice & Camera Presence Evaluation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speaking Confidence & Voice Quality */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Volume2 className="w-4 h-4" />
            <span>Speaking Confidence & Voice Quality</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {report.voiceFeedback || 'Voice delivery maintained a measured and intelligible pace suitable for professional interviews.'}
          </p>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Pacing</span>
              <span className="text-xs font-bold text-white">{report.avgWpm || 130} WPM</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Fillers</span>
              <span className="text-xs font-bold text-amber-400">{report.totalFillerWords || 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Clarity</span>
              <span className="text-xs font-bold text-emerald-400">{Math.round(report.communicationScore || 80)}%</span>
            </div>
          </div>
        </div>

        {/* Camera Presence & Non-Verbal Posture */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Video className="w-4 h-4" />
            <span>Camera Presence & Non-Verbal Posture</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {report.cameraFeedback || 'Eye contact remained focused towards the camera lens, signaling high engagement and confidence.'}
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Eye Contact</span>
              <span className="text-xs font-bold text-emerald-400">{Math.round(report.avgEyeContact || 85)}%</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Head Posture Stability</span>
              <span className="text-xs font-bold text-indigo-400">{Math.round(report.avgPostureScore || 88)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts: Radar & Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Competency Chart */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Competency Radar</h3>
            <p className="text-xs text-slate-400">Balance across technical, speech, and non-verbal posture</p>
          </div>
          <div className="w-full pt-4 min-h-[240px]">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#475569" fontSize={10} />
                <Radar name="Candidate" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Question-wise Scores Trajectory */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Question Score Trajectory</h3>
            <p className="text-xs text-slate-400">Performance and eye contact per question</p>
          </div>
          <div className="w-full pt-4 min-h-[240px]">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={questionTrajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} name="Score" />
                <Bar dataKey="eyeContact" fill="#10b981" radius={[4, 4, 0, 0]} name="Eye Contact %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resume Improvement Suggestions Card */}
      {report.resumeFeedback && (
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-900 p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
            <FileText className="w-5 h-5" />
            <span>Placement Resume Improvement Suggestions</span>
          </div>
          <p className="text-xs text-slate-400">
            Actionable advice generated from your uploaded resume to maximize shortlist rates and ATS scores.
          </p>
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
            {report.resumeFeedback}
          </div>
        </div>
      )}

      {/* Strengths & Actionable Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ThumbsUp className="w-4 h-4" />
            <span>Demonstrated Strengths</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {report.strengths || '• Strong conceptual clarity\n• Structured presentation of answers'}
          </div>
        </div>

        {/* Improvements */}
        <div className="rounded-3xl border border-amber-500/20 bg-amber-950/20 p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Target className="w-4 h-4" />
            <span>High-Impact Recommendations</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {report.improvements || '• Practice pausing silently instead of saying "um" or "like"\n• Give concrete project examples with measurable outcomes'}
          </div>
        </div>
      </div>

      {/* Question-by-Question Deep Dive with Ideal Model Answers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Question-by-Question Evaluation & Ideal Answers</span>
          </h3>
          <span className="text-xs text-slate-400">Click to expand student answer & recommended solution</span>
        </div>

        <div className="space-y-3">
          {report.questions?.map((q, idx) => {
            const isExpanded = expandedQuestion === idx;
            return (
              <div
                key={q.questionId || idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg transition-all"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-white leading-snug">
                        {q.questionText}
                      </div>
                      <div className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
                        {renderCorrectnessBadge(q.correctnessStatus || (q.score >= 75 ? 'CORRECT' : q.score >= 50 ? 'PARTIALLY_CORRECT' : 'INCORRECT'))}
                        <span>•</span>
                        {renderToneBadge(q.voiceTone || 'CALM_STEADY')}
                        <span>•</span>
                        <span>Eye Contact: {Math.round(q.eyeContactPercentage || 0)}%</span>
                        <span>•</span>
                        <span>Fillers: {q.fillerCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="text-base font-bold text-emerald-400">
                      {Math.round(q.score || 0)}/100
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800/80 space-y-4 bg-slate-950/60 text-xs">
                    {/* Student Transcript */}
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Your Spoken Answer Transcript:</span>
                      </span>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed font-mono text-[11px]">
                        {q.studentAnswer || '(No audible answer transcribed)'}
                      </div>
                    </div>

                    {/* Mistakes & Deficiencies Identified ("தவறுகள் & குறைகள்") */}
                    {q.improvements && (
                      <div>
                        <span className="font-bold text-rose-400 block mb-1.5 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>❌ Mistakes & Deficiencies Identified ("தவறுகள் & குறைகள்"):</span>
                        </span>
                        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 leading-relaxed whitespace-pre-line">
                          {q.improvements}
                        </div>
                      </div>
                    )}

                    {/* Demonstrated Strengths & Technical Hits */}
                    {q.strengths && (
                      <div>
                        <span className="font-bold text-emerald-400 block mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>✅ Demonstrated Strengths & Accurate Points:</span>
                        </span>
                        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 leading-relaxed whitespace-pre-line">
                          {q.strengths}
                        </div>
                      </div>
                    )}

                    {/* AI Placement Feedback & Assessment */}
                    {q.critique && (
                      <div>
                        <span className="font-semibold text-indigo-300 block mb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>AI Recruiter Assessment & Feedback:</span>
                        </span>
                        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 leading-relaxed">
                          {q.critique}
                        </div>
                      </div>
                    )}

                    {/* Ideal Model Answer (Placement Standard) */}
                    <div>
                      <span className="font-semibold text-amber-300 block mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ideal Model Answer (Placement Standard Benchmark):</span>
                      </span>
                      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-100 leading-relaxed font-normal">
                        {q.idealAnswer || 'A standout response covers fundamental definitions, architectural mechanisms, project examples, and complexity trade-offs.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
