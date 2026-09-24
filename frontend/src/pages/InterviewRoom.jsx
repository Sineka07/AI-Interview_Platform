import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '../api/interviewApi';
import VisionTracker from '../components/VisionTracker';
import AiInterviewerStage from '../components/AiInterviewerStage';
import SpeechRecorder from '../components/SpeechRecorder';
import {
  CheckCircle2,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Clock,
  Radio,
  Volume2,
  XSquare,
  Video,
  Mic,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [isCandidateAnswering, setIsCandidateAnswering] = useState(false);

  // Per-question recommended pacing timer
  const [elapsedQuestionSec, setElapsedQuestionSec] = useState(0);
  const [totalSessionSec, setTotalSessionSec] = useState(0);
  const questionTimerRef = useRef(null);
  const sessionTimerRef = useRef(null);

  // Real-time telemetry from VisionTracker
  const [telemetry, setTelemetry] = useState({
    eyeContact: 85,
    posture: 88,
    confidence: 86,
  });

  // Load questions from backend database
  useEffect(() => {
    const loadInterview = async () => {
      try {
        const qList = await interviewApi.getQuestions(id);
        setQuestions(qList);
      } catch (err) {
        console.error('Failed to load interview questions from database:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInterview();
  }, [id]);

  // Overall session timer
  useEffect(() => {
    sessionTimerRef.current = setInterval(() => {
      setTotalSessionSec((prev) => prev + 1);
    }, 1000);

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, []);

  // Per-question timer
  useEffect(() => {
    setElapsedQuestionSec(0);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    questionTimerRef.current = setInterval(() => {
      setElapsedQuestionSec((prev) => prev + 1);
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [currentIdx]);

  const handleTelemetryUpdate = useCallback((newMetrics) => {
    setTelemetry(newMetrics);
  }, []);

  // Spoken verbal transition
  const speakTransition = (phrase) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(phrase);
      u.rate = 1.0;
      u.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const eng =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
        ) || voices.find((v) => v.lang.startsWith('en'));
      if (eng) u.voice = eng;
      window.speechSynthesis.speak(u);
    }
  };

  /**
   * Submit answer, save to MySQL database, and advance to next question
   */
  const handleSubmitAnswer = async ({ answerText, durationSeconds, fillerCount }) => {
    if (!questions[currentIdx] || submitting || transitioning) return;
    setSubmitting(true);

    try {
      // 1. Submit answer permanently to MySQL database
      await interviewApi.submitAnswer(id, {
        questionId: questions[currentIdx].id,
        answerText,
        durationSeconds,
        fillerCount,
        eyeContactPercentage: telemetry.eyeContact,
        postureScore: telemetry.posture,
        confidenceScore: telemetry.confidence,
      });

      const hasNext = currentIdx + 1 < questions.length;

      if (hasNext) {
        setTransitioning(true);
        const nextNum = currentIdx + 2;
        setTransitionMessage(`Response captured. Proceeding to Question ${nextNum}...`);
        speakTransition(`Thank you. Moving to question ${nextNum}.`);

        setTimeout(() => {
          setSubmitting(false);
          setTransitioning(false);
          setCurrentIdx((prev) => prev + 1);
        }, 1200);
      } else {
        // Last question answered -> Complete interview
        setCompleting(true);
        setTransitionMessage('Interview complete! Synthesizing your performance evaluation report...');
        speakTransition('Thank you. That completes your interview. Generating your placement report now.');

        confetti({
          particleCount: 150,
          spread: 85,
          origin: { y: 0.6 },
        });

        await interviewApi.completeInterview(id);

        setTimeout(() => {
          navigate(`/feedback/${id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit answer to database:', err);
      alert('Error saving answer to database. Please try again.');
      setSubmitting(false);
      setTransitioning(false);
    }
  };

  // End Interview early
  const handleEndEarly = async () => {
    if (window.confirm('Are you sure you want to conclude the mock interview now? Your answered questions will be evaluated.')) {
      setCompleting(true);
      try {
        await interviewApi.completeInterview(id);
        navigate(`/feedback/${id}`);
      } catch (err) {
        console.error('Failed to complete interview:', err);
        navigate('/dashboard');
      }
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Connecting to Live AI Placement Interview Call...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const progressPercent = questions.length > 0 ? Math.round(((currentIdx + 1) / questions.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      {/* Top Video Call HUD Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white">Live Placement Video Interview</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold tracking-wider flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                REC • ON-AIR
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Video className="w-3 h-3 text-emerald-400" /> Camera Active
              </span>
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3 text-emerald-400" /> Microphone Live
              </span>
            </div>
          </div>
        </div>

        {/* Question progress, session timer, and controls */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Time: {formatTimer(totalSessionSec)}</span>
          </div>

          <div className="flex items-center gap-2.5 w-36 sm:w-44">
            <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleEndEarly}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors cursor-pointer"
          >
            <XSquare className="w-3.5 h-3.5" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Transition Banner */}
      {transitioning && (
        <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/40 backdrop-blur-md p-4 text-center text-sm font-semibold text-indigo-200 animate-in fade-in flex items-center justify-center gap-3 shadow-xl">
          <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          <span>{transitionMessage}</span>
        </div>
      )}

      {completing && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 backdrop-blur-md p-6 text-center text-sm font-bold text-emerald-200 animate-in fade-in space-y-2 shadow-2xl">
          <div className="w-8 h-8 border-3 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-base text-white">Interview Complete!</p>
          <p className="text-xs text-emerald-300 font-normal">
            Saving comprehensive evaluations, computer vision metrics, and resume recommendations to MySQL database...
          </p>
        </div>
      )}

      {/* Main Video Conference Grid */}
      {/* 
        Hero Stage: AI Interviewer is the primary focus (7-8 columns on desktop)
        Participant Stage: Candidate Camera Feed in smaller section (4-5 columns)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Main Focus: The AI Interviewer Hero Stage */}
        <div className="lg:col-span-8 flex flex-col">
          {currentQ && (
            <AiInterviewerStage
              questionText={currentQ.questionText}
              category={currentQ.category}
              difficulty={currentQ.difficulty}
              currentIdx={currentIdx}
              totalQuestions={questions.length}
              isCandidateAnswering={isCandidateAnswering}
              isSubmitting={submitting || transitioning || completing}
            />
          )}
        </div>

        {/* Smaller Section: Candidate Live Camera Feed & Telemetry */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="flex-1">
            <VisionTracker onTelemetryUpdate={handleTelemetryUpdate} active={true} />
          </div>

          {/* Quick Non-Verbal Tip Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Placement Tip</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Maintain eye contact with your webcam lens while speaking to project confidence and strong executive presence.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Verbal Answer Interaction Console */}
      <div className="mt-2">
        <SpeechRecorder
          currentQuestionId={currentQ?.id}
          onSubmitAnswer={handleSubmitAnswer}
          isSubmitting={submitting || transitioning || completing}
        />
      </div>
    </div>
  );
}
