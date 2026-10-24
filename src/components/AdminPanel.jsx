import React, { useState, useMemo } from 'react';
import { Play, Lock, Eye, Users, Trophy, SkipForward, RotateCcw, Plus, Edit, Trash2, Download, Upload, Key, UserPlus, CheckCircle, Clock, BarChart3, HelpCircle, Database, ShieldCheck } from 'lucide-react';
import sjcLogo from '../assets/sjc-logo.png';
import { sounds } from '../utils/soundEffects';
import { PRIZE_LADDER } from '../data/defaultQuestions';
import { updateGameState, saveQuestions, registerOrUpdateUser, bulkRegisterUsers, deleteUserAccount, resetAllScores } from '../services/quizService';
import { getSavedFirebaseConfig, isFirebaseActive } from '../services/firebaseConfig';

export default function AdminPanel({ gameState, questions, participants, allResponses = {} }) {
  const [activeTab, setActiveTab] = useState('controller');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', displayName: '', college: '' });
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkPrefix, setBulkPrefix] = useState('team');
  const [bulkPass, setBulkPass] = useState('fest2026');
  const [fbConfig] = useState(getSavedFirebaseConfig());

  const currentQ = questions[gameState.currentQuestionIndex] || questions[0];
  const ladderItem = PRIZE_LADDER[gameState.currentQuestionIndex] || { prize: "₹1,000" };

  // Controller actions
  const handleLaunchQuestion = async () => { sounds.playTick(false); await updateGameState({ status: 'QUESTION_ACTIVE', timerStartedAt: Date.now(), timerDuration: currentQ.timeLimit || 30, showAudiencePoll: false, revealOption: false }); };
  const handleLockAnswers = async () => { sounds.playLock(); await updateGameState({ status: 'ANSWER_LOCKED' }); };
  const handleRevealAnswer = async () => { sounds.playCorrect(); await updateGameState({ status: 'ANSWER_REVEALED', revealOption: true }); };
  const handleToggleAudiencePoll = async () => { sounds.playPoll(); await updateGameState({ showAudiencePoll: !gameState.showAudiencePoll }); };
  const handleShowLeaderboard = async () => { sounds.playCorrect(); await updateGameState({ status: 'LEADERBOARD' }); };
  const handleNextQuestion = async () => {
    if (gameState.currentQuestionIndex < questions.length - 1) { sounds.playTick(false); const n = gameState.currentQuestionIndex + 1; await updateGameState({ currentQuestionIndex: n, activeQuestionId: questions[n]?.id || `q-${n + 1}`, status: 'LOBBY', timerStartedAt: null, showAudiencePoll: false, revealOption: false }); }
    else await updateGameState({ status: 'COMPLETED' });
  };
  const handleJumpToQuestion = async (idx) => { await updateGameState({ currentQuestionIndex: idx, activeQuestionId: questions[idx]?.id || `q-${idx + 1}`, status: 'LOBBY', timerStartedAt: null, showAudiencePoll: false, revealOption: false }); };
  const handleResetSession = async () => { if (window.confirm("Reset live session back to Lobby Q1?")) await updateGameState({ status: 'LOBBY', currentQuestionIndex: 0, activeQuestionId: questions[0]?.id || 'q-1', timerStartedAt: null, showAudiencePoll: false, revealOption: false }); };

  const submissionStats = useMemo(() => {
    const total = participants.length;
    const subs = Object.values(allResponses);
    const answered = subs.length;
    const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
    const opts = [0, 0, 0, 0];
    subs.forEach(s => { if (s.selectedOption >= 0 && s.selectedOption <= 3) opts[s.selectedOption]++; });
    return { totalParticipants: total, answeredCount: answered, percentage: pct, optionCounts: opts, submissions: subs.sort((a, b) => a.timeTakenMs - b.timeTakenMs) };
  }, [participants, allResponses]);

  // Question management
  const handleOpenAddQuestion = () => {
    setEditingQuestion({ id: `q-${questions.length + 1}`, level: questions.length + 1, prize: PRIZE_LADDER[questions.length]?.prize || `₹${(questions.length + 1) * 1000}`, question: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 30, category: 'General', explanation: '', flipQuestion: { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' } });
    setIsQuestionModalOpen(true);
  };
  const handleSaveQuestion = async (e) => { e.preventDefault(); const list = [...questions]; const idx = list.findIndex(q => q.id === editingQuestion.id); if (idx >= 0) list[idx] = editingQuestion; else list.push(editingQuestion); await saveQuestions(list); setIsQuestionModalOpen(false); setEditingQuestion(null); };
  const handleDeleteQuestion = async (id) => { if (window.confirm("Delete this question?")) await saveQuestions(questions.filter(q => q.id !== id)); };
  const handleExportJSON = () => { const d = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2)); const a = document.createElement('a'); a.setAttribute("href", d); a.setAttribute("download", "expressions-quiz-questions.json"); document.body.appendChild(a); a.click(); a.remove(); };
  const handleImportJSON = (e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = async (ev) => { try { const p = JSON.parse(ev.target.result); if (Array.isArray(p)) { await saveQuestions(p); alert("Questions imported!"); } } catch { alert("Invalid JSON."); } }; r.readAsText(f); } };

  // User management
  const handleAddSingleUser = async (e) => { e.preventDefault(); if (!newUser.username.trim() || !newUser.password.trim()) return; await registerOrUpdateUser(newUser); setNewUser({ username: '', password: '', displayName: '', college: '' }); };
  const handleGenerateBulk = async () => { const g = []; for (let i = 1; i <= bulkCount; i++) g.push({ username: `${bulkPrefix}${i}`, password: bulkPass, displayName: `Team ${i}`, college: "St. Joseph's College, Allahabad" }); await bulkRegisterUsers(g); };
  const handleDeleteUser = async (u) => { if (window.confirm(`Remove team "${u}"?`)) await deleteUserAccount(u); };
  const handleResetScores = async () => { if (window.confirm("Reset all scores & lifelines?")) await resetAllScores(); };

  const tabClass = (t) => `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === t ? 'bg-[#4C1B56] text-white font-bold shadow-sm' : 'text-[#8B4A5A] hover:text-[#31124A] hover:bg-white'}`;

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EEC37D]/15">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#EEC37D]/12 border border-[#EEC37D]/20 p-1 flex items-center justify-center">
            <img src={sjcLogo} alt="SJC" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#4C1B56] text-white text-[10px] font-semibold tracking-wide">Host Console</span>
              <span className="text-xs text-[#8B4A5A]">Samavaya • St. Joseph's College</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gold-gradient font-serif mt-0.5">Expressions 2026 Coordinator</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 bg-[#FBEEE1] p-1.5 rounded-2xl border border-[#EEC37D]/12">
          <button onClick={() => setActiveTab('controller')} className={tabClass('controller')}><Play className="w-3.5 h-3.5" /><span>Live Controller</span></button>
          <button onClick={() => setActiveTab('questions')} className={tabClass('questions')}><HelpCircle className="w-3.5 h-3.5" /><span>Questions ({questions.length})</span></button>
          <button onClick={() => setActiveTab('users')} className={tabClass('users')}><Users className="w-3.5 h-3.5" /><span>Team Accounts ({participants.length})</span></button>
          <button onClick={() => setActiveTab('settings')} className={tabClass('settings')}><Database className="w-3.5 h-3.5" /><span>Firebase Status</span></button>
        </div>
      </div>

      {/* TAB 1: CONTROLLER */}
      {activeTab === 'controller' && (
        <div className="space-y-6">
          <div className="samavaya-card rounded-3xl p-5 md:p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-3 border-b border-[#EEC37D]/12">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-xl bg-[#D27D4F]/10 border border-[#D27D4F]/20 text-[#D27D4F] font-bold text-xs">Q{gameState.currentQuestionIndex + 1} / {questions.length}</div>
                <div><span className="text-[10px] uppercase text-[#8B4A5A] block">Prize</span><span className="text-lg font-bold text-gold-metallic">{ladderItem.prize}</span></div>
              </div>
              <div className="flex items-center gap-2"><span className="text-xs text-[#8B4A5A]">Phase:</span><span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FBEEE1] border border-[#EEC37D]/15 text-[#D27D4F]">{gameState.status.replace('_', ' ')}</span></div>
            </div>
            {/* Question Preview */}
            <div className="p-4 bg-[#FBEEE1] border border-[#EEC37D]/12 rounded-2xl mb-5 text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#4C1B56] font-semibold block mb-1">{currentQ?.category || "Trivia"}</span>
              <p className="text-sm md:text-base font-medium text-[#31124A] max-w-2xl mx-auto">{currentQ?.question}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                {currentQ?.options.map((opt, i) => (
                  <div key={i} className={`p-2 rounded-xl border text-left flex items-center justify-between ${i === currentQ.correctAnswer ? 'bg-[#66BB6A]/10 border-[#66BB6A]/25 text-[#31124A] font-bold' : 'bg-white border-[#EEC37D]/12 text-[#8B4A5A]'}`}>
                    <span>{String.fromCharCode(65 + i)}: {opt}</span>{i === currentQ.correctAnswer && <CheckCircle className="w-3 h-3 text-[#66BB6A]" />}
                  </div>
                ))}
              </div>
            </div>
            {/* Control Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <button onClick={handleLaunchQuestion} className="p-3 rounded-xl btn-gold-primary text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer"><Play className="w-4 h-4" /><span>1. Launch Q</span></button>
              <button onClick={handleLockAnswers} className="p-3 rounded-xl bg-[#B00070] hover:bg-[#8e005a] text-white font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"><Lock className="w-4 h-4" /><span>2. Lock Answers</span></button>
              <button onClick={handleRevealAnswer} className="p-3 rounded-xl bg-[#4C1B56]/10 hover:bg-[#4C1B56]/20 text-[#4C1B56] border border-[#4C1B56]/20 font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"><Eye className="w-4 h-4" /><span>3. Reveal</span></button>
              <button onClick={handleToggleAudiencePoll} className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer ${gameState.showAudiencePoll ? 'bg-[#D27D4F] text-white' : 'bg-white text-[#8B4A5A] border border-[#EEC37D]/20 hover:bg-[#EEC37D]/8'}`}><BarChart3 className="w-4 h-4" /><span>{gameState.showAudiencePoll ? 'Hide Poll' : 'Show Poll'}</span></button>
              <button onClick={handleShowLeaderboard} className="p-3 rounded-xl bg-white hover:bg-[#EEC37D]/8 text-[#D27D4F] border border-[#EEC37D]/20 font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"><Trophy className="w-4 h-4" /><span>Leaderboard</span></button>
              <button onClick={handleNextQuestion} className="p-3 rounded-xl bg-[#FBEEE1] hover:bg-[#F9E8E0] text-[#31124A] border border-[#EEC37D]/12 font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"><SkipForward className="w-4 h-4" /><span>Next Q &gt;</span></button>
            </div>
            {/* Jump & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-3 border-t border-[#EEC37D]/12 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#8B4A5A]">Jump to:</span>
                <div className="flex flex-wrap gap-1">{questions.map((_, idx) => (<button key={idx} onClick={() => handleJumpToQuestion(idx)} className={`w-6 h-6 rounded-lg text-xs font-bold cursor-pointer ${gameState.currentQuestionIndex === idx ? 'bg-[#D27D4F] text-white' : 'bg-[#FBEEE1] text-[#8B4A5A] hover:text-[#31124A] hover:bg-[#FBE0A4]/30'}`}>{idx + 1}</button>))}</div>
              </div>
              <button onClick={handleResetSession} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#B00070]/8 hover:bg-[#B00070]/15 border border-[#B00070]/15 text-[#B00070] font-medium cursor-pointer"><RotateCcw className="w-3 h-3" /><span>Reset to Lobby</span></button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="samavaya-card rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#31124A] flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5 text-[#D27D4F]" />Vote Distribution</h3>
                <span className="text-[11px] text-[#8B4A5A] font-mono">{submissionStats.answeredCount} / {submissionStats.totalParticipants}</span>
              </div>
              <div className="w-full h-1.5 bg-[#FBEEE1] rounded-full overflow-hidden mb-4"><div className="h-full bg-gradient-to-r from-[#D27D4F] to-[#EEC37D] transition-all duration-300" style={{ width: `${submissionStats.percentage}%` }} /></div>
              <div className="space-y-2.5">
                {currentQ?.options.map((opt, i) => {
                  const count = submissionStats.optionCounts[i] || 0;
                  const pct = submissionStats.answeredCount > 0 ? Math.round((count / submissionStats.answeredCount) * 100) : 0;
                  const isCorrect = i === currentQ.correctAnswer;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs"><span className={`font-medium ${isCorrect ? 'text-[#66BB6A] font-bold' : 'text-[#8B4A5A]'}`}>{String.fromCharCode(65 + i)}: {opt} {isCorrect && "✓"}</span><span className="text-[#8B4A5A] font-mono text-[11px]">{count} ({pct}%)</span></div>
                      <div className="w-full h-1.5 bg-[#FBEEE1] rounded-full overflow-hidden"><div className={`h-full transition-all duration-300 ${isCorrect ? 'bg-[#66BB6A]' : 'bg-[#D27D4F]/40'}`} style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="lg:col-span-2 samavaya-card rounded-2xl p-5 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-3"><h3 className="text-xs font-bold text-[#31124A] flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#D27D4F]" />Live Response Stream</h3><span className="text-[11px] text-[#D27D4F] font-mono">By speed</span></div>
              {submissionStats.submissions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-[#C4A0AB] text-xs text-center border border-dashed border-[#EEC37D]/20 rounded-xl"><Clock className="w-6 h-6 mb-2 opacity-30" /><p>No answers yet.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FBEEE1] text-[#8B4A5A] border-b border-[#EEC37D]/12"><tr><th className="py-2 px-3">#</th><th className="py-2 px-3">Team</th><th className="py-2 px-3">Option</th><th className="py-2 px-3">Time</th><th className="py-2 px-3">Result</th><th className="py-2 px-3 text-right">Points</th></tr></thead>
                    <tbody className="divide-y divide-[#EEC37D]/10">
                      {submissionStats.submissions.map((sub, idx) => (
                        <tr key={sub.username} className="hover:bg-[#EEC37D]/5">
                          <td className="py-2 px-3 font-mono text-[#8B4A5A]">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-[#31124A]">{sub.username}</td>
                          <td className="py-2 px-3 font-mono font-bold text-[#D27D4F]">{sub.selectedOption >= 0 ? String.fromCharCode(65 + sub.selectedOption) : "—"}</td>
                          <td className="py-2 px-3 font-mono text-[#8B4A5A]">{(sub.timeTakenMs / 1000).toFixed(2)}s</td>
                          <td className="py-2 px-3">{sub.isCorrect ? <span className="text-[#66BB6A] font-semibold">Correct</span> : <span className="text-[#B00070]">Incorrect</span>}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#D27D4F]">+{sub.pointsEarned || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 samavaya-card p-4 rounded-2xl">
            <div><h3 className="text-sm font-bold text-[#31124A]">Question Bank ({questions.length} Levels)</h3><p className="text-xs text-[#8B4A5A]">Customize questions, options, and flip alternatives</p></div>
            <div className="flex items-center gap-2">
              <button onClick={handleExportJSON} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FBEEE1] hover:bg-[#F9E8E0] text-[#8B4A5A] text-xs font-medium border border-[#EEC37D]/12 cursor-pointer"><Download className="w-3.5 h-3.5 text-[#D27D4F]" /><span>Export</span></button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FBEEE1] hover:bg-[#F9E8E0] text-[#8B4A5A] text-xs font-medium border border-[#EEC37D]/12 cursor-pointer"><Upload className="w-3.5 h-3.5 text-[#D27D4F]" /><span>Import</span><input type="file" accept=".json" onChange={handleImportJSON} className="hidden" /></label>
              <button onClick={handleOpenAddQuestion} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-gold-primary text-xs font-bold shadow-sm cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Add Question</span></button>
            </div>
          </div>
          <div className="samavaya-card rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FBEEE1] text-[#8B4A5A] border-b border-[#EEC37D]/12"><tr><th className="py-2.5 px-4">Level</th><th className="py-2.5 px-4">Prize</th><th className="py-2.5 px-4">Question</th><th className="py-2.5 px-4">Correct</th><th className="py-2.5 px-4">Timer</th><th className="py-2.5 px-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#EEC37D]/10">
                  {questions.map((q, idx) => (
                    <tr key={q.id || idx} className="hover:bg-[#EEC37D]/5">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#D27D4F]">Q{idx + 1}</td>
                      <td className="py-2.5 px-4 font-medium text-[#31124A]">{q.prize}</td>
                      <td className="py-2.5 px-4 text-[#8B4A5A] max-w-sm truncate">{q.question}</td>
                      <td className="py-2.5 px-4 font-mono text-[#66BB6A]">{String.fromCharCode(65 + q.correctAnswer)}: {q.options[q.correctAnswer]}</td>
                      <td className="py-2.5 px-4 font-mono text-[#8B4A5A]">{q.timeLimit || 30}s</td>
                      <td className="py-2.5 px-4 text-right"><div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingQuestion(q); setIsQuestionModalOpen(true); }} className="p-1 rounded-lg hover:bg-[#D27D4F]/10 text-[#D27D4F] cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-1 rounded-lg hover:bg-[#B00070]/10 text-[#B00070] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="samavaya-card rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs font-bold text-[#31124A] mb-2 flex items-center gap-2"><UserPlus className="w-4 h-4 text-[#D27D4F]" />Provision Team Account</h3>
              <p className="text-[11px] text-[#8B4A5A] mb-3">Contestants log in only with admin-provisioned accounts.</p>
              <form onSubmit={handleAddSingleUser} className="space-y-2.5 text-xs">
                <div><label className="block text-[#543C5B] mb-1">Username</label><input type="text" required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="e.g. team_alfa" className="w-full px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none focus:border-[#EEC37D]" /></div>
                <div><label className="block text-[#543C5B] mb-1">Password</label><input type="text" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="e.g. secret123" className="w-full px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none focus:border-[#EEC37D]" /></div>
                <div><label className="block text-[#543C5B] mb-1">Display Name (Optional)</label><input type="text" value={newUser.displayName} onChange={e => setNewUser({ ...newUser, displayName: e.target.value })} placeholder="e.g. Rahul & Priya" className="w-full px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none focus:border-[#EEC37D]" /></div>
                <button type="submit" className="w-full py-2.5 btn-gold-primary text-xs font-bold shadow-sm cursor-pointer mt-2">Create Team Account</button>
              </form>
            </div>
            <div className="samavaya-card rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#31124A] mb-1 flex items-center gap-2"><Users className="w-4 h-4 text-[#D27D4F]" />Bulk Generator</h3>
                <p className="text-[11px] text-[#8B4A5A] mb-3">Generate <code className="text-[#D27D4F]">team1</code> to <code className="text-[#D27D4F]">team{bulkCount}</code> accounts.</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><label className="block text-[#543C5B] mb-1">Prefix</label><input type="text" value={bulkPrefix} onChange={e => setBulkPrefix(e.target.value)} className="w-full px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none" /></div>
                  <div><label className="block text-[#543C5B] mb-1">Count</label><input type="number" min="1" max="100" value={bulkCount} onChange={e => setBulkCount(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none" /></div>
                  <div><label className="block text-[#543C5B] mb-1">Password</label><input type="text" value={bulkPass} onChange={e => setBulkPass(e.target.value)} className="w-full px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none" /></div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <button onClick={handleGenerateBulk} className="w-full py-2.5 bg-[#D27D4F]/10 hover:bg-[#D27D4F]/20 text-[#D27D4F] border border-[#D27D4F]/20 font-bold rounded-xl text-xs shadow-sm cursor-pointer">Generate {bulkCount} Teams</button>
                <button onClick={handleResetScores} className="w-full py-2 bg-[#B00070]/6 hover:bg-[#B00070]/12 text-[#B00070] font-semibold rounded-xl text-xs cursor-pointer">Reset All Scores</button>
              </div>
            </div>
          </div>
          <div className="samavaya-card rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-[#EEC37D]/12 flex items-center justify-between"><h3 className="text-xs font-bold text-[#31124A]">Authorized Teams ({participants.length})</h3><span className="text-[11px] text-[#8B4A5A]">Synced to Firebase</span></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FBEEE1] text-[#8B4A5A] border-b border-[#EEC37D]/12"><tr><th className="py-2.5 px-3">Username</th><th className="py-2.5 px-3">Password</th><th className="py-2.5 px-3">Display Name</th><th className="py-2.5 px-3">Score</th><th className="py-2.5 px-3">Lifelines</th><th className="py-2.5 px-3 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-[#EEC37D]/10">
                  {participants.length === 0 ? <tr><td colSpan={6} className="py-6 text-center text-[#C4A0AB]">No teams yet.</td></tr> : (
                    participants.map(p => {
                      const ll = [!p.lifelines?.fiftyFifty && "50:50", !p.lifelines?.audiencePoll && "Poll", !p.lifelines?.flip && "Flip"].filter(Boolean).join(", ") || "None";
                      return (
                        <tr key={p.username} className="hover:bg-[#EEC37D]/5">
                          <td className="py-2 px-3 font-mono font-bold text-[#D27D4F]">{p.username}</td>
                          <td className="py-2 px-3 font-mono text-[#8B4A5A]">{p.password}</td>
                          <td className="py-2 px-3 text-[#31124A]">{p.displayName || p.username}</td>
                          <td className="py-2 px-3 font-mono font-bold text-[#D27D4F]">{p.score || 0} pts</td>
                          <td className="py-2 px-3 text-[#8B4A5A]">{ll}</td>
                          <td className="py-2 px-3 text-right"><button onClick={() => handleDeleteUser(p.username)} className="text-[#B00070] hover:text-red-700 p-1 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          <div className="samavaya-card rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2.5 mb-3"><ShieldCheck className="w-4 h-4 text-[#66BB6A]" /><h3 className="text-xs font-bold text-[#31124A]">Admin Security</h3></div>
            <div className="p-3 bg-[#66BB6A]/8 border border-[#66BB6A]/18 rounded-xl text-xs space-y-1.5 mb-3">
              <p className="text-[#31124A] font-medium">✓ Admin password is secured with SHA-256 hashing</p>
              <p className="text-[#543C5B]">The admin password is stored as a cryptographic hash in Firebase. It cannot be viewed, recovered, or changed from this console.</p>
            </div>
            <p className="text-[11px] text-[#8B4A5A]">To change the admin password, update the source code and redeploy.</p>
          </div>
          <div className="samavaya-card rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2.5 mb-3"><Database className="w-4 h-4 text-[#D27D4F]" /><h3 className="text-xs font-bold text-[#31124A]">Firebase Connection</h3></div>
            <div className="p-3 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-xs space-y-1 mb-4">
              <p className="text-[#31124A]">Status: {isFirebaseActive ? <span className="text-[#66BB6A] font-bold">● Connected to {fbConfig.projectId}</span> : <span className="text-[#D27D4F] font-bold">● Local Fallback Mode</span>}</p>
              <p className="text-[#8B4A5A] font-mono text-[11px]">Project: {fbConfig.projectId || "quiz-jose-92227"}</p>
            </div>
            <p className="text-[11px] text-[#8B4A5A]">Firebase connects Expressions quiz to Google Cloud Firestore for real-time multi-device sync.</p>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E0D33]/25 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-[#EEC37D]/20 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] p-6 text-xs">
            <h3 className="text-sm font-bold text-gold-gradient mb-4 font-serif">{editingQuestion.id ? `Edit Question (Level ${editingQuestion.level})` : 'New Question'}</h3>
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div><label className="block text-[#543C5B] mb-1">Question Text</label><textarea required rows={3} value={editingQuestion.question} onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })} className="w-full px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none focus:border-[#EEC37D]" /></div>
              <div className="space-y-2">
                <label className="block text-[#543C5B]">Options & Correct Answer</label>
                {editingQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correctAnswer" checked={editingQuestion.correctAnswer === i} onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: i })} className="text-[#D27D4F] cursor-pointer" />
                    <span className="font-mono font-bold text-[#D27D4F] w-5">{String.fromCharCode(65 + i)}:</span>
                    <input type="text" required value={opt} onChange={e => { const o = [...editingQuestion.options]; o[i] = e.target.value; setEditingQuestion({ ...editingQuestion, options: o }); }} className="flex-1 px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-[#543C5B] mb-1">Prize</label><input type="text" value={editingQuestion.prize} onChange={e => setEditingQuestion({ ...editingQuestion, prize: e.target.value })} className="w-full px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none" /></div>
                <div><label className="block text-[#543C5B] mb-1">Timer (s)</label><input type="number" value={editingQuestion.timeLimit || 30} onChange={e => setEditingQuestion({ ...editingQuestion, timeLimit: parseInt(e.target.value) || 30 })} className="w-full px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none" /></div>
                <div><label className="block text-[#543C5B] mb-1">Category</label><input type="text" value={editingQuestion.category || ''} onChange={e => setEditingQuestion({ ...editingQuestion, category: e.target.value })} className="w-full px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none" /></div>
              </div>
              <div><label className="block text-[#543C5B] mb-1">Explanation</label><textarea rows={2} value={editingQuestion.explanation || ''} onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })} className="w-full px-3 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-[#31124A] outline-none" /></div>
              <div className="p-3 bg-[#FBEEE1] rounded-xl border border-[#EEC37D]/12 space-y-2">
                <span className="font-bold text-[#D27D4F] block">Backup Flip Question</span>
                <input type="text" placeholder="Alternative question text" value={editingQuestion.flipQuestion?.question || ''} onChange={e => setEditingQuestion({ ...editingQuestion, flipQuestion: { ...(editingQuestion.flipQuestion || {}), question: e.target.value } })} className="w-full px-3 py-1.5 bg-white border border-[#EEC37D]/15 rounded-lg text-[#31124A] outline-none" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EEC37D]/12">
                <button type="button" onClick={() => setIsQuestionModalOpen(false)} className="px-4 py-2 bg-[#FBEEE1] text-[#8B4A5A] rounded-xl hover:bg-[#F9E8E0]">Cancel</button>
                <button type="submit" className="px-5 py-2 btn-gold-primary text-xs font-bold rounded-xl shadow-sm cursor-pointer">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
