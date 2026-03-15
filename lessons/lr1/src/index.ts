/*
 * Главный файл для демонстрации TypeScript концепций
 * Запуск: npm run build && npm start
 */

console.log('🚀 TypeScript Lab 1');
console.log('============================================\n');

// базовые типы
function demonstrateBasicTypes() {
    console.log('📝 Базовые типы:');
    
    const name: string = "TypeScript";
    const version: number = 5.0;
    const isAwesome: boolean = true;
    
    console.log(`Язык: ${name}, версия: ${version}, крутой: ${isAwesome}\n`);
}

// интерфейсы
interface User {
    id: number;
    name: string;
    email: string;
    isActive?: boolean;
}

function demonstrateInterfaces() {
    console.log('🏗️ Интерфейсы:');
    
    const user: User = {
        id: 1,
        name: "Анна Петрова",
        email: "anna@example.com",
        isActive: true
    };
    
    console.log('Пользователь:', user);
    console.log('');
}

// generic функции
function identity<T>(arg: T): T {
    return arg;
}

function demonstrateGenerics() {
    console.log('🎭 Generics:');
    
    const stringResult = identity<string>("Hello TypeScript!");
    const numberResult = identity<number>(42);
    
    console.log('String result:', stringResult);
    console.log('Number result:', numberResult);
    console.log('');
}

// union типы
type Status = "loading" | "success" | "error";

function handleStatus(status: Status): string {
    switch (status) {
        case "loading":
            return "⏳ Загрузка...";
        case "success":
            return "✅ Успешно!";
        case "error":
            return "❌ Ошибка!";
        default:
            // TypeScript проверит что все варианты обработаны
            const _exhaustive: never = status;
            return _exhaustive;
    }
}

function demonstrateUnionTypes() {
    console.log('🔀 Union типы:');
    
    const statuses: Status[] = ["loading", "success", "error"];
    statuses.forEach(status => {
        console.log(`${status}: ${handleStatus(status)}`);
    });
    console.log('');
}

function main() {
    demonstrateBasicTypes();
    demonstrateInterfaces();
    demonstrateGenerics();
    demonstrateUnionTypes();
    
    console.log('📁 Откройте файлы task1-refactor.js - task6-type-problems.js');
    console.log('📖 Следуйте инструкциям в каждом файле');
    console.log('🔧 Используйте команды: npm run dev, npm run build, npm run type-check');
}

main();