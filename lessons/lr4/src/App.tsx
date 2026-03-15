import { useState } from 'react';
import Task1 from './tasks/Task1';
import Task2 from './tasks/Task2';
import Task3 from './tasks/Task3';
import Task4 from './tasks/Task4';

type TaskId = 'task1' | 'task2' | 'task3' | 'task4';

const TASKS = {
  task1: { text: 'Task 1: useState', component: Task1 },
  task2: { text: 'Task 2: MobX', component: Task2 },
  task3: { text: 'Task 3: Zustand', component: Task3 },
  task4: { text: 'Task 4: MobX + Zustand', component: Task4 },
};

function App() {
  const [activeTask, setActiveTask] = useState<TaskId>('task1');
  const ActiveComponent = TASKS[activeTask].component;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Навигация */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-800">
              ЛР4: State Management
            </h1>
          </div>
          <div className="flex space-x-1 pb-2 overflow-x-auto">
            {Object.entries(TASKS).map(([key, task]) => (
              <button
                key={key}
                onClick={() => setActiveTask(key as TaskId)}
                className={`px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTask === key
                    ? 'bg-indigo-500 text-white'
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
      <main className="pt-24">
        <ActiveComponent />
      </main>
    </div>
  );
}

export default App;
