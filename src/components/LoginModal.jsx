import React, { useState } from 'react';
import { X, Lock, User, KeyRound, ShieldCheck } from 'lucide-react';
import sjcLogo from '../assets/sjc-logo.png';
import { sounds } from '../utils/soundEffects';
import { verifyPassword } from '../utils/crypto';

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  participants = [], 
  adminPasswordHash,
  role = 'contestant' // 'contestant' | 'admin'
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleContestantLogin = (e) => {
    e?.preventDefault();
    setError('');

    const trimmedUser = username.trim().toLowerCase();
    const found = participants.find(
      p => p.username.toLowerCase() === trimmedUser && p.password === password
    );

    if (found) {
      sounds.playCorrect();
      onLoginSuccess({
        ...found,
        isAdmin: false
      });
      onClose();
    } else {
      sounds.playWrong();
      setError('Invalid team username or password. Team credentials must be issued by the fest admin.');
    }
  };

  const handleAdminLogin = async (e) => {
    e?.preventDefault();
    setError('');

    if (!adminPasswordHash) {
      setError('Admin authentication is loading. Please wait a moment and try again.');
      return;
    }

    setIsVerifying(true);

    try {
      const isValid = await verifyPassword(adminPassInput, adminPasswordHash);

      if (isValid) {
        sounds.playCorrect();
        onLoginSuccess({
          username: 'admin',
          displayName: 'Host / Admin',
          isAdmin: true,
          college: "St. Joseph's College"
        });
        onClose();
      } else {
        sounds.playWrong();
        setError('Incorrect admin authorization password.');
      }
    } catch (err) {
      console.error('Password verification error:', err);
      setError('Authentication error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3250]/30 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-[#5B6BC0]/15 rounded-3xl shadow-[0_16px_50px_rgba(45,50,80,0.12)] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F0F2F8] text-[#6E7599] hover:text-[#2D3250] hover:bg-[#E8EAF4] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 text-center border-b border-[#5B6BC0]/10">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5B6BC0] via-[#7C4DFF] to-[#9575CD] p-[1.5px] mb-3 shadow-md">
            <div className="w-full h-full rounded-2xl bg-white p-1.5 flex items-center justify-center overflow-hidden">
              <img 
                src={sjcLogo} 
                alt="St. Joseph's College Crest" 
                className="w-full h-full object-contain filter drop-shadow" 
              />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gold-gradient font-serif">Josephest 2026</h2>
          <p className="text-xs text-[#5B6BC0] font-medium mt-0.5">St. Joseph's College, Allahabad</p>
          <p className="text-[11px] text-[#6E7599] mt-1">
            {role === 'admin' ? "Host Console Authentication" : "Expressions Quiz — Team Login"}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-[#FF7A8A]/8 border border-[#FF7A8A]/25 rounded-xl text-[#2D3250] text-xs flex items-center gap-2">
              <span className="font-bold text-[#FF7A8A]">Notice:</span> {error}
            </div>
          )}

          {role === 'contestant' ? (
            <form onSubmit={handleContestantLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6E7599] mb-1.5">
                  Team Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5B6BC0]/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter assigned team username"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F0F2F8] border border-[#5B6BC0]/15 focus:border-[#5B6BC0] rounded-xl text-sm text-[#2D3250] placeholder-[#A8B0CC] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6E7599] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5B6BC0]/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter assigned password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F0F2F8] border border-[#5B6BC0]/15 focus:border-[#5B6BC0] rounded-xl text-sm text-[#2D3250] placeholder-[#A8B0CC] outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-gold-primary text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enter Expressions Quiz</span>
              </button>

              <div className="pt-3 border-t border-[#5B6BC0]/10 text-center">
                <p className="text-[11px] text-[#6E7599]">
                  Accounts are provisioned solely by the Josephest Admin. Contact the event coordinator if you need team credentials.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6E7599] mb-1.5">
                  Host Master Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5B6BC0]/40">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={adminPassInput}
                    onChange={(e) => setAdminPassInput(e.target.value)}
                    placeholder="Enter admin authorization key"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F0F2F8] border border-[#5B6BC0]/15 focus:border-[#5B6BC0] rounded-xl text-sm text-[#2D3250] placeholder-[#A8B0CC] outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 btn-gold-primary text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isVerifying ? 'Verifying…' : 'Unlock Host Control Console'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
