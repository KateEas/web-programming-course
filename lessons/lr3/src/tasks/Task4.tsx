/**
 * Задание 4: Flex и Grid layouts
 *
 * Задачи:
 * 1. Создайте flex контейнер с кнопками (TODO: используйте flex, gap, justify)
 * 2. Создайте grid галерею (TODO: используйте grid, grid-cols, gap)
 * 3. Центрируйте карточку (TODO: используйте flex, items-center, justify-center)
 */

const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];
const images = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200',
];

function Task4() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 4: Flex и Grid layouts</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-6 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task4.tsx</code> и добавьте flex/grid классы
      </div>

      <div className="space-y-8">
        {/* Flex: горизонтальные кнопки */}
        <div>
          <h3 className="text-lg font-semibold mb-3">1. Flex: кнопки в ряд</h3>
          {/* TODO: добавьте flex gap-3 */}
          <div>
            {colors.map(color => (
              <button key={color} className="bg-blue-500 text-white px-4 py-2 rounded">
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Grid: галерея изображений */}
        <div>
          <h3 className="text-lg font-semibold mb-3">2. Grid: галерея 2x2</h3>
          {/* TODO: добавьте grid grid-cols-2 gap-4 */}
          <div>
            {images.map((img, i) => (
              <img key={i} src={img} alt={`Image ${i + 1}`} className="w-full h-32 object-cover rounded" />
            ))}
          </div>
        </div>

        {/* Flex: центрирование */}
        <div>
          <h3 className="text-lg font-semibold mb-3">3. Flex: центрирование карточки</h3>
          {/* TODO: добавьте flex items-center justify-center h-64 bg-gray-200 rounded */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-700">Я по центру!</p>
            </div>
          </div>
        </div>

        {/* Flex: space-between */}
        <div>
          <h3 className="text-lg font-semibold mb-3">4. Flex: space-between</h3>
          <div className="bg-white p-4 rounded shadow">
            {/* TODO: добавьте flex justify-between items-center */}
            <div>
              <span className="font-semibold">Товар</span>
              <span className="text-blue-600 font-bold">5990 ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Task4;
