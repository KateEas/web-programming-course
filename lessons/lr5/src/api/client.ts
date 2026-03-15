import axios, { AxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: (import.meta as unknown as {env: Record<string, any>} ).env?.VITE_API_URL || 'http://localhost:3000',
});

// Добавляем JWT токен к каждому запросу
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Перенаправляем на страницу логина
      localStorage.removeItem('auth_token');
      // В будущем здесь будет редирект
      console.warn('Unauthorized - token removed');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Функция для Orval
export const customFetch = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const promise = apiClient({
    ...config,
    ...options,
  }).then(({ data }) => data);

  return promise;
};
