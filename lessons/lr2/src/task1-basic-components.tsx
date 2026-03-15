/**
 * Задание 1: Базовые типизированные компоненты
 *
 * Цель: Научиться создавать простые типизированные React компоненты
 *
 * Инструкции:
 * 1. Создайте интерфейсы для всех props
 * 2. Добавьте правильную типизацию к компонентам
 * 3. Убедитесь что все компоненты работают без ошибок TypeScript
 */

import React from 'react';

// ===== ЗАДАЧА 1.1: Простая карточка пользователя =====

// TODO: Создайте интерфейс UserCardProps со следующими свойствами:
// - name: string
// - email: string
// - age: number (опциональное)
// - avatar: string (опциональное)
// - isOnline: boolean

// TODO: Типизируйте компонент UserCard
function UserCard(/* TODO: добавьте типизацию props */) {
  return (
    <div className="user-card">
      {/* TODO: добавьте отображение avatar если он есть */}
      <h2>{/* TODO: отобразите name */}</h2>
      <p>{/* TODO: отобразите email */}</p>
      {/* TODO: отобразите age если он есть */}
      <span className={`status ${/* TODO: добавьте класс на основе isOnline */}`}>
        {/* TODO: отобразите статус онлайн/офлайн */}
      </span>
    </div>
  );
}

// ===== ЗАДАЧА 1.2: Кнопка с вариантами =====

// TODO: Создайте интерфейс ButtonProps со следующими свойствами:
// - children: React.ReactNode
// - variant: 'primary' | 'secondary' | 'danger'
// - size: 'small' | 'medium' | 'large'
// - disabled: boolean (опциональное, по умолчанию false)
// - onClick: () => void

// TODO: Типизируйте компонент Button
function Button(/* TODO: добавьте типизацию props */) {
  return (
    <button
      className={`btn btn--${/* TODO: используйте variant */} btn--${/* TODO: используйте size */}`}
      disabled={/* TODO: используйте disabled */}
      onClick={/* TODO: используйте onClick */}
    >
      {/* TODO: отобразите children */}
    </button>
  );
}

// ===== ЗАДАЧА 1.3: Простой список пользователей =====

// TODO: Создайте интерфейс UserListProps со следующими свойствами:
// - users: string[] (массив имен пользователей)
// - emptyMessage: string (опциональное, по умолчанию "Нет пользователей")

// TODO: Типизируйте компонент UserList
function UserList(/* TODO: добавьте типизацию props */) {
  // TODO: если users пустой, отобразите emptyMessage

  return (
    <ul className="user-list">
      {/* TODO: отрендерите users как <li> элементы */}
    </ul>
  );
}

// ===== ЗАДАЧА 1.4: Карточка с children =====

// TODO: Создайте интерфейс CardProps со следующими свойствами:
// - title: string
// - children: React.ReactNode
// - footer: React.ReactNode (опциональное)
// - className: string (опциональное)

// TODO: Типизируйте компонент Card
function Card(/* TODO: добавьте типизацию props */) {
  return (
    <div className={`card ${/* TODO: добавьте className если есть */}`}>
      <div className="card-header">
        <h3>{/* TODO: отобразите title */}</h3>
      </div>
      <div className="card-content">
        {/* TODO: отобразите children */}
      </div>
      {/* TODO: отобразите footer если он есть */}
    </div>
  );
}

// ===== ЗАДАЧА 1.5: Демо компонент =====

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isOnline: boolean;
}

// TODO: Типизируйте компонент App
function App() {
  const users: User[] = [
    { id: 1, name: 'Анна Иванова', email: 'anna@example.com', age: 28, isOnline: true },
    { id: 2, name: 'Петр Петров', email: 'petr@example.com', age: 35, isOnline: false },
    { id: 3, name: 'Мария Сидорова', email: 'maria@example.com', age: 24, isOnline: true }
  ];

  const userNames = users.map(user => user.name);

  const handleButtonClick = () => {
    console.log('Кнопка нажата!');
  };

  return (
    <div className="app">
      <Card
        title="Список пользователей"
        footer={<p>Всего пользователей: {users.length}</p>}
      >
        <UserList
          users={userNames}
          emptyMessage="Пользователей не найдено"
        />

        <div style={{ marginTop: '20px' }}>
          <Button
            variant="primary"
            size="medium"
            onClick={handleButtonClick}
          >
            Добавить пользователя
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default App;

// ===== БОНУСНЫЕ ЗАДАЧИ =====

// TODO BONUS 1: Примените utility типы для типизации параметров компонента
// TODO BONUS 2: Создайте generic компонент List<T> с render prop паттерном
// TODO BONUS 3: Добавьте поддержку ref forwarding в Button компонент