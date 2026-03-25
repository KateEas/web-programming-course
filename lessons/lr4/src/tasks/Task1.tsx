import { useState } from 'react';
import { mockQuestions } from '../data/questions';
import { Question } from '../types/quiz';

/**
 * Task 1: Управление состоянием с помощью useState
 *
 * Цель: Создать простой Quiz используя только встроенные хуки React
 *
 * Задание:
 * 1. Реализовать отображение текущего вопроса
 * 2. Обработать выбор ответа
 * 3. Подсчитать количество правильных ответов
 * 4. Показать результат в конце
 * 5. Добавить кнопку "Начать заново"
 */

const Task1 = () => {
  // Пример создания состояния с помощью useState
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // TODO: Создайте состояние selectedAnswer для хранения выбранного ответа
  // Подсказка: используйте useState, тип number | null, начальное значение null
  // Формат: const [selectedAnswer, setSelectedAnswer] = useState<тип>(начальное_значение);

  // TODO: Создайте состояние score для подсчёта правильных ответов
  // Подсказка: используйте useState, тип number, начальное значение 0

  // TODO: Создайте состояние isFinished для отслеживания завершения игры
  // Подсказка: используйте useState, тип boolean, начальное значение false

  const currentQuestion: Question = mockQuestions[currentQuestionIndex];

  // Временные значения (удалите эти строки после создания состояний выше)
  const selectedAnswer = null;
  const score = 0;
  const isFinished = false;

  const handleAnswerClick = (answerIndex: number) => {
    // TODO: Реализуйте логику выбора ответа
    // 1. Проверьте, что ответ еще не был выбран (selectedAnswer === null)
    // 2. Сохраните выбранный ответ: setSelectedAnswer(answerIndex)
    // 3. Проверьте правильность: answerIndex === currentQuestion.correctAnswer
    // 4. Если ответ правильный - увеличьте счёт: setScore(score + 1)
  };

  const handleNextQuestion = () => {
    // TODO: Реализуйте переход к следующему вопросу
    // 1. Проверьте, последний ли это вопрос:
    //    currentQuestionIndex === mockQuestions.length - 1
    // 2. Если последний - завершите игру: setIsFinished(true)
    // 3. Если не последний:
    //    - Увеличьте индекс: setCurrentQuestionIndex(currentQuestionIndex + 1)
    //    - Сбросьте выбранный ответ: setSelectedAnswer(null)
  };

  const handleRestart = () => {
    // TODO: Реализуйте перезапуск игры
    // Сбросьте все состояния к начальным значениям:
    // setCurrentQuestionIndex(0);
    // setSelectedAnswer(null);
    // setScore(0);
    // setIsFinished(false);
  };

  // Экран результатов
  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold mb-4">Игра завершена!</h2>
          <div className="mb-6">
            <p className="text-5xl font-bold text-blue-600 mb-2">{score}</p>
            <p className="text-gray-600">из {mockQuestions.length} правильных</p>
          </div>
          <button
            onClick={handleRestart}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Начать заново
          </button>
        </div>
      </div>
    );
  }

  // Игровой экран
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок с прогрессом */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Вопрос {currentQuestionIndex + 1} из {mockQuestions.length}
            </span>
            <span className="text-xl font-bold text-blue-600">
              Счёт: {score}
            </span>
          </div>
          {/* Прогресс бар */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Карточка с вопросом */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {currentQuestion.question}
          </h2>

          {/* Варианты ответов */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = selectedAnswer !== null;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedAnswer !== null}
                  className={`
                    w-full p-4 text-left rounded-lg border-2 transition-all
                    ${!showResult && 'hover:border-blue-400 hover:bg-blue-50'}
                    ${!showResult && !isSelected && 'border-gray-200 bg-white'}
                    ${!showResult && isSelected && 'border-blue-500 bg-blue-50'}
                    ${showResult && isCorrect && 'border-green-500 bg-green-50'}
                    ${showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50'}
                    ${showResult && !isCorrect && !isSelected && 'opacity-60'}
                  `}
                >
                  <div className="flex items-center">
                    <span className={`
                      w-8 h-8 rounded-full flex items-center justify-center mr-3 font-semibold
                      ${!showResult && 'bg-gray-200'}
                      ${showResult && isCorrect && 'bg-green-500 text-white'}
                      ${showResult && isSelected && !isCorrect && 'bg-red-500 text-white'}
                    `}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Кнопка "Далее" */}
          {selectedAnswer !== null && (
            <button
              onClick={handleNextQuestion}
              className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {currentQuestionIndex === mockQuestions.length - 1
                ? 'Завершить'
                : 'Следующий вопрос'}
            </button>
          )}
        </div>

        {/* Подсказка */}
        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
          <p className="text-sm">
            <strong>Task 1:</strong> Управление состоянием с помощью useState.
            Реализуйте недостающую логику в обработчиках событий.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Task1;
