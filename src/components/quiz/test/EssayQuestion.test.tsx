import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EssayQuestion } from '../EssayQuestion';

describe('EssayQuestion', () => {
    const mockQuestion = {
        id: 'q1',
        type: 'essay' as const,
        question: 'Что такое React?',
        options: [],
        correctAnswers: [],
        difficulty: 'medium' as const
       
    };

    it('рендерит textarea для ввода ответа', () => {
        render(
            <EssayQuestion
                question={mockQuestion}
                textAnswer=""
                onTextChange={() => { }}
            />
        );

        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Введите ваш развернутый ответ здесь...')).toBeInTheDocument();
    });

    it('отображает текущий текст ответа', () => {
        const answer = 'React - это библиотека для создания интерфейсов';

        render(
            <EssayQuestion
                question={mockQuestion}
                textAnswer={answer}
                onTextChange={() => { }}
            />
        );

        expect(screen.getByRole('textbox')).toHaveValue(answer);
    });

    it('вызывает onTextChange при вводе текста', async () => {
        const handleTextChange = vi.fn();
        const user = userEvent.setup();

        render(
            <EssayQuestion
                question={mockQuestion}
                textAnswer=""
                onTextChange={handleTextChange}
            />
        );

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'Новый ответ');

        expect(handleTextChange).toHaveBeenCalled();
    });

    it('отображает количество символов', () => {
        const answer = 'Короткий ответ';

        render(
            <EssayQuestion
                question={mockQuestion}
                textAnswer={answer}
                onTextChange={() => { }}
            />
        );

        expect(screen.getByText(`Символов: ${answer.length}`)).toBeInTheDocument();
    });


    it('применяет темную тему когда theme="dark"', () => {
        render(
            <EssayQuestion
                question={mockQuestion}
                textAnswer=""
                onTextChange={() => { }}
                theme="dark"
            />
        );

        const textarea = screen.getByRole('textbox');
        expect(textarea.className).toContain('border-gray-600');
        expect(textarea.className).toContain('bg-gray-700');
        expect(textarea.className).toContain('text-white');
    });
});