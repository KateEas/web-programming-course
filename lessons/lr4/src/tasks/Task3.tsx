import { useUIStore } from '../stores/uiStore';

/**
 * Task 3: Управление UI состоянием с помощью Zustand
 *
 * Цель: Создать UI store для управления настройками приложения
 *
 * Задание:
 * 1. Завершите реализацию UIStore в src/stores/uiStore.ts
 * 2. Реализуйте actions: toggleTheme, toggleSound, setTheme
 * 3. Используйте persist middleware для сохранения в localStorage
 * 4. Используйте селекторы для подписки только на нужные части состояния
 * 5. Примените тему к компоненту (светлая/тёмная)
 */

const Task3 = () => {
  // TODO: Используйте селекторы для получения состояния
  // Пример: const theme = useUIStore((state) => state.theme);
  const theme = useUIStore((state) => state.theme);
  // TODO: убрать комментарий после реализации стора
  // const soundEnabled = useUIStore((state) => state.soundEnabled);
  // const toggleTheme = useUIStore((state) => state.toggleTheme);
  // const toggleSound = useUIStore((state) => state.toggleSound);
  const soundEnabled = true; // TODO: заменить на селектор
  const toggleTheme = () => {}; // TODO: заменить на селектор
  const toggleSound = () => {}; // TODO: заменить на селектор

  // Цвета для светлой и тёмной темы
  const bgGradient = theme === 'light'
    ? 'from-orange-400 to-pink-500'
    : 'from-gray-800 to-gray-900';

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-300';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 transition-colors duration-300`}>
          <h1 className={`text-3xl font-bold mb-2 ${textColor}`}>
            Настройки приложения
          </h1>
          <p className={`${mutedText} mb-8`}>Zustand Edition</p>

          {/* Настройка темы */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
              Тема оформления
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => useUIStore.getState().setTheme('light')}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-semibold transition-all
                  ${theme === 'light'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                ☀️ Светлая
              </button>
              <button
                onClick={() => useUIStore.getState().setTheme('dark')}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-semibold transition-all
                  ${theme === 'dark'
                    ? 'bg-gray-700 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                🌙 Тёмная
              </button>
            </div>
          </div>

          {/* Настройка звука */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
              Звуковые эффекты
            </label>
            <button
              onClick={toggleSound}
              className={`
                w-full py-4 px-6 rounded-lg font-semibold transition-all
                ${soundEnabled
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                }
              `}
            >
              {soundEnabled ? '🔊 Звук включен' : '🔇 Звук выключен'}
            </button>
          </div>

          {/* Быстрое переключение темы */}
          <div className="mb-8">
            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
              Быстрое переключение
            </label>
            <button
              onClick={toggleTheme}
              className={`
                w-full py-4 px-6 rounded-lg font-semibold transition-all
                ${theme === 'light'
                  ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                  : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white'
                }
                hover:shadow-lg transform hover:scale-105
              `}
            >
              {theme === 'light' ? '🌙 Переключить на тёмную' : '☀️ Переключить на светлую'}
            </button>
          </div>

          {/* Информация */}
          <div className={`border-t pt-6 ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
            <h3 className={`text-lg font-semibold mb-3 ${textColor}`}>
              Текущее состояние
            </h3>
            <div className="space-y-2">
              <div className={`flex justify-between ${mutedText}`}>
                <span>Тема:</span>
                <span className="font-semibold">{theme === 'light' ? 'Светлая' : 'Тёмная'}</span>
              </div>
              <div className={`flex justify-between ${mutedText}`}>
                <span>Звук:</span>
                <span className="font-semibold">{soundEnabled ? 'Включен' : 'Выключен'}</span>
              </div>
              <div className={`flex justify-between ${mutedText}`}>
                <span>Сохранение:</span>
                <span className="font-semibold">localStorage ✓</span>
              </div>
            </div>
          </div>

          {/* Подсказка */}
          <div className={`mt-6 rounded-lg p-4 ${theme === 'light' ? 'bg-orange-50' : 'bg-gray-700'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-orange-800' : 'text-gray-300'}`}>
              <strong>Task 3:</strong> Реализуйте UIStore с использованием Zustand.
              Обратите внимание на persist middleware - настройки сохраняются автоматически!
              Попробуйте перезагрузить страницу.
            </p>
          </div>

          {/* Демонстрация селекторов */}
          <div className={`mt-4 rounded-lg p-4 ${theme === 'light' ? 'bg-blue-50' : 'bg-gray-700'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-blue-800' : 'text-gray-300'}`}>
              <strong>Селекторы:</strong> Каждая часть UI подписана только на нужную часть store.
              Изменение темы не вызовет ре-рендер компонента, который использует только soundEnabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task3;
