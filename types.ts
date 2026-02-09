
export enum HostPersonality {
  Snarky = 'Snarky',
  Cozy = 'Cozy',
  Dramatic = 'Dramatic',
  Hype = 'Hype',
  Nerdy = 'Nerdy',
  Mysterious = 'Mysterious'
}

export enum GameState {
  Lobby = 'LOBBY',
  Intro = 'INTRO',
  Playing = 'PLAYING',
  QuestionReview = 'REVIEW',
  Summary = 'SUMMARY'
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
}

export interface GameSession {
  score: number;
  streak: number;
  currentQuestionIndex: number;
  questions: TriviaQuestion[];
  history: {
    questionId: string;
    isCorrect: boolean;
    timeTaken: number;
  }[];
}

export interface HostState {
  personality: HostPersonality;
  message: string;
  expression: 'idle' | 'happy' | 'thinking' | 'shocked' | 'roast';
  isSpeaking: boolean;
}
