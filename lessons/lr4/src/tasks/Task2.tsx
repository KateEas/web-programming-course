import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';

/**
 * Task 2: Управление состоянием с помощью MobX
 *
 * Цель: Переписать логику из Task1 используя MobX
 *
 * Задание:
 * 1. Завершите реализацию GameStore в src/stores/gameStore.ts
 * 2. Используйте makeAutoObservable для создания observable состояния
 * 3. Реализуйте actions: startGame, selectAnswer, nextQuestion, finishGame, resetGame
 * 4. Реализуйте computed values: currentQuestion, progress, isLastQuestion, correctAnswersCount
 * 5. Оберните компонент в observer для автоматического обновления
 */

const Task2 = observer(() => {
  const { gameStatus, currentQuestion,
    // TODO: убрать комментарий после реализации стора
    // selectedAnswer, score, progress
  } = gameStore;
  const selectedAnswer = null; // TODO: заменить на gameStore.selectedAnswer
  const score = 0; // TODO: заменить на gameStore.score
  const progress = 0; // TODO: заменить на gameStore.progress

  // Стартовый экран
  if (gameStatus === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-4">Quiz Game</h1>
          <p className="text-gray-600 mb-8">MobX Edition</p>
          <button
            onClick={() => gameStore.startGame()}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-700 transition-all"
          >
            Начать игру
          </button>
          <div className="mt-4 bg-green-50 rounded-lg p-4 text-left">
            <p className="text-sm text-green-800">
              <strong>Task 2:</strong> Реализуйте GameStore с использованием MobX.
              Обратите внимание на автоматическую реактивность!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Экран результатов
  if (gameStatus === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold mb-4">Игра завершена!</h2>
          <div className="mb-6">
            <p className="text-5xl font-bold text-green-600 mb-2">{score}</p>
            {/* TODO: убрать комментарий после реализации стора */}
            {/* <p className="text-gray-600">
              Правильных ответов: {gameStore.correctAnswersCount} из {gameStore.questions.length}
            </p> */}
          </div>
          {/* TODO: убрать комментарий после реализации стора */}
          {/* <button
            onClick={() => gameStore.resetGame()}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Начать заново
          </button> */}
        </div>
      </div>
    );
  }

  // Игровой экран
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            {/* TODO: убрать комментарий после реализации стора */}
            {/* <span className="text-sm text-gray-600">
              Вопрос {gameStore.currentQuestionIndex + 1} из {gameStore.questions.length}
            </span> */}
            <span className="text-xl font-bold text-green-600">
              Счёт: {score}
            </span>
          </div>
          {/* Прогресс бар */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Карточка с вопросом */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="mb-4">
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${currentQuestion.difficulty === 'easy' && 'bg-green-100 text-green-700'}
              ${currentQuestion.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700'}
              ${currentQuestion.difficulty === 'hard' && 'bg-red-100 text-red-700'}
            `}>
              {currentQuestion.difficulty === 'easy' && 'Легкий'}
              {currentQuestion.difficulty === 'medium' && 'Средний'}
              {currentQuestion.difficulty === 'hard' && 'Сложный'}
            </span>
          </div>

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
                  onClick={() => gameStore.selectAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`
                    w-full p-4 text-left rounded-lg border-2 transition-all
                    ${!showResult && 'hover:border-green-400 hover:bg-green-50'}
                    ${!showResult && !isSelected && 'border-gray-200 bg-white'}
                    ${!showResult && isSelected && 'border-green-500 bg-green-50'}
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
          {/* TODO: убрать комментарий после реализации стора */}
          {/* {selectedAnswer !== null && (
            <button
              onClick={() => gameStore.nextQuestion()}
              className="mt-6 w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              {gameStore.isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
            </button>
          )} */}
        </div>

        {/* Подсказка */}
        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
          <p className="text-sm">
            <strong>MobX:</strong> Обратите внимание, что компонент автоматически обновляется
            при изменении observable полей в store. Не нужно вручную вызывать setState!
          </p>
        </div>
      </div>
    </div>
  );
});

export default Task2;
