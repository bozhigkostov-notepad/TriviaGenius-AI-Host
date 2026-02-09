
import React from 'react';
import { HostPersonality } from '../types';

interface HostAvatarProps {
  personality: HostPersonality;
  expression: 'idle' | 'happy' | 'thinking' | 'shocked' | 'roast';
  isSpeaking: boolean;
}

const HostAvatar: React.FC<HostAvatarProps> = ({ personality, expression, isSpeaking }) => {
  const getColors = () => {
    switch (personality) {
      case HostPersonality.Snarky: return { primary: '#f43f5e', secondary: '#4c0519' };
      case HostPersonality.Cozy: return { primary: '#fbbf24', secondary: '#451a03' };
      case HostPersonality.Dramatic: return { primary: '#a855f7', secondary: '#2e1065' };
      case HostPersonality.Hype: return { primary: '#3b82f6', secondary: '#172554' };
      case HostPersonality.Nerdy: return { primary: '#10b981', secondary: '#064e3b' };
      case HostPersonality.Mysterious: return { primary: '#6366f1', secondary: '#1e1b4b' };
      default: return { primary: '#fff', secondary: '#333' };
    }
  };

  const colors = getColors();

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Background Aura */}
      <div 
        className={`absolute inset-0 rounded-full opacity-20 blur-2xl transition-all duration-500`}
        style={{ backgroundColor: colors.primary, transform: isSpeaking ? 'scale(1.2)' : 'scale(1)' }}
      />
      
      {/* Animated Orbitals */}
      <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full" style={{ backgroundColor: colors.primary }} />
      </div>

      {/* Main Face Container */}
      <div 
        className="relative w-32 h-32 rounded-3xl border-4 flex flex-col items-center justify-center bg-black/50 transition-all duration-300"
        style={{ borderColor: colors.primary, boxShadow: `0 0 20px ${colors.primary}44` }}
      >
        {/* Eyes */}
        <div className="flex gap-8 mb-4">
          <div 
            className={`w-3 h-3 rounded-full bg-white transition-all duration-300 ${expression === 'thinking' ? 'scale-y-[0.1]' : ''} ${expression === 'shocked' ? 'scale-150' : ''}`} 
          />
          <div 
            className={`w-3 h-3 rounded-full bg-white transition-all duration-300 ${expression === 'thinking' ? 'scale-y-[0.1]' : ''} ${expression === 'shocked' ? 'scale-150' : ''}`} 
          />
        </div>

        {/* Mouth/Speaker */}
        <div 
          className={`h-1.5 bg-white rounded-full transition-all duration-200 ${isSpeaking ? 'w-12 animate-pulse' : 'w-6'} ${expression === 'happy' ? 'rounded-b-full h-4 w-8' : ''}`} 
        />
        
        {/* Expression Badge */}
        <div className="absolute -bottom-2 px-2 py-0.5 rounded bg-white text-black text-[10px] font-bold uppercase tracking-wider">
          {expression}
        </div>
      </div>
    </div>
  );
};

export default HostAvatar;
