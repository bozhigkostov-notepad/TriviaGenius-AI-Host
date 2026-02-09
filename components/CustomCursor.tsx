
import React, { useState, useEffect } from 'react';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('.interactive')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-transform duration-100 ease-out`}
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Outer Ring */}
      <div 
        className={`
          absolute -translate-x-1/2 -translate-y-1/2 border-2 rounded-full transition-all duration-200
          ${isHovering ? 'w-10 h-10 border-blue-400 scale-125' : 'w-8 h-8 border-white/50 scale-100'}
          ${isClicking ? 'scale-75 border-yellow-400' : ''}
        `}
      />
      {/* Core Dot */}
      <div 
        className={`
          absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200
          ${isHovering ? 'w-2 h-2 bg-blue-400' : 'w-1.5 h-1.5 bg-white'}
          shadow-[0_0_10px_rgba(255,255,255,0.8)]
        `}
      />
      
      {/* Decorative Glow */}
      <div className={`
        absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-md pointer-events-none
        ${isHovering ? 'w-12 h-12 bg-blue-500' : 'w-0 h-0'}
      `} />
    </div>
  );
};

export default CustomCursor;
