import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, User, Wifi, WifiOff, LogOut, Trophy } from 'lucide-react';
import sjcLogo from '../assets/sjc-logo.png';
import { sounds } from '../utils/soundEffects';
import { isFirebaseActive } from '../services/firebaseConfig';

export default function Header({ currentRole, currentUser, onLogout, onOpenLogin, onOpenLeaderboard }) {
  const [isMuted, setIsMuted] = useState(!sounds.enabled);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSound = () => { const e = sounds.toggleSound(); setIsMuted(!e); };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(() => {}); setIsFullscreen(true); }
    else { document.exitFullscreen?.(); setIsFullscreen(false); }
  };

  return (
    <header className="w-full bg-white/88 backdrop-blur-md border-b border-[#EEC37D]/20 px-4 py-2.5 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#A06451] via-[#D27D4F] to-[#EEC37D] p-[1.5px] shadow-md">
            <div className="w-full h-full rounded-2xl bg-white p-1 flex items-center justify-center overflow-hidden">
              <img src={sjcLogo} alt="St. Joseph's College Crest" className="w-full h-full object-contain filter drop-shadow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold tracking-tight text-gold-gradient font-serif">Josephest 2026</h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#4C1B56]/8 text-[#4C1B56] border border-[#4C1B56]/15 rounded-md tracking-wider uppercase">
                Samavaya
              </span>
              {currentRole === 'contestant' && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#EEC37D]/15 text-[#D27D4F] border border-[#EEC37D]/30 rounded-md">
                  Expressions
                </span>
              )}
              {currentRole === 'auditorium' && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#4C1B56]/10 text-[#4C1B56] border border-[#4C1B56]/20 rounded-md">
                  Stage Projector
                </span>
              )}
              {currentRole === 'admin' && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#4C1B56] text-white font-bold rounded-md">
                  Host Console
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8B4A5A] flex items-center gap-1.5 font-medium">
              <span>St. Joseph's College, Allahabad</span>
              <span>•</span>
              {isFirebaseActive ? (
                <span className="flex items-center text-[#66BB6A] gap-1 text-[10px]"><Wifi className="w-2.5 h-2.5" /> Synced</span>
              ) : (
                <span className="flex items-center text-[#D27D4F] gap-1 text-[10px]"><WifiOff className="w-2.5 h-2.5" /> Local Sync</span>
              )}
            </p>
          </div>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-2">
          <button onClick={onOpenLeaderboard} className="p-2 rounded-xl bg-[#EEC37D]/10 border border-[#EEC37D]/20 text-[#D27D4F] hover:bg-[#EEC37D]/20 transition-colors cursor-pointer" title="Leaderboard">
            <Trophy className="w-4 h-4" />
          </button>
          <button onClick={toggleSound} className="p-2 rounded-xl bg-[#EEC37D]/10 border border-[#EEC37D]/20 text-[#D27D4F] hover:bg-[#EEC37D]/20 transition-colors cursor-pointer" title={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button onClick={toggleFullscreen} className="p-2 rounded-xl bg-[#EEC37D]/10 border border-[#EEC37D]/20 text-[#8B4A5A] hover:text-[#31124A] hover:bg-[#EEC37D]/20 transition-colors cursor-pointer" title="Fullscreen">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {currentRole !== 'auditorium' && (
            <>
              {currentUser ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[#EEC37D]/20">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-[#31124A] truncate max-w-[120px]">{currentUser.displayName || currentUser.username}</p>
                    <p className="text-[10px] text-[#8B4A5A]">{currentUser.isAdmin ? "Host Master" : (currentUser.college || "Team")}</p>
                  </div>
                  <button onClick={onLogout} className="p-2 rounded-xl bg-[#B00070]/8 border border-[#B00070]/15 text-[#B00070] hover:bg-[#B00070]/15 transition-colors cursor-pointer" title="Logout">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={onOpenLogin} className="px-3.5 py-1.5 rounded-xl btn-gold-primary text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <User className="w-3.5 h-3.5" /> <span>Team Login</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
