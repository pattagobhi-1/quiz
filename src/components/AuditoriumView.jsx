import React, { useEffect, useState, useMemo } from 'react';
import { Clock, Trophy, CheckCircle, XCircle, Lock, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import sjcLogo from '../assets/sjc-logo.png';
import { PRIZE_LADDER } from '../data/defaultQuestions';
import { sounds } from '../utils/soundEffects';

export default function AuditoriumView({ gameState, questions, allResponses = {}, participants = [] }) {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const currentQ = questions[gameState.currentQuestionIndex] || questions[0];
  const ladderItem = PRIZE_LADDER[gameState.currentQuestionIndex] || { prize: "₹1,000" };

  useEffect(() => {
    if (gameState.status !== 'QUESTION_ACTIVE') return;
    if (!gameState.timerStartedAt) { setTimeRemaining(currentQ?.timeLimit || 30); return; }
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameState.timerStartedAt) / 1000);
      const remaining = Math.max(0, (gameState.timerDuration || 30) - elapsed);
      setTimeRemaining(remaining);
      if (remaining > 0 && remaining <= 5) sounds.playTick(true);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.status, gameState.timerStartedAt, gameState.timerDuration, currentQ]);

  useEffect(() => { if (gameState.status === 'ANSWER_REVEALED') confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } }); }, [gameState.status]);

  const pollDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0]; let total = 0;
    Object.values(allResponses).forEach(r => { if (r.selectedOption >= 0 && r.selectedOption <= 3) { counts[r.selectedOption]++; total++; } });
    if (total > 0) return counts.map(c => Math.round((c / total) * 100));
    const correct = currentQ?.correctAnswer ?? 0;
    const base = [12, 16, 14, 18]; base[correct] += 40;
    return base;
  }, [allResponses, currentQ]);

  const topContestants = useMemo(() => [...participants].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10), [participants]);

  const contestantLockedList = useMemo(() => participants.map(p => {
    const sub = allResponses[p.username.toLowerCase()];
    return { username: p.username, displayName: p.displayName || p.username, college: p.college, hasLocked: !!sub, selectedOption: sub ? sub.selectedOption : -1, timeTakenMs: sub ? sub.timeTakenMs : null, isCorrect: sub ? sub.isCorrect : false, pointsEarned: sub ? sub.pointsEarned : 0 };
  }), [participants, allResponses]);

  const lockedCount = contestantLockedList.filter(c => c.hasLocked).length;
  const isRevealed = gameState.status === 'ANSWER_REVEALED';

  // LOBBY
  if (gameState.status === 'LOBBY') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-6 rounded-3xl bg-gradient-to-tr from-[#A06451] via-[#D27D4F] to-[#EEC37D] p-1 shadow-2xl">
          <div className="w-full h-full rounded-3xl bg-white p-2 flex items-center justify-center overflow-hidden">
            <img src={sjcLogo} alt="St. Joseph's College Allahabad" className="w-full h-full object-contain filter drop-shadow-lg" />
          </div>
        </div>
        <span className="text-xs md:text-sm font-semibold tracking-widest uppercase text-[#4C1B56] mb-1">St. Joseph's College, Allahabad</span>
        <h1 className="text-4xl md:text-6xl font-black text-gold-gradient font-serif uppercase tracking-widest mb-1">Samavaya</h1>
        <p className="text-lg md:text-2xl font-semibold text-[#D27D4F] mb-1">Expressions 2026</p>
        <p className="text-base md:text-xl text-[#8B4A5A] font-medium mb-8">Josephest Quiz Championship</p>
        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-[#66BB6A]/10 border border-[#66BB6A]/25 rounded-2xl text-[#66BB6A] font-semibold text-sm shadow-md animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-[#66BB6A] animate-ping" />
          <span>Stage Projector Ready • Waiting for Quiz Master</span>
        </div>
      </div>
    );
  }

  // LEADERBOARD
  if (gameState.status === 'LEADERBOARD' || gameState.status === 'COMPLETED') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-[#EEC37D]/12 border border-[#EEC37D]/20 p-1 flex items-center justify-center">
            <img src={sjcLogo} alt="SJC" className="w-full h-full object-contain" />
          </div>
          <span className="text-[10px] text-[#4C1B56] tracking-wider uppercase font-semibold">Samavaya • Expressions 2026</span>
          <h2 className="text-2xl md:text-4xl font-bold text-gold-gradient font-serif mt-1">Tournament Standings</h2>
        </div>
        <div className="w-full samavaya-card rounded-3xl p-6 shadow-xl space-y-2.5">
          {topContestants.length === 0 ? <p className="text-center text-[#C4A0AB] text-xs py-6">No scores registered yet.</p> : (
            topContestants.map((user, idx) => {
              const isFirst = idx === 0;
              return (
                <div key={user.username} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${isFirst ? 'bg-[#EEC37D]/10 border-[#EEC37D]/30 shadow-sm' : 'bg-[#FBEEE1]/60 border-[#EEC37D]/10'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${isFirst ? 'bg-gradient-to-br from-[#D27D4F] to-[#EEC37D] text-white' : 'bg-[#FBEEE1] text-[#8B4A5A]'}`}>{idx + 1}</span>
                    <div><p className="text-sm font-semibold text-[#31124A]">{user.displayName || user.username}</p><p className="text-[11px] text-[#8B4A5A]">{user.college || "Team"}</p></div>
                  </div>
                  <div className="text-right"><span className="text-base font-bold text-gold-metallic">{user.score || 0} pts</span><span className="block text-[10px] text-[#D27D4F]">Level {user.currentLevel || 1}</span></div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // QUESTION SCREEN
  return (
    <div className="flex-1 flex flex-col justify-between p-4 md:p-8 max-w-6xl mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 samavaya-card rounded-3xl p-4 md:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EEC37D]/12 border border-[#EEC37D]/20 p-1 flex items-center justify-center">
            <img src={sjcLogo} alt="SJC" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#4C1B56] font-semibold block">Samavaya • Expressions • Question {gameState.currentQuestionIndex + 1}</span>
            <span className="text-xl md:text-3xl font-bold text-gold-metallic">{ladderItem.prize}</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-2xl text-xs">
          <Users className="w-4 h-4 text-[#D27D4F]" /><span className="text-[#8B4A5A]">Teams Responded:</span><span className="font-bold text-[#D27D4F]">{lockedCount} / {participants.length}</span>
        </div>
        <div className="flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-white border border-[#EEC37D]/25 shadow-sm">
          <Clock className={`w-6 h-6 ${timeRemaining <= 5 ? 'text-[#B00070] animate-spin' : 'text-[#D27D4F]'}`} />
          <span className={`text-2xl md:text-3xl font-mono font-bold ${timeRemaining <= 5 ? 'text-[#B00070] animate-pulse' : 'text-[#D27D4F]'}`}>{timeRemaining}s</span>
        </div>
      </div>

      {/* Question */}
      <div className="my-5">
        <div className="quiz-question-minimal p-6 md:p-10 min-h-[140px] flex items-center justify-center text-center">
          <h2 className="text-xl md:text-3xl font-semibold text-[#31124A] leading-relaxed max-w-3xl">{currentQ?.question}</h2>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
        {currentQ?.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isCorrect = idx === currentQ.correctAnswer;
          const pollPct = pollDistribution[idx] || 0;
          let cardClass = "quiz-option-minimal";
          if (isRevealed && isCorrect) cardClass += " correct";
          return (
            <div key={idx} className={`min-h-[64px] px-6 py-3.5 flex items-center justify-between ${cardClass}`}>
              <div className="flex items-center gap-3">
                <span className="text-[#D27D4F] font-bold text-base md:text-lg font-mono">{letter}:</span>
                <span className="text-sm md:text-base font-medium text-[#31124A]">{option}</span>
              </div>
              {gameState.showAudiencePoll && (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-[#FBEEE1] rounded-full overflow-hidden border border-[#EEC37D]/15">
                    <div className="h-full bg-gradient-to-r from-[#D27D4F] to-[#EEC37D] transition-all duration-500" style={{ width: `${pollPct}%` }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#D27D4F]">{pollPct}%</span>
                </div>
              )}
              {isRevealed && isCorrect && <CheckCircle className="w-5 h-5 text-[#66BB6A]" />}
            </div>
          );
        })}
      </div>

      {/* Contestant Lock Panel */}
      {contestantLockedList.length > 0 && (
        <div className="samavaya-card rounded-2xl p-4 mt-2">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#EEC37D]/12">
            <div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-[#D27D4F]" /><h3 className="text-xs font-bold text-[#31124A]">{isRevealed ? "Contestant Answers Revealed" : "Contestant Lock Status"}</h3></div>
            <span className="text-[11px] text-[#D27D4F] font-mono">{lockedCount} of {participants.length} locked</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {contestantLockedList.map(team => {
              if (isRevealed) {
                const optionLetter = team.selectedOption >= 0 ? String.fromCharCode(65 + team.selectedOption) : "None";
                const correct = team.selectedOption === currentQ.correctAnswer;
                return (
                  <div key={team.username} className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${correct ? 'bg-[#66BB6A]/10 border-[#66BB6A]/25 text-[#31124A]' : team.hasLocked ? 'bg-[#B00070]/6 border-[#B00070]/15 text-[#31124A]' : 'bg-[#FBEEE1]/60 border-[#EEC37D]/10 text-[#C4A0AB]'}`}>
                    <div className="truncate max-w-[80px]"><span className="font-semibold block truncate">{team.displayName}</span><span className="text-[10px] font-mono opacity-70">{team.hasLocked ? `Option ${optionLetter}` : "No Answer"}</span></div>
                    {correct ? <CheckCircle className="w-4 h-4 text-[#66BB6A] shrink-0" /> : team.hasLocked ? <XCircle className="w-4 h-4 text-[#B00070] shrink-0" /> : <span className="text-[10px] text-[#C4A0AB] shrink-0">—</span>}
                  </div>
                );
              }
              return (
                <div key={team.username} className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${team.hasLocked ? 'bg-[#D27D4F]/8 border-[#D27D4F]/20 text-[#D27D4F]' : 'bg-[#FBEEE1]/60 border-[#EEC37D]/10 text-[#C4A0AB]'}`}>
                  <div className="truncate max-w-[85px]"><span className="font-semibold block truncate">{team.displayName}</span><span className="text-[10px] font-mono opacity-70">{team.hasLocked ? `${(team.timeTakenMs / 1000).toFixed(1)}s` : "Thinking..."}</span></div>
                  {team.hasLocked ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D27D4F]/10 border border-[#D27D4F]/20 text-[#D27D4F] font-bold">🔒</span> : <span className="text-[10px] text-[#C4A0AB] animate-pulse">⏳</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
