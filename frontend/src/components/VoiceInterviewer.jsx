import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, Sparkles, UserCheck } from 'lucide-react';

export default function VoiceInterviewer({ questionText, category, difficulty, currentIdx, totalQuestions }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  // Read question automatically whenever questionText changes
  useEffect(() => {
    if (!questionText || voiceMuted) return;

    // Cancel ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.95; // Clear and measured pace
    utterance.pitch = 1.0;

    // Pick an English voice if available
    const voices = synthRef.current?.getVoices() || [];
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Small delay for natural turn-taking
    const timer = setTimeout(() => {
      synthRef.current?.speak(utterance);
    }, 400);

    return () => {
      clearTimeout(timer);
      synthRef.current?.cancel();
    };
  }, [questionText, voiceMuted]);

  const speakNow = () => {
    if (!questionText || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
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
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-5 shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            Question {currentIdx + 1} of {totalQuestions}
          </div>
          <span className="text-xs font-medium text-slate-400">
            {category || 'Technical'} • {difficulty || 'Medium'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={speakNow}
            title="Repeat Question"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleMute}
            title={voiceMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {voiceMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* Avatar & Pulse wave section */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
            <UserCheck className="w-7 h-7 text-white" />
          </div>

          {/* Pulsing indicator when speaking */}
          {isSpeaking && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500"></span>
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">AI Placement Interviewer</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isSpeaking
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {isSpeaking ? 'Speaking Question...' : 'Listening...'}
            </span>
          </div>

          {/* Animated sound wave bars */}
          <div className="flex items-center gap-1 mt-2 h-4">
            {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isSpeaking
                    ? 'bg-indigo-400 animate-pulse'
                    : 'bg-slate-800 h-1'
                }`}
                style={{
                  height: isSpeaking ? `${Math.max(4, (height * Math.random()) / 5 + 4)}px` : '4px',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question prompt text */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
          "{questionText}"
        </p>
      </div>
    </div>
  );
}
