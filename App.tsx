
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HostPersonality, GameState, TriviaQuestion, GameSession, HostState } from './types';
import { PERSONALITIES, CATEGORIES } from './constants';
import { geminiService } from './services/geminiService';
import CustomCursor from './components/CustomCursor';
import ContextMenu from './components/ContextMenu';
import HostAvatar from './components/HostAvatar';
import { Trophy, Timer, Zap, Loader2, Sparkles, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.Lobby);
  const [personality, setPersonality] = useState<HostPersonality>(HostPersonality.Snarky);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [session, setSession] = useState<GameSession>({
    score: 0,
    streak: 0,
    currentQuestionIndex: 0,
    questions: [],
    history: []
  });
  
  // Host State
  const [host, setHost] = useState<HostState>({
    personality: HostPersonality.Snarky,
    message: "Welcome to the thunderdome. Hope you brought a brain.",
    expression: 'idle',
    isSpeaking: false
  });

  // UI State
  const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initial audio context setup
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (gameState === GameState.Playing && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === GameState.Playing) {
      handleAnswer(''); // Timeout
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const speak = async (message: string) => {
    if (!isVoiceEnabled || !audioCtxRef.current) return;
    
    setHost(h => ({ ...h, isSpeaking: true }));
    const audioData = await geminiService.speakMessage(message);
    
    if (audioData && audioCtxRef.current) {
      const audioBuffer = await decodeAudioData(audioData, audioCtxRef.current, 24000, 1);
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtxRef.current.destination);
      source.onended = () => setHost(h => ({ ...h, isSpeaking: false }));
      source.start();
    } else {
      setHost(h => ({ ...h, isSpeaking: false }));
    }
  };

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const startGame = async () => {
    setIsLoading(true);
    try {
      const questions = await geminiService.generateQuestions(category);
      const hostIntro = await geminiService.getHostCommentary(personality, "Start of game intro", 0, 0);
      
      setSession({
        score: 0,
        streak: 0,
        currentQuestionIndex: 0,
        questions,
        history: []
      });
      setHost({
        personality,
        message: hostIntro.message,
        expression: hostIntro.expression as any,
        isSpeaking: false
      });
      setGameState(GameState.Intro);
      speak(hostIntro.message);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = () => {
    if (session.currentQuestionIndex + 1 >= session.questions.length) {
      setGameState(GameState.Summary);
      handleEndGame();
    } else {
      setSession(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
      setGameState(GameState.Playing);
      setTimeLeft(20);
      setSelectedAnswer(null);
    }
  };

  const handleEndGame = async () => {
    const commentary = await geminiService.getHostCommentary(personality, "Game over summary", session.score, session.streak);
    setHost(h => ({ ...h, message: commentary.message, expression: commentary.expression as any }));
    speak(commentary.message);
  };

  const handleAnswer = async (answer: string) => {
    const currentQ = session.questions[session.currentQuestionIndex];
    const isCorrect = answer === currentQ.correctAnswer;
    
    setSelectedAnswer(answer);
    setGameState(GameState.QuestionReview);
    
    const newStreak = isCorrect ? session.streak + 1 : 0;
    const scoreGain = isCorrect ? Math.floor(100 * (timeLeft / 20) + (newStreak * 10)) : 0;
    
    setSession(prev => ({
      ...prev,
      score: prev.score + scoreGain,
      streak: newStreak,
      history: [...prev.history, { questionId: currentQ.id, isCorrect, timeTaken: 20 - timeLeft }]
    }));

    const commentary = await geminiService.getHostCommentary(
      personality, 
      isCorrect ? `Correct answer. Explaining: ${currentQ.explanation}` : `Incorrect answer. Correct was ${currentQ.correctAnswer}. Explaining: ${currentQ.explanation}`, 
      session.score + scoreGain, 
      newStreak
    );

    setHost(h => ({
      ...h,
      message: commentary.message,
      expression: commentary.expression as any
    }));
    speak(commentary.message);
  };

  const handleContextMenuAction = (action: string) => {
    switch (action) {
      case 'personality':
        setGameState(GameState.Lobby);
        break;
      case 'hint':
        if (gameState === GameState.Playing) {
          const currentQ = session.questions[session.currentQuestionIndex];
          setHost(h => ({ ...h, message: `Hint: It starts with ${currentQ.correctAnswer[0]}... probably.` }));
        }
        break;
      case 'skip':
        if (gameState === GameState.Playing) nextQuestion();
        break;
      case 'voice':
        setIsVoiceEnabled(!isVoiceEnabled);
        break;
      case 'reset':
        window.location.reload();
        break;
    }
  };

  const renderLobby = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-[#0a0a0c] to-[#121216]">
      <div className="mb-12 text-center animate-in slide-in-from-top duration-700">
        <h1 className="text-7xl font-orbitron font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          TRIVIAGENIUS AI
        </h1>
        <p className="text-xl text-white/60">Choose your tormentor and your challenge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
        {PERSONALITIES.map((p) => (
          <button
            key={p.id}
            onClick={() => setPersonality(p.id)}
            className={`
              p-6 rounded-2xl border-2 transition-all duration-300 text-left interactive
              ${personality === p.id 
                ? `bg-white/10 border-[${p.color}] shadow-[0_0_30px_${p.color}44] scale-105` 
                : 'bg-white/5 border-white/10 hover:border-white/20 opacity-70 hover:opacity-100'}
            `}
            style={{ borderColor: personality === p.id ? p.color : undefined }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${p.color}22`, color: p.color }}>{p.icon}</div>
              <h3 className="text-xl font-orbitron font-bold">{p.id}</h3>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">{p.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 transition-colors appearance-none interactive"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button 
          onClick={startGame}
          disabled={isLoading}
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 rounded-xl font-orbitron font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-3 interactive shadow-[0_0_20px_rgba(37,99,235,0.4)]"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <>START SESSION <ChevronRight /></>}
        </button>
      </div>
    </div>
  );

  const renderGame = () => {
    const currentQ = session.questions[session.currentQuestionIndex];
    if (!currentQ) return null;

    return (
      <div className="flex flex-col min-h-screen p-6 md:p-12">
        {/* HUD */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-xs text-white/40 uppercase tracking-widest mb-1">Score</span>
              <span className="text-3xl font-orbitron font-bold text-blue-400">{session.score}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/40 uppercase tracking-widest mb-1">Streak</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-orbitron font-bold text-orange-500">{session.streak}</span>
                <Zap className={`w-5 h-5 text-orange-500 ${session.streak > 0 ? 'animate-bounce' : 'opacity-20'}`} />
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
              <circle 
                cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="4" fill="transparent" 
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (213.6 * timeLeft / 20)}
                className={`${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-blue-500'} transition-all duration-1000`}
              />
            </svg>
            <span className="absolute text-xl font-orbitron font-bold">{timeLeft}</span>
          </div>

          <div className="text-right">
            <span className="text-xs text-white/40 uppercase tracking-widest mb-1">Progress</span>
            <div className="text-xl font-orbitron font-bold">
              {session.currentQuestionIndex + 1} / {session.questions.length}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start flex-grow">
          {/* Host Panel */}
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <HostAvatar personality={host.personality} expression={host.expression} isSpeaking={host.isSpeaking} />
            <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                Host Channel
              </div>
              <p className="text-center italic text-lg leading-relaxed text-white/90">"{host.message}"</p>
            </div>
          </div>

          {/* Question Panel */}
          <div className="w-full lg:w-2/3 flex flex-col">
            {gameState === GameState.Intro ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-12 h-12 text-yellow-400 mb-6 animate-pulse" />
                <h2 className="text-4xl font-orbitron font-bold mb-12">The category is: {category}</h2>
                <button 
                  onClick={() => setGameState(GameState.Playing)}
                  className="px-12 py-5 bg-white text-black font-orbitron font-bold text-xl rounded-xl hover:bg-blue-400 transition-colors interactive"
                >
                  READY?
                </button>
              </div>
            ) : (
              <div className="bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-sm">
                <h2 className="text-3xl font-medium mb-12 leading-tight">{currentQ.question}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === currentQ.correctAnswer;
                    const showFeedback = gameState === GameState.QuestionReview;

                    return (
                      <button
                        key={idx}
                        disabled={showFeedback}
                        onClick={() => handleAnswer(option)}
                        className={`
                          p-6 text-left rounded-2xl border-2 transition-all duration-200 interactive group
                          ${!showFeedback && 'hover:bg-white/10 border-white/10 hover:border-white/30'}
                          ${showFeedback && isCorrect && 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}
                          ${showFeedback && isSelected && !isCorrect && 'bg-rose-500/20 border-rose-500'}
                          ${showFeedback && !isSelected && !isCorrect && 'opacity-40'}
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold group-hover:bg-white/20">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-lg">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {gameState === GameState.QuestionReview && (
                  <div className="mt-10 animate-in fade-in slide-in-from-bottom-4">
                    <button 
                      onClick={nextQuestion}
                      className="w-full py-5 bg-blue-600 rounded-2xl font-orbitron font-bold text-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3 interactive"
                    >
                      NEXT QUESTION <ChevronRight />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Trophy className="w-24 h-24 text-yellow-500 mb-8 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
      <h2 className="text-5xl font-orbitron font-bold mb-4">Session Complete</h2>
      <p className="text-2xl text-white/60 mb-12">Host Personality: {personality}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-12">
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
          <span className="text-sm text-white/40 uppercase mb-2 block">Final Score</span>
          <span className="text-5xl font-orbitron font-bold text-blue-400">{session.score}</span>
        </div>
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
          <span className="text-sm text-white/40 uppercase mb-2 block">Best Streak</span>
          <span className="text-5xl font-orbitron font-bold text-orange-500">{session.streak}</span>
        </div>
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
          <span className="text-sm text-white/40 uppercase mb-2 block">Accuracy</span>
          <span className="text-5xl font-orbitron font-bold text-emerald-400">
            {Math.round((session.history.filter(h => h.isCorrect).length / session.questions.length) * 100)}%
          </span>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white/5 p-8 rounded-3xl border border-white/10 mb-12">
        <div className="flex items-center gap-6 mb-4">
          <HostAvatar personality={host.personality} expression={host.expression} isSpeaking={host.isSpeaking} />
          <div>
            <h4 className="font-orbitron font-bold text-lg mb-1">{host.personality}'s Final Words</h4>
            <p className="italic text-white/80 leading-relaxed text-lg">"{host.message}"</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setGameState(GameState.Lobby)}
        className="px-12 py-5 bg-white text-black font-orbitron font-bold text-xl rounded-2xl hover:bg-blue-400 transition-colors interactive"
      >
        PLAY AGAIN
      </button>
    </div>
  );

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden"
      onContextMenu={(e) => {
        e.preventDefault();
        setMenuPos({ x: e.clientX, y: e.clientY });
      }}
    >
      <CustomCursor />
      
      {menuPos && (
        <ContextMenu 
          x={menuPos.x} 
          y={menuPos.y} 
          onClose={() => setMenuPos(null)} 
          onAction={handleContextMenuAction}
        />
      )}

      <main className="w-full h-full relative z-10">
        {gameState === GameState.Lobby && renderLobby()}
        {(gameState === GameState.Intro || gameState === GameState.Playing || gameState === GameState.QuestionReview) && renderGame()}
        {gameState === GameState.Summary && renderSummary()}
      </main>

      {/* Decorative Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
    </div>
  );
};

export default App;
