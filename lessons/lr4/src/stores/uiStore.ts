import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '../types/quiz';

/**
 * UIStore - Zustand Store для управления UI состоянием
 *
 * Используется в Task3 и Task4
 */

interface UIStore {
  // Состояние
  theme: Theme;
  // TODO: Добавьте другие UI-состояния (soundEnabled)

  // Actions
  setTheme: (theme: Theme) => void;
  // TODO: Добавьте другие actions (toggleTheme, toggleSound)
}

// TODO: Создайте store с помощью create<UIStore>()
// Оберните в persist middleware для автосохранения в localStorage
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Начальное состояние
      theme: 'light', // TODO: Добавьте другие поля (soundEnabled и т.д.)

      // Actions
      setTheme: (theme: Theme) => set({ theme }),

      // TODO: Добавьте другие actions
      //   toggleTheme: () => set((state) => ...,
      //
      // Пример toggleSound:
      //   toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'ui-storage', // ключ в localStorage
    }
  )
);
