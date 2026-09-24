import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewApi } from '../api/interviewApi';
import {
  Sparkles,
  Briefcase,
  Layers,
  HelpCircle,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  ArrowRight,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
  UploadCloud,
  FileText,
  Loader2,
  Volume2,
  Sliders,
  Check
} from 'lucide-react';

export default function NewInterview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState(`${user?.targetRole || 'Software Engineer'} Placement Mock`);
  const [roleTarget, setRoleTarget] = useState(user?.targetRole || 'Software Development Engineer (SDE)');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [category, setCategory] = useState('MIXED');
  const [questionCount, setQuestionCount] = useState(5);
  const [resumeOverride, setResumeOverride] = useState(user?.resumeText || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Resume Upload State
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFilename, setResumeFilename] = useState('');
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [extractedProjects, setExtractedProjects] = useState([]);
  const [resumeSummary, setResumeSummary] = useState('');
  const fileInputRef = useRef(null);

  // Hardware Check State
  const [showHardwareCheck, setShowHardwareCheck] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const videoPreviewRef = useRef(null);
  const previewStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Load current user's existing resume on mount
  useEffect(() => {
    async function loadCurrentResume() {
      try {
        const res = await interviewApi.getCurrentResume();
        if (res.hasResume) {
          setResumeOverride(res.rawText || '');
          setExtractedSkills(res.skills || []);
          setExtractedProjects(res.projects || []);
          setResumeSummary(res.suggestedSummary || '');
          setResumeFilename('Saved Resume Profile');
        }
      } catch (e) {
        console.log('No existing resume loaded:', e);
      }
    }
    loadCurrentResume();
  }, []);

  // Handle Resume File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await interviewApi.uploadResume(formData);
      setResumeFilename(res.filename);
      setResumeOverride(res.rawText);
      setExtractedSkills(res.skills || []);
      setExtractedProjects(res.projects || []);
      setResumeSummary(res.suggestedSummary || '');
    } catch (err) {
      console.error('Failed to parse resume:', err);
      setError('Failed to parse resume file. Please ensure it is a valid PDF or text document.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Hardware Check: Toggle and Test
  const startHardwareCheck = async () => {
    setShowHardwareCheck(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });
      previewStreamRef.current = stream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        try {
          await videoPreviewRef.current.play();
        } catch (e) {}
        setCameraActive(true);
      } else {
        // Trigger state so useEffect catches it once DOM renders
        setCameraActive(true);
      }

      // Setup audio analyzer
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const micSource = audioCtx.createMediaStreamSource(stream);
      micSource.connect(analyser);
      setMicActive(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Hardware check access failed:', err);
      setError('Could not access camera/microphone. Please allow camera and mic permissions in your browser.');
    }
  };

  const stopHardwareCheck = () => {
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach((t) => t.stop());
      previewStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setCameraActive(false);
    setMicActive(false);
    setAudioLevel(0);
    setShowHardwareCheck(false);
  };

  // Clean up media on unmount
  useEffect(() => {
    return () => {
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Ensure video element receives stream whenever showHardwareCheck or stream is active
  useEffect(() => {
    if (showHardwareCheck && previewStreamRef.current && videoPreviewRef.current) {
      const vid = videoPreviewRef.current;
      vid.muted = true;
      vid.playsInline = true;
      vid.srcObject = previewStreamRef.current;
      vid.play().catch((err) => console.log('Hardware video play deferred:', err));
    }
  }, [showHardwareCheck, cameraActive]);

  const handleStart = async (e) => {
    e.preventDefault();
    stopHardwareCheck();
    setLoading(true);
    setError('');

    try {
      const res = await interviewApi.createInterview({
        title,
        roleTarget,
        difficulty,
        category,
        questionCount,
        resumeOverride,
      });

      navigate(`/interview/${res.interviewId}`);
    } catch (err) {
      console.error('Failed to create interview:', err);
      setError('Could not initialize interview session. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Powered Interview Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Configure Your Placement Mock Interview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload your resume so questions target your actual projects and skills, then verify your camera & microphone.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-7">
          {/* SECTION 1: Resume Upload & Analysis */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Resume-Driven Question Context</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The AI interviewer reads your resume to formulate project-specific questions and tailored feedback.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingResume}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {uploadingResume ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Resume (PDF/TXT)</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Resume Upload Status & Extracted Skills */}
            {resumeFilename ? (
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Active Resume: {resumeFilename}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Change Resume
                  </button>
                </div>

                {resumeSummary && (
                  <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    "{resumeSummary}"
                  </p>
                )}

                {extractedSkills.length > 0 && (
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                      Extracted Technical Competencies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[11px] border border-indigo-500/25 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {extractedProjects.length > 0 && (
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                      Extracted Projects (AI will ask questions about these):
                    </span>
                    <div className="space-y-1">
                      {extractedProjects.map((p, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-slate-200 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-900/30 hover:bg-indigo-500/5"
              >
                <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">
                  Click or drag & drop your resume (.pdf or .txt) here
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Apache PDFBox parses your skills & projects automatically
                </p>
              </div>
            )}
          </div>

          {/* SECTION 2: Role & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Session Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Amazon SDE-1 Placement Mock"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Role Domain
              </label>
              <select
                value={roleTarget}
                onChange={(e) => setRoleTarget(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Software Development Engineer (SDE)">Software Development Engineer (SDE)</option>
                <option value="Frontend Engineer (React / JS)">Frontend Engineer (React / JS)</option>
                <option value="Backend Developer (Java / Spring)">Backend Developer (Java / Spring)</option>
                <option value="Full-Stack Developer">Full-Stack Developer</option>
                <option value="Data Analyst / ML Engineer">Data Analyst / ML Engineer</option>
                <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer</option>
              </select>
            </div>
          </div>

          {/* SECTION 3: Difficulty Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'EASY', label: 'Easy', desc: 'Core fundamentals & definitions' },
                { id: 'MEDIUM', label: 'Medium', desc: 'Practical problems & architecture' },
                { id: 'HARD', label: 'Hard', desc: 'System design, edge cases & scale' },
              ].map((lvl) => (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => setDifficulty(lvl.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    difficulty === lvl.id
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm text-white mb-1">{lvl.label}</div>
                  <div className="text-xs text-slate-400">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 4: Category & Question Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Interview Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="MIXED">Mixed (Technical + Behavioral + HR)</option>
                <option value="TECHNICAL">Technical & Problem Solving Only</option>
                <option value="BEHAVIORAL">Behavioral (STAR Method)</option>
                <option value="HR">HR & Cultural Fit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Number of Questions
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 8].map((count) => (
                  <button
                    type="button"
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`py-2.5 rounded-xl border text-center text-sm font-semibold transition-all cursor-pointer ${
                      questionCount === count
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: Pre-Flight Hardware Check (Camera & Mic) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Hardware & Sensor Pre-Flight Check
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify camera stream and microphone volume before entering the live interview room.
                </p>
              </div>

              {!showHardwareCheck ? (
                <button
                  type="button"
                  onClick={startHardwareCheck}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Test Camera & Mic</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopHardwareCheck}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  <span>Close Test</span>
                </button>
              )}
            </div>

            {showHardwareCheck && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 animate-in fade-in duration-300">
                {/* Video Preview */}
                <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video border border-slate-800 flex items-center justify-center">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-[10px] text-emerald-400 border border-slate-700 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{cameraActive ? 'Camera Connected' : 'Connecting Camera...'}</span>
                  </div>
                </div>

                {/* Mic Audio Meter */}
                <div className="rounded-xl bg-slate-900 p-4 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-emerald-400" />
                        <span>Microphone Signal</span>
                      </span>
                      <span className="text-emerald-400 font-mono">{audioLevel}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Speak aloud into your microphone to verify live audio reception.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-75"
                        style={{ width: `${Math.max(5, audioLevel)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Silent</span>
                      <span>Normal Speaking Level</span>
                      <span>Optimal</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Launch Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-base transition-all shadow-xl shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Generating Tailored Placement Questions...</span>
              </>
            ) : (
              <>
                <span>Enter Live AI Interview Call</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
