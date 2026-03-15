import React, { useState, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

/**
 * Главный файл для запуска всех заданий лабораторной работы
 *
 * Здесь вы можете выбрать, какое задание запустить
 */

// Функция для создания lazy компонента с возможностью перезагрузки
const createLazyComponent = (importPath: string) => (timestamp: number) =>
  React.lazy(() => import(/* @vite-ignore */ `${importPath}?t=${timestamp}`));

// Информация о заданиях
const TASKS = [
  {
    text: "Задание 1-2: Основы (упрощенное)",
    createComponent: createLazyComponent("./task1-2_basic"),
  },
  {
    text: "Задание 3-4: Формы и Context (упрощенное)",
    createComponent: createLazyComponent("./task3-4_basic"),
  },
  {
    text: "Задание 1: Базовые компоненты (полное)",
    createComponent: createLazyComponent("./task1-basic-components"),
  },
  {
    text: "Задание 2: Хуки и состояние (полное)",
    createComponent: createLazyComponent("./task2-hooks-state"),
  },
  {
    text: "Задание 3: Формы и события (полное)",
    createComponent: createLazyComponent("./task3-forms-events"),
  },
  {
    text: "Задание 4: Продвинутые паттерны (полное)",
    createComponent: createLazyComponent("./task4-advanced-patterns"),
  },
];

// Компонент для отображения ошибок
const TaskErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
  onRetry?: () => void;
}> = ({ error, resetErrorBoundary, onRetry }) => (
  <div
    style={{
      padding: "20px",
      border: "2px solid red",
      borderRadius: "8px",
      backgroundColor: "#fff5f5",
    }}
  >
    <h2>🚨 Ошибка в задании</h2>
    <p>
      <strong>Что случилось:</strong> В коде этого задания есть ошибка.
    </p>
    <details style={{ marginTop: "15px" }}>
      <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
        Показать техническую информацию об ошибке
      </summary>
      <div
        style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#f1f1f1",
          borderRadius: "4px",
        }}
      >
        <p>
          <strong>Ошибка:</strong> {error.message}
        </p>
        <pre style={{ fontSize: "12px", overflow: "auto", maxHeight: "200px" }}>
          {error.stack}
        </pre>
      </div>
    </details>
    <div style={{ marginTop: "15px" }}>
      <p>
        💡 <strong>Что делать:</strong> Откройте файл задания, найдите и
        исправьте ошибку.
      </p>
      <button
        onClick={() => {
          onRetry?.();
          resetErrorBoundary();
        }}
        style={{ marginTop: "10px", padding: "8px 16px" }}
      >
        Попробовать снова
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | undefined>(() => {
    const hash = window.location.hash.slice(1); // убираем #
    const index = parseInt(hash, 10);
    return !isNaN(index) && index >= 0 && index < TASKS.length ? index : undefined;
  });
  const [refreshTimestamps, setRefreshTimestamps] = useState<Record<number, number>>({});

  // Функция для принудительного обновления компонента задания
  const forceRefresh = (taskIndex: number) => {
    setRefreshTimestamps(prev => ({
      ...prev,
      [taskIndex]: Date.now()
    }));
  };

  // Обработчик смены задания с принудительным обновлением
  const handleTaskChange = (index: number) => {
    setCurrentTaskIndex(index);
    window.location.hash = index.toString();
    forceRefresh(index);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Лабораторная работа 2: React + TypeScript</h1>
        <nav className="task-nav">
          {TASKS.map((task, index) => (
            <button
              key={index}
              className={currentTaskIndex === index ? "active" : ""}
              onClick={() => handleTaskChange(index)}
            >
              {task.text}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <ErrorBoundary
          FallbackComponent={(props) => (
            <TaskErrorFallback
              {...props}
              onRetry={() => currentTaskIndex !== undefined && forceRefresh(currentTaskIndex)}
            />
          )}
          resetKeys={[currentTaskIndex, currentTaskIndex !== undefined ? refreshTimestamps[currentTaskIndex] : 0]}
        >
          <Suspense fallback={<div>Загружается задание...</div>}>
            {currentTaskIndex === undefined && <div>Задание не выбрано</div>}
            {currentTaskIndex !== undefined &&
              TASKS[currentTaskIndex] &&
              React.createElement(
                TASKS[currentTaskIndex].createComponent(refreshTimestamps[currentTaskIndex] || Date.now())
              )}
            {currentTaskIndex !== undefined && !TASKS[currentTaskIndex] && (
              <div>Задание не найдено</div>
            )}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

// Рендерим приложение
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("Root container not found");
}

export default App;
