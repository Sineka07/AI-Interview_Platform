import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  UserCheck,
  Radio,
  Mic,
  MessageSquare,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function AiInterviewerStage({
  questionText,
  category,
  difficulty,
  currentIdx,
  totalQuestions,
  isCandidateAnswering = false,
  isSubmitting = false,
  onSpeechEnd,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const wordsRef = useRef([]);

  // Split question into words for synchronized caption highlighting
  useEffect(() => {
    if (questionText) {
      wordsRef.current = questionText.split(/\s+/);
      setHighlightedWordIndex(-1);
    }
  }, [questionText]);

  // Read question automatically via TTS whenever questionText changes
  useEffect(() => {
    if (!questionText || voiceMuted || !synthRef.current) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.95; // Measured executive pacing
    utterance.pitch = 1.0;

    // Pick natural English voice if available
    const voices = synthRef.current.getVoices() || [];
    const professionalVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Microsoft Jenny') ||
            v.name.includes('Microsoft Guy'))
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (professionalVoice) {
      utterance.voice = professionalVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setHighlightedWordIndex(0);
    };

    // Synchronize subtitle highlighting with spoken words
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        // Find corresponding word index
        let charCount = 0;
        for (let i = 0; i < wordsRef.current.length; i++) {
          charCount += wordsRef.current[i].length + 1;
          if (charCount > charIndex) {
            setHighlightedWordIndex(i);
            break;
          }
        }
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setHighlightedWordIndex(wordsRef.current.length);
      if (onSpeechEnd) onSpeechEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    // Small natural delay (500ms) before speaking new question
    const speakTimer = setTimeout(() => {
      synthRef.current?.speak(utterance);
    }, 500);

    return () => {
      clearTimeout(speakTimer);
      synthRef.current?.cancel();
    };
  }, [questionText, voiceMuted, onSpeechEnd]);

  // Manual replay question audio
  const handleReplay = () => {
    if (!questionText || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.95;

    const voices = synthRef.current.getVoices() || [];
    const professionalVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (professionalVoice) utterance.voice = professionalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        let charCount = 0;
        for (let i = 0; i < wordsRef.current.length; i++) {
          charCount += wordsRef.current[i].length + 1;
          if (charCount > charIndex) {
            setHighlightedWordIndex(i);
            break;
          }
        }
      }
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setHighlightedWordIndex(wordsRef.current.length);
    };
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const toggleMute = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setVoiceMuted((prev) => !prev);
  };

  return (
    <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-2xl overflow-hidden flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-600/10 via-purple-600/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar of the Interview Screen */}
      <div className="relative z-10 px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
            Question {currentIdx + 1} of {totalQuestions}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {category || 'Technical'} • {difficulty || 'Medium'} Level
          </span>
        </div>

        {/* Audio controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReplay}
            title="Re-listen to Question"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Repeat</span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            title={voiceMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
          >
            {voiceMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Recruiter Video Stage */}
      <div className="relative z-10 py-8 px-6 sm:px-12 flex flex-col items-center justify-center text-center">
        {/* Recruiter Avatar Frame with Reactive Sound Pulses */}
        <div className="relative mb-6">
          {/* Reactive pulse rings when speaking */}
          {isSpeaking && (
            <>
              <span className="absolute -inset-4 rounded-full bg-indigo-500/20 animate-ping opacity-75 pointer-events-none" />
              <span className="absolute -inset-8 rounded-full bg-purple-500/15 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Recruiter Persona Container */}
          <div
            className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-600 p-1 shadow-2xl transition-all duration-300 ${
              isSpeaking
                ? 'ring-4 ring-indigo-400/60 shadow-indigo-500/40 scale-105'
                : 'ring-2 ring-slate-700/80 shadow-slate-950'
            }`}
          >
            <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden relative flex items-center justify-center border border-white/10">
              {/* Recruiter SVG Portrait / Avatar */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full object-cover transform translate-y-1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Studio Light */}
                <circle cx="50" cy="50" r="48" fill="#0f172a" />
                <circle cx="50" cy="30" r="30" fill="#4338ca" opacity="0.3" />

                {/* Shoulders & Suit */}
                <path
                  d="M15 95 C 15 72, 35 68, 50 68 C 65 68, 85 72, 85 95 Z"
                  fill="#1e1b4b"
                />
                {/* Shirt Collar */}
                <path d="M42 68 L50 82 L58 68 Z" fill="#ffffff" />
                {/* Tie */}
                <path d="M48 80 L52 80 L54 95 L46 95 Z" fill="#6366f1" />

                {/* Neck */}
                <rect x="44" y="52" width="12" height="18" fill="#fcd34d" rx="4" />

                {/* Head */}
                <ellipse cx="50" cy="42" rx="20" ry="23" fill="#fde68a" />

                {/* Hair */}
                <path
                  d="M30 40 C 28 25, 42 16, 50 16 C 58 16, 72 25, 70 40 C 65 24, 35 24, 30 40 Z"
                  fill="#1e293b"
                />

                {/* Eyes */}
                <circle cx="43" cy="39" r="2.5" fill="#1e293b" />
                <circle cx="57" cy="39" r="2.5" fill="#1e293b" />
                {/* Eye sparkle */}
                <circle cx="44" cy="38" r="0.8" fill="#ffffff" />
                <circle cx="58" cy="38" r="0.8" fill="#ffffff" />

                {/* Eyebrows */}
                <path
                  d="M39 34 Q 44 32 48 34"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M52 34 Q 56 32 61 34"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Animated Mouth (Moves dynamically when speaking!) */}
                {isSpeaking ? (
                  <ellipse
                    cx="50"
                    cy="52"
                    rx="4.5"
                    ry="3.5"
                    fill="#be123c"
                    className="animate-pulse"
                  />
                ) : (
                  <path
                    d="M45 52 Q 50 56 55 52"
                    stroke="#b45309"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Recruiter Details & Live Presence Status */}
        <div className="space-y-1.5 mb-6">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Dr. Sarah Vance, Senior Technical Hiring Lead
            </h3>
            <span className="p-1 rounded-full bg-indigo-500/20 text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Dynamic Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-md">
            {isSpeaking ? (
              <span className="flex items-center gap-2 text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>Speaking Question...</span>
              </span>
            ) : isSubmitting ? (
              <span className="flex items-center gap-2 text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-spin" />
                <span>Analyzing Technical Response...</span>
              </span>
            ) : isCandidateAnswering ? (
              <span className="flex items-center gap-2 text-rose-300 bg-rose-500/20 border border-rose-500/30 px-3 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Listening to Candidate's Response...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Ready for your answer</span>
              </span>
            )}
          </div>
        </div>

        {/* Real-time Dynamic Sound Wave Bars */}
        <div className="flex items-center justify-center gap-1 mb-6 h-6">
          {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35, 65, 85, 45, 95].map(
            (height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isSpeaking
                    ? 'bg-gradient-to-t from-indigo-500 to-purple-400 animate-pulse'
                    : 'bg-slate-800 h-1.5'
                }`}
                style={{
                  height: isSpeaking
                    ? `${Math.max(4, (height * Math.random()) / 3 + 6)}px`
                    : '4px',
                }}
              />
            )
          )}
        </div>

        {/* Subtitles / Closed Captioning Section (Synchronized with Speech) */}
        <div className="w-full max-w-3xl rounded-2xl bg-slate-950/90 border border-slate-800/90 p-4 sm:p-6 shadow-2xl relative">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-800/60 pb-2">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Question Subtitles / Closed Captions</span>
            </span>
            <span className="text-[10px] text-slate-500">Live Synchronized TTS</span>
          </div>

          <div className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed min-h-[4rem] flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
            {wordsRef.current.map((word, idx) => {
              const isCurrent = idx === highlightedWordIndex && isSpeaking;
              const hasSpoken = idx < highlightedWordIndex && isSpeaking;
              return (
                <span
                  key={idx}
                  className={`transition-colors duration-150 rounded px-0.5 ${
                    isCurrent
                      ? 'bg-indigo-500 text-white font-bold shadow-sm shadow-indigo-500/50'
                      : hasSpoken
                      ? 'text-indigo-200'
                      : 'text-slate-300'
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
