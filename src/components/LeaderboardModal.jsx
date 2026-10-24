import React, { useState } from 'react';
import { Trophy, X, Search } from 'lucide-react';
import sjcLogo from '../assets/sjc-logo.png';

export default function LeaderboardModal({ isOpen, onClose, participants = [] }) {
  const [search, setSearch] = useState('');
  if (!isOpen) return null;

  const sorted = [...participants].sort((a, b) => (b.score || 0) - (a.score || 0));
  const filtered = sorted.filter(p =>
    (p.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.college || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E0D33]/25 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-[#EEC37D]/20 rounded-3xl shadow-[0_16px_50px_rgba(30,13,51,0.10)] overflow-hidden flex flex-col max-h-[85vh]">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-[#FBEEE1] text-[#8B4A5A] hover:text-[#31124A] hover:bg-[#FBE0A4]/40 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pb-4 border-b border-[#EEC37D]/15 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EEC37D]/12 border border-[#EEC37D]/20 p-1 flex items-center justify-center mb-2">
            <img src={sjcLogo} alt="SJC" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <span className="text-[10px] uppercase tracking-wider text-[#4C1B56] font-semibold block mb-0.5">
            Samavaya • St. Joseph's College, Allahabad
          </span>
          <h2 className="text-xl font-bold text-gold-gradient font-serif">Expressions 2026 Standings</h2>
          <p className="text-xs text-[#8B4A5A] mt-0.5">Live Team Scores & Rankings</p>

          <div className="mt-4 relative max-w-xs mx-auto">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#D27D4F]/40" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter teams..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#FBEEE1] border border-[#EEC37D]/15 rounded-xl text-xs text-[#31124A] outline-none focus:border-[#EEC37D]" />
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-[#C4A0AB] text-xs py-8">No teams found.</p>
          ) : (
            filtered.map((user, idx) => {
              const rank = idx + 1;
              const isFirst = rank === 1;
              return (
                <div key={user.username}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isFirst ? 'bg-[#EEC37D]/10 border-[#EEC37D]/30' : 'bg-[#FBEEE1]/60 border-[#EEC37D]/10 hover:bg-[#EEC37D]/8'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isFirst ? 'bg-gradient-to-br from-[#D27D4F] to-[#EEC37D] text-white' : 'bg-[#FBEEE1] text-[#8B4A5A]'
                    }`}>{rank}</span>
                    <div>
                      <span className="text-xs font-semibold text-[#31124A] block">{user.displayName || user.username}</span>
                      <span className="text-[10px] text-[#8B4A5A] block">@{user.username} {user.college ? `• ${user.college}` : ''}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gold-metallic">{user.score || 0} pts</span>
                    <span className="text-[10px] text-[#D27D4F] block font-mono">Lvl {user.currentLevel || 1}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
