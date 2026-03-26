import { FormEvent, useCallback, useEffect, useState } from 'react';

type ServerTodo = {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

// TODO(PWA): расширьте типы под офлайн-очередь операций.
type QueueAction = {
  id: string;
  type: 'create' | 'toggle' | 'delete';
  ts: number;
  payload: any; //для хранения данных операции (title для create, id/done для toggle, id для delete)
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function toLocalText(value: string) {
  const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('ru-RU');
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function apiFetchTodos(): Promise<ServerTodo[]> {
  const response = await fetch(`${API_BASE_URL}/api/todos`);
  const data = await parseJson<{ items: ServerTodo[] }>(response);
  return data.items;
}

async function apiCreate(title: string): Promise<ServerTodo> {
  const response = await fetch(`${API_BASE_URL}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  return parseJson<ServerTodo>(response);
}

async function apiToggle(todoId: number, done: boolean): Promise<ServerTodo> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done }),
  });

  return parseJson<ServerTodo>(response);
}

async function apiDelete(todoId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}

function registerServiceWorkerStarter() {
  // TODO(PWA-1): зарегистрируйте Service Worker.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[App] SW registered:', registration);
        })
        .catch((error) => {
          console.log('[App] SW registration failed:', error);
        });
    });
  }
}

export default function App() {
  const [todos, setTodos] = useState<ServerTodo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [queueActions, setQueueActions] = useState<QueueAction[]>(() => {
    const saved = localStorage.getItem('todoQueue');
    return saved ? JSON.parse(saved) : [];
  });
//Сохраняем очередь в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('todoQueue', JSON.stringify(queueActions));
  }, [queueActions]);


  const refreshFromServer = useCallback(async () => {
    const serverTodos = await apiFetchTodos();
    setTodos(serverTodos);
  }, []);

  // Функция добавления в очередь
  const addToQueue = useCallback((type: QueueAction['type'], payload: any) => {
    const newAction: QueueAction = {
      id: crypto.randomUUID(),
      type,
      ts: Date.now(),
      payload
    };
    setQueueActions(prev => [...prev, newAction]);
    setMessage(`Действие сохранено в офлайн-очередь (${queueActions.length + 1})`);
  }, [queueActions.length]);

  // Функция синхронизации очереди
  const syncQueue = useCallback(async () => {
    if (!isOnline) {
      console.log('[App] Cannot sync: offline');
      return;
    }

    if (queueActions.length === 0) {
      console.log('[App] Queue is empty');
      return;
    }

    console.log('[App] Syncing queue, items:', queueActions.length);
    setMessage('Синхронизация...');

    // Копируем очередь и очищаем (будем добавлять обратно только неудачные)
    const actionsToSync = [...queueActions];
    let successCount = 0;

    for (const action of actionsToSync) {
      try {
        switch (action.type) {
          case 'create':
            await apiCreate(action.payload.title);
            break;
          case 'toggle':
            await apiToggle(action.payload.id, action.payload.done);
            break;
          case 'delete':
            await apiDelete(action.payload.id);
            break;
        }
        console.log('[App] Synced action:', action.type, action.payload);
        // Удаляем из очереди только успешные
        setQueueActions(prev => prev.filter(a => a.id !== action.id));
        successCount++;
      } catch (error) {
        console.error('[App] Failed to sync action:', action, error);
      }
    }

    // ✅ Обновляем список задач после синхронизации
    try {
      await refreshFromServer();
      console.log('[App] Refreshed todos after sync');
    } catch (error) {
      console.error('[App] Failed to refresh todos:', error);
    }

    setMessage(`Синхронизация завершена. Синхронизировано: ${successCount}`);
  }, [isOnline, queueActions, refreshFromServer]);

  // Автоматическая синхронизация при появлении сети
  useEffect(() => {
    if (isOnline && queueActions.length > 0) {
      syncQueue();
    }
  }, [isOnline, queueActions.length, syncQueue]);


  
  const onCreate = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      //показываем задачу сразу
      const optimisticId = Date.now();
      const optimisticTodo: ServerTodo = {
        id: optimisticId,
        title: trimmed,
        done: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTodos(prev => [...prev, optimisticTodo]);

      try {
        // Отправляем на сервер
        const newTodo = await apiCreate(trimmed);

        // Заменяем оптимистичную задачу на реальную (с правильным ID)
        setTodos(prev => prev.map(t => t.id === optimisticId ? newTodo : t));
        setMessage('Задача добавлена.');
      } catch(error) {
        // TODO(PWA-3): если сеть недоступна, положить create-действие в офлайн-очередь.
        // Сохраняем в офлайн-очередь
        console.error('[App] Create failed:', error);
        // Убираем оптимистичную задачу при ошибке
        setTodos(prev => prev.filter(t => t.id !== optimisticId));
        // Сохраняем в офлайн-очередь
        addToQueue('create', { title: trimmed });
        setMessage('Не удалось добавить задачу. Сохранено в очередь.');}
    },
    [addToQueue]
  );

  const onToggle = useCallback(
    async (todo: ServerTodo) => {
      const newDone = !todo.done;
//Оптимистичная смена статуса
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, done: newDone } : t));

      try {
        await apiToggle(todo.id, !todo.done);
        setMessage('Статус обновлен.');
      } catch (error){
        console.error('[App] Toggle failed:', error);
        // TODO(PWA-3): при ошибке сети не терять toggle-действие, а складывать в очередь.
        // Возвращаем со старым статусом
        setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, done: todo.done } : t));
        // Сохраняем в офлайн-очередь
        addToQueue('toggle', { id: todo.id, done: newDone });
        setMessage('Не удалось обновить статус. Сохранено в очередь.');
      }
    },
    [addToQueue]
  );

  const onDelete = useCallback(
    async (todo: ServerTodo) => {
      setTodos(prev => prev.filter(t => t.id !== todo.id));

      try {
        await apiDelete(todo.id);
        setMessage('Задача удалена.');
      } catch(error) {
        console.error('[App] Delete failed:', error);
        // TODO(PWA-3): при ошибке сети не терять delete-действие, а складывать в очередь. 
        // Возвращаем задачу обратно при ошибке
        setTodos(prev => [...prev, todo]);
        // Сохраняем в офлайн-очередь
        addToQueue('delete', { id: todo.id });
        setMessage('Не удалось удалить задачу. Сохранено в очередь.');
      }
    },
    [addToQueue]
  );

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const value = inputValue;
      setInputValue('');
      await onCreate(value);
    },
    [inputValue, onCreate]
  );
  //для регистрации SW и загрузки данных
  useEffect(() => {
    registerServiceWorkerStarter();

    let cancelled = false;

    const bootstrap = async () => {
      try {
        await refreshFromServer();
      } catch {
        if (!cancelled) {
          setMessage('Не удалось загрузить данные. Проверьте, что backend запущен.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshFromServer]);

  //для online/offline (уже есть)
  useEffect(() => {
    // TODO(PWA-2): добавьте обработчики online/offline.
    // window.addEventListener('online', ...)
    // window.addEventListener('offline', ...)
    // и обновляйте isOnline + message.
    const handleOnline = () => {
      console.log('[App] Online event');
      setIsOnline(true);
      setMessage('Соединение восстановлено. Данные синхронизируются.');
    };

    const handleOffline = () => {
      console.log('[App] Offline event');
      setIsOnline(false);
      setMessage('Нет соединения. Изменения будут сохранены локально.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Устанавливаем начальное состояние
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <main className="app">
      <header className="header">
        <h1>Todo-сы</h1>
        <span className={`badge ${isOnline ? 'online' : 'offline'}`}>{isOnline ? 'online' : 'offline'}</span>
      </header>

      <p className="muted">
        Есть: online CRUD. Реализовать: PWA, offline-очередь и синхронизацию после reconnect.
      </p>

      <form className="toolbar" onSubmit={onSubmit}>
        <input
          type="text"
          maxLength={200}
          placeholder="Новая задача"
          required
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <button type="submit">Добавить</button>
        <button type="button" onClick={() => void syncQueue()} disabled={!isOnline || queueActions.length === 0}>
          Синхронизация ({queueActions.length})
        </button>
      </form>

      <section className="meta">
        <span className="badge">Офлайн-очередь: {queueActions.length}</span>
        <span className="badge">sync: TODO</span>
      </section>

      <section className="todo-note">
        <p>
          TODO(PWA-4): реализуйте очередь операций и автоматическую отправку после события <code>online</code>.
        </p>
      </section>

      {message ? <div className="message">{message}</div> : null}
      {isLoading ? <p>Загрузка...</p> : null}
      {!isLoading && todos.length === 0 ? <div className="empty">Пока нет задач</div> : null}

      <ul className="list">
        {todos.map((todo) => (
          <li className="item" key={todo.id}>
            <button type="button" onClick={() => void onToggle(todo)}>
              {todo.done ? '✅' : '⬜'}
            </button>
            <div>
              <div className={todo.done ? 'done' : ''}>{todo.title}</div>
              <div className="hint">Сервер · {toLocalText(todo.updatedAt)}</div>
            </div>
            <button type="button" onClick={() => void onDelete(todo)}>
              Удалить
            </button>
            <span className="hint">#{todo.id}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
