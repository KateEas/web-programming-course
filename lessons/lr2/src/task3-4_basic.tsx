/**
 * ЗАДАНИЕ 3-4: Формы и Context
 *
 * Упрощенное задание, объединяющее формы и Context API
 *
 * Что будем изучать:
 * - Типизация форм и событий
 * - Context API
 * - Custom hooks
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

// ============================================
// ЧАСТЬ 1: Простая форма
// ============================================

// TODO 1.1: Создайте интерфейс FormData с полями:
// - name: string
// - email: string
// - message: string

// TODO 1.2: Типизируйте компонент SimpleForm
function SimpleForm() {
  // TODO 1.3: Создайте состояние formData с типом FormData
  const [formData, setFormData] = useState(/* TODO */);
  const [submitted, setSubmitted] = useState(false);

  // TODO 1.4: Типизируйте обработчик изменения
  const handleChange = (e: /* TODO: тип события */) => {
    const { name, value } = e.target;
    // TODO: обновите formData
  };

  // TODO 1.5: Типизируйте обработчик отправки
  const handleSubmit = (e: /* TODO: тип события */) => {
    e.preventDefault();

    console.log('Отправлено:', formData);

    // TODO: установите submitted в true чтобы показать сообщение об успехе

    // TODO: через 3 секунды верните submitted в false
    // Подсказка: используйте setTimeout(() => setSubmitted(false), 3000)
  };

  return (
    <div className="simple-form">
      <h2>Форма обратной связи</h2>

      {submitted && (
        <div className="success">Форма отправлена успешно!</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* TODO: Поле имени */}
        <div className="form-group">
          <label htmlFor="name">Имя:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={/* TODO */}
            onChange={handleChange}
            required
          />
        </div>

        {/* TODO: Поле email */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={/* TODO */}
            onChange={handleChange}
            required
          />
        </div>

        {/* TODO: Поле сообщения */}
        <div className="form-group">
          <label htmlFor="message">Сообщение:</label>
          <textarea
            id="message"
            name="message"
            value={/* TODO */}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <button type="submit">Отправить</button>
      </form>
    </div>
  );
}

// ============================================
// ЧАСТЬ 2: Context API
// ============================================

// TODO 2.1: Создайте интерфейс User с полями:
// - id: number
// - name: string
// - email: string

// TODO 2.2: Создайте интерфейс UserContextType с полями:
// - user: User | null
// - login: (user: User) => void
// - logout: () => void

// TODO 2.3: Создайте Context
const UserContext = createContext</* TODO: тип */ | undefined>(undefined);

// TODO 2.4: Типизируйте UserProvider
function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    // TODO: реализуйте вход
  };

  const logout = () => {
    // TODO: реализуйте выход
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// TODO 2.5: Создайте custom hook useUser
// Должен возвращать тип UserContextType
// Должен проверять, что context не undefined и выбрасывать ошибку
function useUser(): /* TODO: добавьте возвращаемый тип */ {
  // TODO: получите context с помощью useContext
  // TODO: если context undefined, выбросьте ошибку
  // TODO: верните context
}

// TODO 2.6: Создайте компонент UserStatus
// Этот компонент показывает статус пользователя в header
function UserStatus() {
  // TODO: получите user и logout из useUser()

  if (!user) {
    return <span>Не авторизован</span>;
  }

  return (
    <div className="user-status">
      <span>Привет, {user.name}!</span>
      <button onClick={logout}>Выйти</button>
    </div>
  );
}

// TODO 2.7: Создайте компонент Profile
function Profile() {
  const { user, login } = useUser();

  const handleLogin = () => {
    login({
      id: 1,
      name: 'Иван Иванов',
      email: 'ivan@example.com'
    });
  };

  if (!user) {
    return (
      <div className="profile">
        <h2>Вы не авторизованы</h2>
        <button onClick={handleLogin}>Войти</button>
      </div>
    );
  }

  return (
    <div className="profile">
      <h2>Профиль</h2>
      <p>Имя: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}

// ============================================
// Главный компонент
// ============================================

function AppContent() {
  const [activeTab, setActiveTab] = useState<'form' | 'profile'>('form');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Приложение с формами и авторизацией</h1>
        {/* TODO 2.8: Добавьте компонент UserStatus здесь */}
        {/* <UserStatus /> */}
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'form' ? 'active' : ''}
          onClick={() => setActiveTab('form')}
        >
          Форма
        </button>
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Профиль
        </button>
      </nav>

      <div className="content">
        {activeTab === 'form' && <SimpleForm />}
        {activeTab === 'profile' && <Profile />}
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;