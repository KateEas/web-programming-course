/**
 * Задание 3: Responsive сетка
 *
 * Задачи:
 * 1. grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
 * 2. Скрыть рейтинг на мобильных: hidden md:flex
 */

const products = [
  { id: 1, name: 'Ноутбук', price: 89990, rating: 4.8, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300' },
  { id: 2, name: 'Смартфон', price: 69990, rating: 4.7, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300' },
  { id: 3, name: 'Планшет', price: 45990, rating: 4.6, image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300' },
  { id: 4, name: 'Наушники', price: 25990, rating: 4.9, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300' },
  { id: 5, name: 'Часы', price: 18990, rating: 4.5, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300' },
  { id: 6, name: 'Камера', price: 125990, rating: 4.9, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300' },
];

function Task3() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 3: Responsive сетка</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task3.tsx</code> и добавьте responsive классы
      </div>

      {/* TODO: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 */}
      <div>
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-md p-4">
            <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded" />
            <h3 className="text-lg font-bold mt-3">{p.name}</h3>
            {/* TODO: hidden md:flex */}
            <div className="mt-2 items-center gap-2">
              <span>⭐ {p.rating}</span>
            </div>
            <p className="text-xl font-bold text-blue-600 mt-2">{p.price.toLocaleString()} ₽</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-800 text-white rounded">
        <span className="md:hidden">📱 Mobile</span>
        <span className="hidden md:inline lg:hidden">💻 Tablet</span>
        <span className="hidden lg:inline">🖥 Desktop</span>
      </div>
    </div>
  );
}

export default Task3;
