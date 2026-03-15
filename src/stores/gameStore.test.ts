import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameStore } from '../stores/gameStore';

describe('GameStore', () => {
    let store: GameStore;

    beforeEach(() => {
        store = new GameStore();
    });

    describe('initialization', () => {
        it('should have correct initial state', () => {
            expect(store.gameStatus).toBe('idle');
            expect(store.currentQuestionIndex).toBe(0);
            expect(store.selectedAnswers).toEqual([]);
            expect(store.answerText).toBe('');
            expect(store.questions).toEqual([]);
            expect(store.answeredQuestions).toEqual([]);
            expect(store.score).toBe(0);
        });
    });

    describe('setQuestionsFromAPI', () => {
        it('should correctly set questions from API', () => {
            const mockQuestions = [
                { id: '1', question: 'Q1', options: ['A', 'B'], difficulty: 'easy', type: 'multiple-select' },
                { id: '2', question: 'Q2', options: [], difficulty: 'medium', type: 'essay' },
            ];

            store.setQuestionsFromAPI(mockQuestions as any);

            expect(store.questions).toHaveLength(2);
            expect(store.questions[0].id).toBe('1');
            expect(store.questions[0].type).toBe('multiple-select');
            expect(store.questions[1].type).toBe('essay');
            expect(store.currentQuestionIndex).toBe(0);
            expect(store.selectedAnswers).toEqual([]);
        });
    });

    describe('startGame', () => {
        it('should set gameStatus to "playing"', () => {
            store.startGame();
            expect(store.gameStatus).toBe('playing');
        });
    });

    describe('toggleAnswer', () => {
        beforeEach(() => {
            store.questions = [
                { id: '1', type: 'multiple-select', question: 'Q1', options: ['A', 'B', 'C'], correctAnswers: [], difficulty: 'easy' }
            ];
            store.startGame();
        });

        it('should add answer to selection', () => {
            store.toggleAnswer(0);
            expect(store.selectedAnswers).toEqual([0]);
        });

        it('should remove answer if already selected', () => {
            store.selectedAnswers = [0, 1, 2];
            store.toggleAnswer(1);
            expect(store.selectedAnswers).toEqual([0, 2]);
        });

        it('should not work for non-multiple-select questions', () => {
            store.questions = [
                { id: '1', type: 'essay', question: 'Q1', options: [], correctAnswers: [], difficulty: 'medium' }
            ];

            store.toggleAnswer(0);
            expect(store.selectedAnswers).toEqual([]);
        });
    });

    describe('setText', () => {
        it('should update answer text', () => {
            store.setText('My answer');
            expect(store.answerText).toBe('My answer');
        });

        it('can clear answer text', () => {
            store.setText('Some text');
            store.setText('');
            expect(store.answerText).toBe('');
        });
    });

    describe('saveCurrentAnswer', () => {
        beforeEach(() => {
            store.questions = [
                { id: '1', type: 'multiple-select', question: 'Q1', options: ['A', 'B'], correctAnswers: [], difficulty: 'easy' },
                { id: '2', type: 'essay', question: 'Q2', options: [], correctAnswers: [], difficulty: 'medium' }
            ];
            store.startGame();
        });

        it('should save answer for multiple-select question', () => {
            store.selectedAnswers = [0, 2];
            store.saveCurrentAnswer();

            expect(store.answeredQuestions).toHaveLength(1);
            expect(store.answeredQuestions[0].questionId).toBe('1');
            expect(store.answeredQuestions[0].selectedAnswers).toEqual([0, 2]);
            expect(store.answeredQuestions[0].textAnswer).toBe('');
        });

        it('should save answer for essay question', () => {
            store.currentQuestionIndex = 1; // Switch to essay question
            store.setText('Detailed answer');
            store.saveCurrentAnswer();

            expect(store.answeredQuestions).toHaveLength(1);
            expect(store.answeredQuestions[0].questionId).toBe('2');
            expect(store.answeredQuestions[0].textAnswer).toBe('Detailed answer');
            expect(store.answeredQuestions[0].selectedAnswers).toEqual([]);
        });

        it('should not create duplicate answers', () => {
            store.selectedAnswers = [0];
            store.saveCurrentAnswer();
            store.saveCurrentAnswer(); // Save again

            expect(store.answeredQuestions).toHaveLength(1); // Should only be one
        });
    });

    describe('updateAnswerResult', () => {
        beforeEach(() => {
            store.questions = [
                { id: '1', type: 'multiple-select', question: 'Q1', options: ['A'], correctAnswers: [], difficulty: 'easy' }
            ];
            store.startGame();
            store.selectedAnswers = [0];
            store.saveCurrentAnswer();
        });

        it('should update answer result and award points', () => {
            store.updateAnswerResult('1', true, 10);

            expect(store.answeredQuestions[0].isCorrect).toBe(true);
            expect(store.answeredQuestions[0].pointsEarned).toBe(10);
            expect(store.score).toBe(10);
        });
    });

    describe('currentQuestion', () => {
        beforeEach(() => {
            const mockQuestions = [
                { id: '1', type: 'multiple-select', question: 'Q1', options: [], correctAnswers: [], difficulty: 'easy' },
                { id: '2', type: 'essay', question: 'Q2', options: [], correctAnswers: [], difficulty: 'medium' },
                { id: '3', type: 'multiple-select', question: 'Q3', options: [], correctAnswers: [], difficulty: 'hard' },
            ];

            store.setQuestionsFromAPI(mockQuestions as any);
            store.startGame();
        });
        it('should return current question', () => {
            store.currentQuestionIndex = 1;
            expect(store.currentQuestion?.id).toBe('2');
        });

        it('should return null for invalid index', () => {
            store.currentQuestionIndex = 99;
            expect(store.currentQuestion).toBeNull();
        });
    });
    describe('nextQuestion', () => {
        beforeEach(() => {
            store.questions = [
                { id: '1', type: 'multiple-select', question: 'Q1', options: [], correctAnswers: [], difficulty: 'easy' },
                { id: '2', type: 'essay', question: 'Q2', options: [], correctAnswers: [], difficulty: 'medium' },
            ];
            store.startGame();
        });

        it('should increment question index', () => {
            store.nextQuestion();
            expect(store.currentQuestionIndex).toBe(1);
        });

        it('should reset answer state when moving to next question', () => {
            // Устанавливаем тестовые данные
            store.selectedAnswers = [0, 1];
            store.setText('Previous answer text');

            store.nextQuestion();

            expect(store.selectedAnswers).toEqual([]);
            expect(store.answerText).toBe('');
        });

        it('should finish game on last question', () => {
            store.currentQuestionIndex = 1; // Last question
            store.nextQuestion();
            expect(store.gameStatus).toBe('finished');
        });
    });

    describe('finishGame', () => {
        it('should set gameStatus to "finished"', () => {
            store.finishGame();
            expect(store.gameStatus).toBe('finished');
        });
    });

    describe('resetGame', () => {
        beforeEach(() => {
            store.startGame();
            store.score = 100;
            store.answeredQuestions = [{ questionId: '1', isCorrect: true, pointsEarned: 10, selectedAnswers: [0], textAnswer: '' }];
            store.currentQuestionIndex = 5;
        });

        it('should reset game state', () => {
            store.resetGame();

            expect(store.gameStatus).toBe('idle');
            expect(store.questions).toEqual([]);
            expect(store.currentQuestionIndex).toBe(0);
            expect(store.score).toBe(0);
            expect(store.selectedAnswers).toEqual([]);
            expect(store.answeredQuestions).toEqual([]);
        });
    });

    describe('computed properties', () => {
        beforeEach(() => {
            store.questions = [
                { id: '1', type: 'multiple-select', question: 'Q1', options: [], correctAnswers: [], difficulty: 'easy' },
                { id: '2', type: 'essay', question: 'Q2', options: [], correctAnswers: [], difficulty: 'medium' },
                { id: '3', type: 'multiple-select', question: 'Q3', options: [], correctAnswers: [], difficulty: 'hard' },
            ];

            store.startGame();
        });

        describe('progress', () => {
            it('should calculate progress percentage', () => {
                store.currentQuestionIndex = 1;
                expect(store.progress).toBe(((1 + 1) / 3) * 100); // 66.6...
            });

            it('should return 0 if no questions', () => {
                store.questions = [];
                expect(store.progress).toBe(0);
            });
        });

        describe('isLastQuestion', () => {
            it('should return true for last question', () => {
                store.currentQuestionIndex = 2;
                expect(store.isLastQuestion).toBe(true);
            });

            it('should return false for non-last question', () => {
                store.currentQuestionIndex = 0;
                expect(store.isLastQuestion).toBe(false);
            });
        });

        describe('correctAnswersCount', () => {
            it('should count correct answers', () => {
                store.answeredQuestions = [
                    { questionId: '1', isCorrect: true, pointsEarned: 5, selectedAnswers: [0], textAnswer: '' },
                    { questionId: '2', isCorrect: false, pointsEarned: 0, selectedAnswers: [], textAnswer: 'text' },
                    { questionId: '3', isCorrect: true, pointsEarned: 10, selectedAnswers: [1], textAnswer: '' },
                ];
                expect(store.correctAnswersCount).toBe(2);
            });
        });

        describe('isAnswerSelected', () => {
            it('should return true for multiple-select with selected answers', () => {
                store.questions = [{ id: '1', type: 'multiple-select', question: 'Q1', options: ['A'], correctAnswers: [], difficulty: 'easy' }];
                store.startGame();
                store.selectedAnswers = [0];
                expect(store.isAnswerSelected).toBe(true);
            });

            it('should return false for multiple-select without selected answers', () => {
                store.questions = [{ id: '1', type: 'multiple-select', question: 'Q1', options: ['A'], correctAnswers: [], difficulty: 'easy' }];
                store.startGame();
                store.selectedAnswers = [];
                expect(store.isAnswerSelected).toBe(false);
            });

            it('should always return true for essay', () => {
                store.questions = [{ id: '1', type: 'essay', question: 'Q1', options: [], correctAnswers: [], difficulty: 'medium' }];
                store.startGame();
                expect(store.isAnswerSelected).toBe(true);
            });
        });
    });
});