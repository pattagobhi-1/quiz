import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  User, 
  Wifi, 
  WifiOff, 
  LogOut,
  Trophy
} from 'lucide-react';
import sjcLogo from '../assets/sjc-logo.png';
import { sounds } from '../utils/soundEffects';
import { isFirebaseActive } from '../services/firebaseConfig';

export default function Header({ 
  currentRole, 
  currentUser, 
  onLogout, 
  onOpenLogin,
  onOpenLeaderboard
}) {
  const [isMuted, setIsMuted] = useState(!sounds.enabled);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSound = () => {
    const enabled = sounds.toggleSound();
    setIsMuted(!enabled);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#5B6BC0]/10 px-4 py-2.5 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo with St. Joseph's College Crest */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5B6BC0] via-[#7C4DFF] to-[#9575CD] p-[1.5px] shadow-md">
            <div className="w-full h-full rounded-2xl bg-white p-1 flex items-center justify-center overflow-hidden">
              <img 
                src={sjcLogo} 
                alt="St. Joseph's College Crest" 
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold tracking-tight text-gold-gradient font-serif">
                Josephest 2026
              </h1>
              {currentRole === 'contestant' && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#5B6BC0]/10 text-[#5B6BC0] border border-[#5B6BC0]/20 rounded-md">
                  Expressions
                </span>
              )}
              {currentRole === 'auditorium' && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#7C4DFF]/10 text-[#7C4DFF] border border-[#7C4DFF]/20 rounded-md">
                  Stage Projector
                </span>
              )}
              {currentRole === 'admin' && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#5B6BC0] text-white font-bold rounded-md">
                  Host Console
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6E7599] flex items-center gap-1.5 font-medium">
              <span>St. Joseph's College, Allahabad</span>
              <span>•</span>
              {isFirebaseActive ? (
                <span className="flex items-center text-[#4DD0A1] gap-1 text-[10px]">
                  <Wifi className="w-2.5 h-2.5" /> Synced
                </span>
              ) : (
                <span className="flex items-center text-[#5B6BC0] gap-1 text-[10px]">
                  <WifiOff className="w-2.5 h-2.5" /> Local Sync
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Tools & User Info */}
        <div className="flex items-center gap-2">
          {/* Leaderboard only visible on contestant and admin, or on demand */}
          <button
            onClick={onOpenLeaderboard}
            className="p-2 rounded-xl bg-[#5B6BC0]/8 border border-[#5B6BC0]/15 text-[#5B6BC0] hover:bg-[#5B6BC0]/15 transition-colors cursor-pointer"
            title="Leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-[#5B6BC0]/8 border border-[#5B6BC0]/15 text-[#5B6BC0] hover:bg-[#5B6BC0]/15 transition-colors cursor-pointer"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#5B6BC0]/8 border border-[#5B6BC0]/15 text-[#6E7599] hover:text-[#2D3250] hover:bg-[#5B6BC0]/15 transition-colors cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* User Account Pill (Only on Contestant screen or Admin) */}
          {currentRole !== 'auditorium' && (
            <>
              {currentUser ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[#5B6BC0]/15">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-[#2D3250] truncate max-w-[120px]">
                      {currentUser.displayName || currentUser.username}
                    </p>
                    <p className="text-[10px] text-[#6E7599]">
                      {currentUser.isAdmin ? "Host Master" : (currentUser.college || "Team")}
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-xl bg-[#FF7A8A]/10 border border-[#FF7A8A]/20 text-[#FF7A8A] hover:bg-[#FF7A8A]/20 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-1.5 rounded-xl btn-gold-primary text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Team Login</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
