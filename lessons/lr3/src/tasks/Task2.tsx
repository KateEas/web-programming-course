/**
 * Задание 2: Кнопки с вариантами
 *
 * Задачи:
 * 1. baseClasses: rounded font-medium transition-colors
 * 2. primary: bg-blue-500 text-white hover:bg-blue-600
 * 3. secondary: bg-gray-500 text-white hover:bg-gray-600
 * 4. small: px-3 py-1 text-sm | medium: px-4 py-2
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'small' | 'medium';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}

function Button({
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  ...props
}: ButtonProps) {
  // TODO: заполните классы
  const variantClasses: Record<ButtonVariant, string> = {
    primary: '',
    secondary: '',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    small: '',
    medium: '',
  };

  const baseClasses = '';

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}

function Task2() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 2: Кнопки с вариантами</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task2.tsx</code> и заполните объекты классов
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Варианты</h3>
          <div className="flex gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Размеры</h3>
          <div className="flex items-center gap-4">
            <Button size="small">Small</Button>
            <Button size="medium">Medium</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Task2;
