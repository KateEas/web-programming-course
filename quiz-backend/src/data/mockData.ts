// Моковые категории
export const mockCategories = [
    {
        id: 'cat-1',
        name: 'Математика',
        slug: 'mathematics',
        _count: { questions: 4 }
    },
    {
        id: 'cat-2',
        name: 'Программирование',
        slug: 'programming',
        _count: { questions: 4 }
    },
    {
        id: 'cat-3',
        name: 'Физика',
        slug: 'physics',
        _count: { questions: 3 }
    },
    {
        id: 'cat-4',
        name: 'История',
        slug: 'history',
        _count: { questions: 3 }
    }
]

// Моковые вопросы (без правильных ответов - для студентов)
export const mockQuestions = [
    {
        id: 'q-1',
        text: 'Сколько будет 2 + 2?',
        type: 'multiple-select',
        points: 5,
        categoryId: 'cat-1',
        category: {
            id: 'cat-1',
            name: 'Математика',
            slug: 'mathematics'
        }
    },
    {
        id: 'q-2',
        text: 'Какие числа являются простыми?',
        type: 'multiple-select',
        points: 10,
        categoryId: 'cat-1',
        category: {
            id: 'cat-1',
            name: 'Математика',
            slug: 'mathematics'
        }
    },
    {
        id: 'q-3',
        text: 'Объясните теорему Пифагора',
        type: 'essay',
        points: 10,
        categoryId: 'cat-1',
        category: {
            id: 'cat-1',
            name: 'Математика',
            slug: 'mathematics'
        }
    },
    {
        id: 'q-4',
        text: 'Какие языки являются языками программирования?',
        type: 'multiple-select',
        points: 10,
        categoryId: 'cat-2',
        category: {
            id: 'cat-2',
            name: 'Программирование',
            slug: 'programming'
        }
    },
    {
        id: 'q-5',
        text: 'Что такое REST API?',
        type: 'essay',
        points: 15,
        categoryId: 'cat-2',
        category: {
            id: 'cat-2',
            name: 'Программирование',
            slug: 'programming'
        }
    },
    {
        id: 'q-6',
        text: 'Чему равна скорость света?',
        type: 'multiple-select',
        points: 5,
        categoryId: 'cat-3',
        category: {
            id: 'cat-3',
            name: 'Физика',
            slug: 'physics'
        }
    },
    {
        id: 'q-7',
        text: 'В каком году началась Вторая мировая война?',
        type: 'multiple-select',
        points: 5,
        categoryId: 'cat-4',
        category: {
            id: 'cat-4',
            name: 'История',
            slug: 'history'
        }
    }
]

// Моковые вопросы с правильными ответами (для админа)
export const mockQuestionsWithAnswers = [
    {
        id: 'q-1',
        text: 'Сколько будет 2 + 2?',
        type: 'multiple-select',
        points: 5,
        categoryId: 'cat-1',
        correctAnswer: ['4'],
        category: {
            id: 'cat-1',
            name: 'Математика',
            slug: 'mathematics'
        }
    },
    {
        id: 'q-2',
        text: 'Какие числа являются простыми?',
        type: 'multiple-select',
        points: 10,
        categoryId: 'cat-1',
        correctAnswer: ['2', '3', '5', '7', '11'],
        category: {
            id: 'cat-1',
            name: 'Математика',
            slug: 'mathematics'
        }
    },
    {
        id: 'q-3',
        text: 'Объясните теорему Пифагора',
        type: 'essay',
        points: 10,
        categoryId: 'cat-1',
        correctAnswer: {
            definition: 5,
            formula: 3,
            example: 2
        },
        category: {
            id: 'cat-1',
            name: 'Математика',
            slug: 'mathematics'
        }
    },
    {
        id: 'q-4',
        text: 'Какие языки являются языками программирования?',
        type: 'multiple-select',
        points: 10,
        categoryId: 'cat-2',
        correctAnswer: ['JavaScript', 'Python', 'Java', 'C++', 'Ruby'],
        category: {
            id: 'cat-2',
            name: 'Программирование',
            slug: 'programming'
        }
    },
    {
        id: 'q-5',
        text: 'Что такое REST API?',
        type: 'essay',
        points: 15,
        categoryId: 'cat-2',
        correctAnswer: {
            definition: 5,
            methods: 3,
            examples: 2
        },
        category: {
            id: 'cat-2',
            name: 'Программирование',
            slug: 'programming'
        }
    }
]

// Мок-хранилище для сессий и ответов (в памяти)
export const mockSessions: any[] = []
export const mockAnswers: any[] = []
