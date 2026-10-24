import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ParticipantView from './components/ParticipantView';
import AdminPanel from './components/AdminPanel';
import AuditoriumView from './components/AuditoriumView';
import LoginModal from './components/LoginModal';
import LeaderboardModal from './components/LeaderboardModal';

import { 
  subscribeGameState, 
  subscribeQuestions, 
  subscribeParticipants, 
  subscribeQuestionResponses,
  subscribeAdminPasswordHash,
  INITIAL_GAME_STATE 
} from './services/quizService';
import { DEFAULT_QUESTIONS } from './data/defaultQuestions';

function getRouteFromLocation() {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  if (path.endsWith('/project') || hash.includes('project') || search.includes('page=project')) return 'auditorium';
  if (path.endsWith('/console') || hash.includes('console') || search.includes('page=console')) return 'admin';
  return 'contestant';
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(getRouteFromLocation);
  const [currentUser, setCurrentUser] = useState(() => {
    try { const s = localStorage.getItem('quiz_active_user'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [adminUser, setAdminUser] = useState(() => {
    try { const s = localStorage.getItem('quiz_admin_auth'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [adminPasswordHash, setAdminPasswordHash] = useState(null);
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [participants, setParticipants] = useState([]);
  const [allResponses, setAllResponses] = useState({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  useEffect(() => {
    const h = () => setCurrentRoute(getRouteFromLocation());
    window.addEventListener('popstate', h);
    window.addEventListener('hashchange', h);
    return () => { window.removeEventListener('popstate', h); window.removeEventListener('hashchange', h); };
  }, []);

  useEffect(() => { const u = subscribeAdminPasswordHash(h => { if (h) setAdminPasswordHash(h); }); return () => u && u(); }, []);
  useEffect(() => { const u = subscribeGameState(s => setGameState(s || INITIAL_GAME_STATE)); return () => u && u(); }, []);
  useEffect(() => { const u = subscribeQuestions(q => { if (q?.length) setQuestions(q); }); return () => u && u(); }, []);
  useEffect(() => {
    const u = subscribeParticipants(list => {
      setParticipants(list || []);
      if (currentUser && !currentUser.isAdmin) {
        const found = list?.find(u => u.username?.toLowerCase() === currentUser.username?.toLowerCase());
        if (found) setCurrentUser(prev => ({ ...prev, ...found }));
      }
    });
    return () => u && u();
  }, [currentUser?.username]);
  useEffect(() => {
    const qId = gameState.activeQuestionId || `q-${gameState.currentQuestionIndex + 1}`;
    const u = subscribeQuestionResponses(qId, r => setAllResponses(r || {}));
    return () => u && u();
  }, [gameState.activeQuestionId, gameState.currentQuestionIndex]);

  const handleContestantLoginSuccess = (user) => { setCurrentUser(user); try { localStorage.setItem('quiz_active_user', JSON.stringify(user)); } catch {} };
  const handleAdminLoginSuccess = (user) => { setAdminUser(user); try { localStorage.setItem('quiz_admin_auth', JSON.stringify(user)); } catch {} };
  const handleLogout = () => {
    if (currentRoute === 'admin') { setAdminUser(null); try { localStorage.removeItem('quiz_admin_auth'); } catch {} }
    else { setCurrentUser(null); try { localStorage.removeItem('quiz_active_user'); } catch {} }
  };

  return (
    <div className="min-h-screen w-full flex flex-col samavaya-bg text-[#31124A] selection:bg-[#EEC37D]/30 selection:text-[#1E0D33]">
      <Header currentRole={currentRoute} currentUser={currentRoute === 'admin' ? adminUser : currentUser}
        onLogout={handleLogout} onOpenLogin={() => setIsLoginModalOpen(true)} onOpenLeaderboard={() => setIsLeaderboardOpen(true)} />

      <main className="flex-1 flex flex-col w-full relative">
        {currentRoute === 'contestant' && (
          <ParticipantView gameState={gameState} questions={questions} currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)} allResponses={allResponses} />
        )}
        {currentRoute === 'auditorium' && (
          <AuditoriumView gameState={gameState} questions={questions} allResponses={allResponses} participants={participants} />
        )}
        {currentRoute === 'admin' && (
          <>
            {adminUser ? (
              <AdminPanel gameState={gameState} questions={questions} participants={participants} allResponses={allResponses} />
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full p-8 text-center samavaya-card rounded-3xl">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#4C1B56]/8 border border-[#4C1B56]/15 flex items-center justify-center text-[#D27D4F]">🔒</div>
                  <h3 className="text-lg font-bold text-[#31124A] mb-1 font-serif">Host Console Locked</h3>
                  <p className="text-xs text-[#8B4A5A] mb-5 leading-relaxed">
                    This control panel is restricted to the Josephest 2026 Samavaya Expressions quiz master. Authenticate with your master key.
                  </p>
                  <button onClick={() => setIsLoginModalOpen(true)} className="w-full py-3 btn-gold-primary text-xs font-bold shadow-md cursor-pointer">
                    Enter Admin Password
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={currentRoute === 'admin' ? handleAdminLoginSuccess : handleContestantLoginSuccess}
        participants={participants} adminPasswordHash={adminPasswordHash} role={currentRoute === 'admin' ? 'admin' : 'contestant'} />
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} participants={participants} />
    </div>
  );
}
