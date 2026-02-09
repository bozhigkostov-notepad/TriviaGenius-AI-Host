
import { HostPersonality } from './types';
import { Ghost, Coffee, Zap, Flame, Glasses, Skull } from 'lucide-react';
import React from 'react';

export const PERSONALITIES = [
  { 
    id: HostPersonality.Snarky, 
    icon: <Skull className="w-6 h-6" />, 
    color: '#f43f5e', 
    desc: 'Low tolerance for wrong answers, high tolerance for irony.' 
  },
  { 
    id: HostPersonality.Cozy, 
    icon: <Coffee className="w-6 h-6" />, 
    color: '#fbbf24', 
    desc: 'Gentle encouragement and warm beverage vibes.' 
  },
  { 
    id: HostPersonality.Dramatic, 
    icon: <Ghost className="w-6 h-6" />, 
    color: '#a855f7', 
    desc: 'Every question is a life-or-death theatrical performance.' 
  },
  { 
    id: HostPersonality.Hype, 
    icon: <Flame className="w-6 h-6" />, 
    color: '#3b82f6', 
    desc: 'Maximum energy. Caps lock is always on.' 
  },
  { 
    id: HostPersonality.Nerdy, 
    icon: <Glasses className="w-6 h-6" />, 
    color: '#10b981', 
    desc: 'Actually, the technical term for this trivia is...' 
  },
  { 
    id: HostPersonality.Mysterious, 
    icon: <Zap className="w-6 h-6" />, 
    color: '#6366f1', 
    desc: 'Speaks in riddles. Might be an ancient entity.' 
  },
];

export const CATEGORIES = [
  "Internet Culture",
  "Classic Cinema",
  "Obscure Science",
  "Video Game History",
  "World Mythology",
  "80s Synthpop"
];
