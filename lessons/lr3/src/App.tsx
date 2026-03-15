import { useState } from 'react';
import Task1 from './tasks/Task1';
import Task2 from './tasks/Task2';
import Task3 from './tasks/Task3';
import Task4 from './tasks/Task4';
import Task5 from './tasks/Task5';

type TaskId = 'task1' | 'task2' | 'task3' | 'task4' | 'task5';

const TASKS = {
  task1: { text: 'Задание 1: Стилизация карточек', component: Task1 },
  task2: { text: 'Задание 2: Кнопки и варианты', component: Task2 },
  task3: { text: 'Задание 3: Grid сетка', component: Task3 },
  task4: { text: 'Задание 4: Flex и Grid', component: Task4 },
  task5: { text: 'Задание 5: Responsive', component: Task5 },
};

function App() {
  const [activeTask, setActiveTask] = useState<TaskId>('task1');
  const ActiveComponent = TASKS[activeTask].component;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Навигация */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-800">
              ЛР3: Vite + Tailwind CSS
            </h1>
          </div>
          <div className="flex space-x-1 pb-2">
            {Object.entries(TASKS).map(([key, task]) => (
              <button
                key={key}
                onClick={() => setActiveTask(key as TaskId)}
                className={`px-4 py-2 rounded-t-lg transition-colors ${
                  activeTask === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {task.text}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Контент */}
      <main className="container mx-auto px-4 py-8">
        <ActiveComponent />
      </main>
    </div>
  );
}

export default App;
