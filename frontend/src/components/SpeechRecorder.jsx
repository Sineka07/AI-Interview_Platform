import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Clock, AlertCircle, RefreshCw, Edit3 } from 'lucide-react';

const COMMON_FILLERS = ['um', 'uh', 'like', 'basically', 'actually', 'you know'];

export default function SpeechRecorder({
  onSubmitAnswer,
  isSubmitting,
  currentQuestionId,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [durationSec, setDurationSec] = useState(0);
  const [fillerCounts, setFillerCounts] = useState({
    um: 0,
    uh: 0,
    like: 0,
    basically: 0,
    actually: 0,
    'you know': 0,
  });

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Reset state on question change
  useEffect(() => {
    setTranscript('');
    setDurationSec(0);
    setIsRecording(false);
    setFillerCounts({
      um: 0,
      uh: 0,
      like: 0,
      basically: 0,
      actually: 0,
      'you know': 0,
    });
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [currentQuestionId]);

  // Analyze text for filler words whenever transcript changes
  useEffect(() => {
    if (!transcript) return;
    const lower = transcript.toLowerCase();
    const counts = { ...fillerCounts };

    COMMON_FILLERS.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lower.match(regex);
      counts[filler] = matches ? matches.length : 0;
    });

    setFillerCounts(counts);
  }, [transcript]);

  // Speaking timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDurationSec((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Initialize Speech Recognition
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your response directly into the text box below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if user did not deliberately click stop
        if (isRecording) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const totalFillerWords = Object.values(fillerCounts).reduce((a, b) => a + b, 0);

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const currentWpm = durationSec > 0 ? Math.round((wordCount / (durationSec / 60))) : 0;

  const handleSubmit = () => {
    stopRecording();
    if (!transcript.trim()) {
      alert('Please speak or type your answer before submitting.');
      return;
    }
    onSubmitAnswer({
      answerText: transcript.trim(),
      durationSeconds: Math.max(durationSec, 10),
      fillerCount: totalFillerWords,
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-sm flex flex-col justify-between">
      <div>
        {/* Controls Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Stop Answering' : 'Start Answering'}</span>
            </button>

            {/* Answer duration counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatTime(durationSec)}</span>
            </div>

            {/* Live WPM pace */}
            {durationSec >= 5 && (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <span>Pace:</span>
                <span className={`font-semibold ${currentWpm >= 110 && currentWpm <= 160 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {currentWpm} WPM
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setTranscript('');
              setDurationSec(0);
            }}
            title="Clear transcript"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Live Filler Words Counter Badges */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Fillers ({totalFillerWords}):</span>
          </span>
          {COMMON_FILLERS.map((filler) => {
            const count = fillerCounts[filler] || 0;
            return (
              <span
                key={filler}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                  count > 0
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                "{filler}": {count}
              </span>
            );
          })}
        </div>

        {/* Real-time Editable Transcript Box */}
        <div className="relative">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening to your voice... Speak clearly into your microphone...'
                : 'Click "Start Answering" to speak your answer, or type directly here...'
            }
            rows={5}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
          />
          <div className="absolute bottom-3 right-3 text-[11px] text-slate-500 flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            <span>{wordCount} words</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Tip: Elaborate on specific project implementations and trade-offs.
        </span>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !transcript.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Evaluating Answer...</span>
            </>
          ) : (
            <>
              <span>Submit Answer</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
