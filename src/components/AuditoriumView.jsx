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

    if (!gameState.timerStartedAt) {
      setTimeRemaining(currentQ?.timeLimit || 30);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameState.timerStartedAt) / 1000);
      const remaining = Math.max(0, (gameState.timerDuration || 30) - elapsed);
      setTimeRemaining(remaining);

      if (remaining > 0 && remaining <= 5) {
        sounds.playTick(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.status, gameState.timerStartedAt, gameState.timerDuration, currentQ]);

  useEffect(() => {
    if (gameState.status === 'ANSWER_REVEALED') {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
    }
  }, [gameState.status]);

  const pollDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0];
    let total = 0;
    Object.values(allResponses).forEach(r => {
      if (r.selectedOption >= 0 && r.selectedOption <= 3) {
        counts[r.selectedOption]++;
        total++;
      }
    });

    if (total > 0) {
      return counts.map(c => Math.round((c / total) * 100));
    }
    const correct = currentQ?.correctAnswer ?? 0;
    const base = [12, 16, 14, 18];
    base[correct] += 40;
    return base;
  }, [allResponses, currentQ]);

  const topContestants = useMemo(() => {
    return [...participants].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
  }, [participants]);

  // Compute team response tracking
  const contestantLockedList = useMemo(() => {
    return participants.map(p => {
      const submission = allResponses[p.username.toLowerCase()];
      return {
        username: p.username,
        displayName: p.displayName || p.username,
        college: p.college,
        hasLocked: !!submission,
        selectedOption: submission ? submission.selectedOption : -1,
        timeTakenMs: submission ? submission.timeTakenMs : null,
        isCorrect: submission ? submission.isCorrect : false,
        pointsEarned: submission ? submission.pointsEarned : 0
      };
    });
  }, [participants, allResponses]);

  const lockedCount = contestantLockedList.filter(c => c.hasLocked).length;
  const isRevealed = gameState.status === 'ANSWER_REVEALED';

  // AUDITORIUM LOBBY
  if (gameState.status === 'LOBBY') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-6 rounded-3xl bg-gradient-to-tr from-[#5B6BC0] via-[#7C4DFF] to-[#9575CD] p-1 shadow-2xl">
          <div className="w-full h-full rounded-3xl bg-white p-2 flex items-center justify-center overflow-hidden">
            <img 
              src={sjcLogo} 
              alt="St. Joseph's College Allahabad" 
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
          </div>
        </div>

        <span className="text-xs md:text-sm font-semibold tracking-widest uppercase text-[#5B6BC0] mb-1">
          St. Joseph's College, Allahabad
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-gold-gradient font-serif uppercase tracking-widest mb-3">
          Expressions 2026
        </h1>
        <p className="text-base md:text-xl text-[#6E7599] font-medium mb-8">
          Josephest Quiz Championship
        </p>

        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-[#4DD0A1]/10 border border-[#4DD0A1]/25 rounded-2xl text-[#4DD0A1] font-semibold text-sm shadow-md animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4DD0A1] animate-ping" />
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
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-[#5B6BC0]/10 border border-[#5B6BC0]/15 p-1 flex items-center justify-center">
            <img src={sjcLogo} alt="SJC" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs text-[#5B6BC0] tracking-wider uppercase font-semibold">
            St. Joseph's College • Expressions 2026
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-gold-gradient font-serif mt-1">
            Tournament Standings
          </h2>
        </div>

        <div className="w-full samavaya-card rounded-3xl p-6 shadow-xl space-y-2.5">
          {topContestants.length === 0 ? (
            <p className="text-center text-[#A8B0CC] text-xs py-6">No scores registered yet.</p>
          ) : (
            topContestants.map((user, idx) => {
              const isFirst = idx === 0;
              return (
                <div
                  key={user.username}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isFirst 
                      ? 'bg-[#5B6BC0]/8 border-[#5B6BC0]/25 shadow-sm' 
                      : 'bg-[#F0F2F8]/60 border-[#5B6BC0]/8'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isFirst ? 'bg-[#5B6BC0] text-white' : 'bg-[#F0F2F8] text-[#6E7599]'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#2D3250]">{user.displayName || user.username}</p>
                      <p className="text-[11px] text-[#6E7599]">{user.college || "Team"}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-gold-metallic">
                      {user.score || 0} pts
                    </span>
                    <span className="block text-[10px] text-[#5B6BC0]">
                      Level {user.currentLevel || 1}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // AUDITORIUM QUESTION SCREEN WITH CONTESTANT ANSWERS
  return (
    <div className="flex-1 flex flex-col justify-between p-4 md:p-8 max-w-6xl mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 samavaya-card rounded-3xl p-4 md:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#5B6BC0]/10 border border-[#5B6BC0]/15 p-1 flex items-center justify-center">
            <img src={sjcLogo} alt="SJC" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#5B6BC0] font-semibold block">
              Expressions 2026 • Question {gameState.currentQuestionIndex + 1}
            </span>
            <span className="text-xl md:text-3xl font-bold text-gold-metallic">
              {ladderItem.prize}
            </span>
          </div>
        </div>

        {/* Live Lock Counter */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#F0F2F8] border border-[#5B6BC0]/15 rounded-2xl text-xs">
          <Users className="w-4 h-4 text-[#5B6BC0]" />
          <span className="text-[#6E7599]">Teams Responded:</span>
          <span className="font-bold text-[#5B6BC0]">{lockedCount} / {participants.length}</span>
        </div>

        <div className="flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-white border border-[#5B6BC0]/20 shadow-sm">
          <Clock className={`w-6 h-6 ${timeRemaining <= 5 ? 'text-[#FF7A8A] animate-spin' : 'text-[#5B6BC0]'}`} />
          <span className={`text-2xl md:text-3xl font-mono font-bold ${timeRemaining <= 5 ? 'text-[#FF7A8A] animate-pulse' : 'text-[#5B6BC0]'}`}>
            {timeRemaining}s
          </span>
        </div>
      </div>

      {/* Main Big Question Box */}
      <div className="my-5">
        <div className="quiz-question-minimal p-6 md:p-10 min-h-[140px] flex items-center justify-center text-center">
          <h2 className="text-xl md:text-3xl font-semibold text-[#2D3250] leading-relaxed max-w-3xl">
            {currentQ?.question}
          </h2>
        </div>
      </div>

      {/* 4 Minimalist Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
        {currentQ?.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isCorrect = idx === currentQ.correctAnswer;
          const pollPct = pollDistribution[idx] || 0;

          let cardClass = "quiz-option-minimal";
          if (isRevealed && isCorrect) cardClass += " correct";

          return (
            <div
              key={idx}
              className={`min-h-[64px] px-6 py-3.5 flex items-center justify-between ${cardClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[#5B6BC0] font-bold text-base md:text-lg font-mono">
                  {letter}:
                </span>
                <span className="text-sm md:text-base font-medium text-[#2D3250]">
                  {option}
                </span>
              </div>

              {gameState.showAudiencePoll && (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-[#F0F2F8] rounded-full overflow-hidden border border-[#5B6BC0]/15">
                    <div
                      className="h-full bg-[#5B6BC0] transition-all duration-500"
                      style={{ width: `${pollPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#5B6BC0]">
                    {pollPct}%
                  </span>
                </div>
              )}

              {isRevealed && isCorrect && (
                <CheckCircle className="w-5 h-5 text-[#4DD0A1]" />
              )}
            </div>
          );
        })}
      </div>

      {/* STAGE AUDITORIUM: LIVE CONTESTANT LOCKED ANSWERS PANEL */}
      {contestantLockedList.length > 0 && (
        <div className="samavaya-card rounded-2xl p-4 mt-2">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#5B6BC0]/10">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#5B6BC0]" />
              <h3 className="text-xs font-bold text-[#2D3250]">
                {isRevealed ? "Contestant Answers Revealed" : "Contestant Lock Status"}
              </h3>
            </div>
            <span className="text-[11px] text-[#5B6BC0] font-mono">
              {lockedCount} of {participants.length} locked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {contestantLockedList.map((team) => {
              if (isRevealed) {
                // When answer is revealed: Show team's selected option and correctness
                const optionLetter = team.selectedOption >= 0 ? String.fromCharCode(65 + team.selectedOption) : "None";
                const isCorrect = team.selectedOption === currentQ.correctAnswer;

                return (
                  <div
                    key={team.username}
                    className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isCorrect 
                        ? 'bg-[#4DD0A1]/10 border-[#4DD0A1]/30 text-[#2D3250]' 
                        : team.hasLocked 
                          ? 'bg-[#FF7A8A]/8 border-[#FF7A8A]/20 text-[#2D3250]' 
                          : 'bg-[#F0F2F8]/60 border-[#5B6BC0]/8 text-[#A8B0CC]'
                    }`}
                  >
                    <div className="truncate max-w-[80px]">
                      <span className="font-semibold block truncate">{team.displayName || team.username}</span>
                      <span className="text-[10px] font-mono opacity-70">
                        {team.hasLocked ? `Option ${optionLetter}` : "No Answer"}
                      </span>
                    </div>
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-[#4DD0A1] shrink-0" />
                    ) : team.hasLocked ? (
                      <XCircle className="w-4 h-4 text-[#FF7A8A] shrink-0" />
                    ) : (
                      <span className="text-[10px] text-[#A8B0CC] shrink-0">—</span>
                    )}
                  </div>
                );
              }

              // While question is active / locked: Show who has locked their answer
              return (
                <div
                  key={team.username}
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    team.hasLocked 
                      ? 'bg-[#5B6BC0]/8 border-[#5B6BC0]/25 text-[#5B6BC0]' 
                      : 'bg-[#F0F2F8]/60 border-[#5B6BC0]/8 text-[#A8B0CC]'
                  }`}
                >
                  <div className="truncate max-w-[85px]">
                    <span className="font-semibold block truncate">{team.displayName || team.username}</span>
                    <span className="text-[10px] font-mono opacity-70">
                      {team.hasLocked ? `${(team.timeTakenMs / 1000).toFixed(1)}s` : "Thinking..."}
                    </span>
                  </div>
                  {team.hasLocked ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5B6BC0]/10 border border-[#5B6BC0]/20 text-[#5B6BC0] font-bold">
                      🔒 Locked
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#A8B0CC] animate-pulse">
                      ⏳ ...
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
