export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Answer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type Theme = 'light' | 'dark';
