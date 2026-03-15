import { describe, it, expect } from 'vitest';
import { scoringService } from '../scoringService.js';

describe('ScoringService', () => {
    // ===== ТЕСТЫ ДЛЯ МНОЖЕСТВЕННОГО ВЫБОРА =====
    describe('Multiple Select', () => {
        const correctAnswers = ['A', 'B', 'C'];

        it('считает баллы когда все ответы правильные', () => {
            const studentAnswers = ['A', 'B', 'C'];
            const result = scoringService.scoreMultipleSelect(correctAnswers, studentAnswers);
            expect(result).toBe(3);
        });

        it('считает баллы когда есть неправильные ответы', () => {
            const studentAnswers = ['A', 'C', 'D'];
            const result = scoringService.scoreMultipleSelect(correctAnswers, studentAnswers);
            expect(result).toBe(1.5); // A(+1) + C(+1) + D(-0.5) = 1.5
        });

        it('не дает отрицательных баллов', () => {
            const studentAnswers = ['D', 'E', 'F'];
            const result = scoringService.scoreMultipleSelect(correctAnswers, studentAnswers);
            expect(result).toBe(0);
        });

        it('игнорирует дубликаты в ответах', () => {
            const studentAnswers = ['A', 'A', 'B', 'B', 'C', 'C', 'D'];
            const result = scoringService.scoreMultipleSelect(correctAnswers, studentAnswers);
            expect(result).toBe(2.5); // A(+1) + B(+1) + C(+1) + D(-0.5) = 2.5
        });

        it('возвращает 0 при пустых ответах студента', () => {
            const result = scoringService.scoreMultipleSelect(correctAnswers, []);
            expect(result).toBe(0);
        });

        it('возвращает максимальный балл', () => {
            const result = scoringService.getMaxScoreForMultipleSelect(correctAnswers);
            expect(result).toBe(3);
        });
    });

    // ===== ТЕСТЫ ДЛЯ ТЕКСТОВЫХ ВОПРОСОВ =====
    describe('Essay', () => {
        const rubric = {
            grammar: 5,
            content: 5,
            structure: 5
        };

        it('суммирует оценки по критериям', () => {
            const grades = [4, 3, 5];
            const result = scoringService.scoreEssay(grades, rubric);
            expect(result).toBe(12);
        });

        it('не превышает максимальный балл', () => {
            const grades = [6, 6, 6];
            const result = scoringService.scoreEssay(grades, rubric);
            expect(result).toBe(15);
        });

        it('возвращает 0 при пустых оценках', () => {
            const result = scoringService.scoreEssay([], rubric);
            expect(result).toBe(0);
        });

        it('проверяет полностью ли оценено', () => {
            const grades = [4, 3, 5];
            const isFullyGraded = scoringService.isEssayFullyGraded(grades, rubric);
            expect(isFullyGraded).toBe(true);
        });

        it('дает информацию о проверке', () => {
            const grades = [4, 3];
            const info = scoringService.getEssayGradingInfo(grades, rubric);

            expect(info).toEqual({
                isFullyGraded: false,
                maxScore: 15,
                currentScore: 7,
                missingCriteria: ['structure'],
                gradesByCriteria: {
                    grammar: 4,
                    content: 3
                }
            });
        });
    });

    // ===== ТЕСТЫ НА ОШИБКИ =====
    describe('Error handling', () => {
        it('выбрасывает ошибку при неверных входных данных для multiple select', () => {
            expect(() => {
                scoringService.scoreMultipleSelect(null as any, ['A']);
            }).toThrow('Invalid input');

            expect(() => {
                scoringService.scoreMultipleSelect(['A'], null as any);
            }).toThrow('Invalid input');
        });

        it('выбрасывает ошибку при неверных входных данных для essay', () => {
            // Просто проверяем, что любая ошибка выбрасывается
            expect(() => scoringService.scoreEssay(null as any, {}))
                .toThrow(); 

            expect(() => scoringService.scoreEssay([], null as any))
                .toThrow(); 
        });

        it('выбрасывает ошибку при несоответствии количества оценок и критериев', () => {
            const grades = [4, 3];
            const rubric = { grammar: 5, content: 5, structure: 5 };

            expect(() => {
                scoringService.scoreEssay(grades, rubric);
            }).toThrow('Number of grades must match number of rubric criteria');
        });
    });
});
