
import React from 'react';
import { Settings, Info, SkipForward, Volume2, BarChart3, RotateCcw } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAction }) => {
  const items = [
    { label: 'Change Personality', icon: <Settings size={16} />, id: 'personality' },
    { label: 'Get Hint', icon: <Info size={16} />, id: 'hint' },
    { label: 'Skip Question', icon: <SkipForward size={16} />, id: 'skip' },
    { label: 'Toggle Voice', icon: <Volume2 size={16} />, id: 'voice' },
    { label: 'View Stats', icon: <BarChart3 size={16} />, id: 'stats' },
    { label: 'Reset Game', icon: <RotateCcw size={16} />, id: 'reset' },
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-[8000]" 
        onClick={onClose}
        onContextMenu={(e) => { e.preventDefault(); onClose(); }}
      />
      <div 
        className="fixed z-[8001] min-w-[200px] bg-black/90 border border-white/20 rounded-lg shadow-2xl backdrop-blur-xl py-2 animate-in fade-in zoom-in duration-200"
        style={{ left: x, top: y }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => { onAction(item.id); onClose(); }}
            className="w-full text-left px-4 py-2 hover:bg-blue-600/30 flex items-center gap-3 text-sm transition-colors text-white/80 hover:text-white"
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default ContextMenu;
