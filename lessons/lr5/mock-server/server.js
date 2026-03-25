const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const SECRET_KEY = 'mock-jwt-secret-key';
const PORT = 3000;

// Middleware для CORS
server.use(middlewares);

// Middleware для парсинга body
server.use(jsonServer.bodyParser);

// ============ HELPER FUNCTIONS ============

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    SECRET_KEY,
    { expiresIn: '7d' }
  );
}

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}

function getCurrentUser(req, db) {
  const decoded = verifyToken(req);
  if (!decoded) return null;

  return db.get('users').find({ id: decoded.userId }).value();
}

function isAdmin(req, db) {
  const user = getCurrentUser(req, db);
  return user && user.role === 'admin';
}

function sendError(res, statusCode, error, message) {
  res.status(statusCode).json({
    error,
    message
  });
}

function calculateScore(question, selectedOptions) {
  let pointsFromCorrect = 0;
  let incorrectSelected = 0;
  let correctSelected = 0;
  const correctIndices = [];

  question.options.forEach((option, index) => {
    if (option.isCorrect) {
      correctIndices.push(index);
      if (selectedOptions.includes(index)) {
        pointsFromCorrect += option.points;
        correctSelected++;
      }
    } else {
      if (selectedOptions.includes(index)) {
        incorrectSelected++;
      }
    }
  });

  const penalty = incorrectSelected * question.penaltyPerWrong;
  const totalBeforeMin = pointsFromCorrect + penalty;
  const finalScore = Math.max(totalBeforeMin, question.minScore);

  const totalCorrect = question.options.filter(o => o.isCorrect).length;
  let status;
  if (correctSelected === totalCorrect && incorrectSelected === 0) {
    status = 'correct';
  } else if (correctSelected > 0) {
    status = 'partial';
  } else {
    status = 'incorrect';
  }

  return {
    pointsEarned: finalScore,
    status,
    correctOptions: correctIndices,
    breakdown: {
      correctSelected,
      incorrectSelected,
      pointsFromCorrect,
      penaltyFromIncorrect: penalty,
      totalBeforeMin
    }
  };
}

// ============ AUTH ENDPOINTS ============

// Mock GitHub OAuth
server.get('/api/auth/github', (req, res) => {
  // В реальном приложении здесь был бы redirect на GitHub
  res.json({
    message: 'Redirect to GitHub OAuth',
    mockLoginUrl: 'http://localhost:3000/api/auth/github/callback?code=mock_code'
  });
});

server.get('/api/auth/github/callback', (req, res) => {
  const db = router.db;

  // Mock: просто возвращаем первого студента
  const user = db.get('users').find({ role: 'student' }).value();

  if (!user) {
    return sendError(res, 404, 'NotFound', 'User not found');
  }

  const token = generateToken(user);

  res.json({
    token,
    user
  });
});

server.get('/api/auth/me', (req, res) => {
  const db = router.db;
  const user = getCurrentUser(req, db);

  if (!user) {
    return sendError(res, 401, 'Unauthorized', 'Authentication required');
  }

  res.json(user);
});

server.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Successfully logged out' });
});

// ============ MODE ENDPOINTS ============

server.get('/api/mode', (req, res) => {
  const db = router.db;
  const mode = db.get('mode').value();
  res.json(mode);
});

server.put('/api/mode', (req, res) => {
  const db = router.db;

  if (!isAdmin(req, db)) {
    return sendError(res, 403, 'Forbidden', 'Admin access required');
  }

  const { mode, battleConfig } = req.body;

  db.set('mode', { mode, battleConfig: mode === 'battle' ? battleConfig : null })
    .write();

  res.json(db.get('mode').value());
});

// ============ CATEGORIES ENDPOINTS ============

server.get('/api/categories', (req, res) => {
  const db = router.db;
  const categories = db.get('categories').value();
  res.json({ categories });
});

server.post('/api/categories', (req, res) => {
  const db = router.db;

  if (!isAdmin(req, db)) {
    return sendError(res, 403, 'Forbidden', 'Admin access required');
  }

  const category = {
    id: `cat_${Date.now()}`,
    ...req.body,
    questionCount: 0
  };

  db.get('categories').push(category).write();
  res.status(201).json(category);
});

// ============ QUESTIONS ENDPOINTS ============

server.get('/api/questions', (req, res) => {
  const db = router.db;
  const mode = db.get('mode.mode').value();

  // В Battle Mode вопросы скрыты
  if (mode === 'battle') {
    return sendError(
      res,
      403,
      'Forbidden',
      'Questions are hidden in Battle Mode. Create a session to start.'
    );
  }

  const { categoryId, difficulty, type, limit = 20, offset = 0 } = req.query;

  let questions = db.get('questions');

  if (categoryId) {
    questions = questions.filter({ categoryId });
  }
  if (difficulty) {
    questions = questions.filter({ difficulty });
  }
  if (type) {
    questions = questions.filter({ type });
  }

  const total = questions.size().value();
  const results = questions
    .slice(Number(offset), Number(offset) + Number(limit))
    .value();

  // Убираем информацию о правильных ответах
  const preview = results.map(q => {
    const preview = {
      id: q.id,
      type: q.type,
      question: q.question,
      difficulty: q.difficulty,
      categoryId: q.categoryId,
      maxPoints: q.maxPoints
    };

    if (q.type === 'multiple-select') {
      preview.options = q.options.map(o => o.text);
    } else if (q.type === 'essay') {
      preview.minLength = q.minLength;
      preview.maxLength = q.maxLength;
    }

    return preview;
  });

  res.json({
    questions: preview,
    total,
    limit: Number(limit),
    offset: Number(offset)
  });
});

// ============ ADMIN QUESTIONS ENDPOINTS ============

server.get('/api/admin/questions', (req, res) => {
  const db = router.db;

  if (!isAdmin(req, db)) {
    return sendError(res, 403, 'Forbidden', 'Admin access required');
  }

  const { categoryId, difficulty, type, limit = 50, offset = 0 } = req.query;

  let questions = db.get('questions');

  if (categoryId) {
    questions = questions.filter({ categoryId });
  }
  if (difficulty) {
    questions = questions.filter({ difficulty });
  }
  if (type) {
    questions = questions.filter({ type });
  }

  const total = questions.size().value();
  const results = questions
    .slice(Number(offset), Number(offset) + Number(limit))
    .value();

  res.json({
    questions: results,
    total
  });
});

server.post('/api/admin/questions', (req, res) => {
  const db = router.db;

  if (!isAdmin(req, db)) {
    return sendError(res, 403, 'Forbidden', 'Admin access required');
  }

  const now = new Date().toISOString();
  const question = {
    id: `q_${Date.now()}`,
    ...req.body,
    createdAt: now,
    updatedAt: now
  };

  // Вычисляем maxPoints
  if (question.type === 'multiple-select') {
    question.maxPoints = question.options
      .filter(o => o.isCorrect)
      .reduce((sum, o) => sum + o.points, 0);
  } else if (question.type === 'essay') {
    question.maxPoints = question.rubric
      .reduce((sum, r) => sum + r.maxPoints, 0);
  }

  db.get('questions').push(question).write();

  // Обновляем счетчик вопросов в категории
  const category = db.get('categories').find({ id: question.categoryId });
  if (category.value()) {
    category.assign({
      questionCount: category.value().questionCount + 1
    }).write();
  }

  res.status(201).json(question);
});

server.get('/api/admin/questions/:questionId', (req, res) => {
  const db = router.db;

  if (!isAdmin(req, db)) {
    return sendError(res, 403, 'Forbidden', 'Admin access required');
  }

  const question = db.get('questions')
    .find({ id: req.params.questionId })
    .value();

  if (!question) {
    return sendError(res, 404, 'NotFound', 'Question not found');
  }

  res.json(question);
});

// ============ SESSIONS ENDPOINTS ============

server.post('/api/sessions', (req, res) => {
  const db = router.db;
  const user = getCurrentUser(req, db);

  if (!user) {
    return sendError(res, 401, 'Unauthorized', 'Authentication required');
  }

  const mode = db.get('mode.mode').value();
  const { categoryIds, difficulty, questionCount = 10 } = req.body;

  // Получаем вопросы
  let questions = db.get('questions');

  if (mode === 'game') {
    // В Game Mode применяем фильтры пользователя
    if (categoryIds && categoryIds.length > 0) {
      questions = questions.filter(q => categoryIds.includes(q.categoryId));
    }
    if (difficulty) {
      questions = questions.filter({ difficulty });
    }
  } else {
    // В Battle Mode используем настройки пользователя или дефолтные
    const userSettings = db.get('userDifficultySettings')
      .find({ userId: user.id })
      .value();

    if (userSettings) {
      if (userSettings.difficulty) {
        questions = questions.filter({ difficulty: userSettings.difficulty });
      }
      if (userSettings.categoryIds && userSettings.categoryIds.length > 0) {
        questions = questions.filter(q =>
          userSettings.categoryIds.includes(q.categoryId)
        );
      }
    }
  }

  // Случайная выборка вопросов
  const allQuestions = questions.value();
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, questionCount);

  if (selectedQuestions.length === 0) {
    return sendError(res, 400, 'BadRequest', 'No questions available with these filters');
  }

  const sessionId = `sess_${Date.now()}`;
  const maxScore = selectedQuestions.reduce((sum, q) => sum + q.maxPoints, 0);

  const session = {
    sessionId,
    userId: user.id,
    status: 'active',
    mode,
    questionIds: selectedQuestions.map(q => q.id),
    totalQuestions: selectedQuestions.length,
    answeredCount: 0,
    maxScore,
    currentScore: 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
    expiresAt: mode === 'battle'
      ? new Date(Date.now() + 90 * 60 * 1000).toISOString() // 90 минут
      : null
  };

  db.get('sessions').push(session).write();

  // Формируем ответ с вопросами (без правильных ответов)
  const questionsPreview = selectedQuestions.map(q => {
    const preview = {
      id: q.id,
      type: q.type,
      question: q.question,
      difficulty: q.difficulty,
      categoryId: q.categoryId,
      maxPoints: q.maxPoints
    };

    if (q.type === 'multiple-select') {
      preview.options = q.options.map(o => o.text);
    } else if (q.type === 'essay') {
      preview.minLength = q.minLength;
      preview.maxLength = q.maxLength;
    }

    return preview;
  });

  res.status(201).json({
    ...session,
    questions: questionsPreview
  });
});

server.get('/api/sessions/:sessionId', (req, res) => {
  const db = router.db;
  const user = getCurrentUser(req, db);

  if (!user) {
    return sendError(res, 401, 'Unauthorized', 'Authentication required');
  }

  const session = db.get('sessions')
    .find({ sessionId: req.params.sessionId })
    .value();

  if (!session) {
    return sendError(res, 404, 'NotFound', 'Session not found');
  }

  if (session.userId !== user.id && user.role !== 'admin') {
    return sendError(res, 403, 'Forbidden', 'Access denied');
  }

  // Получаем вопросы
  const questions = session.questionIds.map(qId => {
    const q = db.get('questions').find({ id: qId }).value();
    const preview = {
      id: q.id,
      type: q.type,
      question: q.question,
      difficulty: q.difficulty,
      categoryId: q.categoryId,
      maxPoints: q.maxPoints
    };

    if (q.type === 'multiple-select') {
      preview.options = q.options.map(o => o.text);
    } else if (q.type === 'essay') {
      preview.minLength = q.minLength;
      preview.maxLength = q.maxLength;
    }

    return preview;
  });

  res.json({
    ...session,
    questions
  });
});

server.post('/api/sessions/:sessionId/answers', (req, res) => {
  const db = router.db;
  const user = getCurrentUser(req, db);

  if (!user) {
    return sendError(res, 401, 'Unauthorized', 'Authentication required');
  }

  const session = db.get('sessions')
    .find({ sessionId: req.params.sessionId })
    .value();

  if (!session) {
    return sendError(res, 404, 'NotFound', 'Session not found');
  }

  if (session.userId !== user.id) {
    return sendError(res, 403, 'Forbidden', 'Access denied');
  }

  const { questionId, selectedOptions, text } = req.body;

  const question = db.get('questions')
    .find({ id: questionId })
    .value();

  if (!question) {
    return sendError(res, 404, 'NotFound', 'Question not found');
  }

  const answerId = `ans_${Date.now()}`;

  if (question.type === 'multiple-select') {
    // Автоматическая проверка
    const result = calculateScore(question, selectedOptions);

    const answer = {
      answerId,
      sessionId: session.sessionId,
      questionId,
      userId: user.id,
      selectedOptions,
      status: result.status,
      pointsEarned: result.pointsEarned,
      maxPoints: question.maxPoints,
      feedback: `Вы набрали ${result.pointsEarned} из ${question.maxPoints} баллов.`,
      createdAt: new Date().toISOString()
    };

    db.get('answers').push(answer).write();

    // Обновляем сессию
    const sessionRef = db.get('sessions').find({ sessionId: session.sessionId });
    sessionRef.assign({
      answeredCount: session.answeredCount + 1,
      currentScore: session.currentScore + result.pointsEarned
    }).write();

    res.json({
      answerId,
      questionId,
      status: result.status,
      pointsEarned: result.pointsEarned,
      maxPoints: question.maxPoints,
      feedback: answer.feedback,
      correctOptions: result.correctOptions,
      breakdown: result.breakdown
    });
  } else if (question.type === 'essay') {
    // Сохраняем для ручной проверки
    const answer = {
      answerId,
      sessionId: session.sessionId,
      questionId,
      userId: user.id,
      text,
      status: 'pending',
      pointsEarned: 0,
      maxPoints: question.maxPoints,
      rubricScores: null,
      feedback: null,
      createdAt: new Date().toISOString()
    };

    db.get('answers').push(answer).write();

    // Обновляем счетчик
    const sessionRef = db.get('sessions').find({ sessionId: session.sessionId });
    sessionRef.assign({
      answeredCount: session.answeredCount + 1
    }).write();

    res.status(202).json({
      answerId,
      questionId,
      status: 'pending',
      message: 'Ответ сохранен и ожидает проверки преподавателем'
    });
  }
});

server.post('/api/sessions/:sessionId/submit', (req, res) => {
  const db = router.db;
  const user = getCurrentUser(req, db);

  if (!user) {
    return sendError(res, 401, 'Unauthorized', 'Authentication required');
  }

  const session = db.get('sessions')
    .find({ sessionId: req.params.sessionId });

  if (!session.value()) {
    return sendError(res, 404, 'NotFound', 'Session not found');
  }

  if (session.value().userId !== user.id) {
    return sendError(res, 403, 'Forbidden', 'Access denied');
  }

  session.assign({
    status: 'completed',
    completedAt: new Date().toISOString()
  }).write();

  // Возвращаем результаты
  res.json(getSessionResults(db, req.params.sessionId));
});

server.get('/api/sessions/:sessionId/results', (req, res) => {
  const db = router.db;
  const user = getCurrentUser(req, db);

  if (!user) {
    return sendError(res, 401, 'Unauthorized', 'Authentication required');
  }

  const session = db.get('sessions')
    .find({ sessionId: req.params.sessionId })
    .value();

  if (!session) {
    return sendError(res, 404, 'NotFound', 'Session not found');
  }

  if (session.userId !== user.id && user.role !== 'admin') {
    return sendError(res, 403, 'Forbidden', 'Access denied');
  }

  res.json(getSessionResults(db, req.params.sessionId));
});

function getSessionResults(db, sessionId) {
  const session = db.get('sessions').find({ sessionId }).value();
  const answers = db.get('answers').filter({ sessionId }).value();

  const hasPending = answers.some(a => a.status === 'pending');
  const status = hasPending ? 'partial' : 'completed';

  const detailedAnswers = answers.map(answer => {
    const question = db.get('questions').find({ id: answer.questionId }).value();

    const questionPreview = {
      id: question.id,
      type: question.type,
      question: question.question,
      difficulty: question.difficulty,
      categoryId: question.categoryId,
      maxPoints: question.maxPoints
    };

    if (question.type === 'multiple-select') {
      questionPreview.options = question.options.map(o => o.text);
    }

    const result = {
      answerId: answer.answerId,
      questionId: answer.questionId,
      question: questionPreview,
      status: answer.status,
      pointsEarned: answer.pointsEarned,
      maxPoints: answer.maxPoints,
      feedback: answer.feedback
    };

    if (question.type === 'multiple-select') {
      result.userAnswer = answer.selectedOptions;
      result.correctOptions = question.options
        .map((o, i) => o.isCorrect ? i : null)
        .filter(i => i !== null);
    } else if (question.type === 'essay') {
      result.userAnswer = answer.text;
      if (answer.rubricScores) {
        result.rubricScores = answer.rubricScores;
      }
    }

    return result;
  });

  const percentage = session.maxScore > 0
    ? (session.currentScore / session.maxScore * 100).toFixed(1)
    : 0;

  return {
    sessionId: session.sessionId,
    userId: session.userId,
    status,
    mode: session.mode,
    totalQuestions: session.totalQuestions,
    answeredQuestions: session.answeredCount,
    score: {
      earned: session.currentScore,
      max: session.maxScore,
      percentage: Number(percentage)
    },
    answers: detailedAnswers,
    completedAt: session.completedAt,
    timeSpent: session.completedAt
      ? Math.floor((new Date(session.completedAt) - new Date(session.createdAt)) / 1000)
      : null
  };
}

// ============ ADMIN USER ENDPOINTS ============

server.get('/api/admin/users', (req, res) => {
  const db = router.db;

  if (!isAdmin(req, db)) {
    return sendError(res, 403, 'Forbidden', 'Admin access required');
  }

  const { limit = 50, offset = 0 } = req.query;

  const users = db.get('users')
    .filter({ role: 'student' })
    .slice(Number(offset), Number(offset) + Number(limit))
    .value();

  const usersWithStats = users.map(user => {
    const sessions = db.get('sessions').filter({ userId: user.id }).value();
    const completed = sessions.filter(s => s.status === 'completed');

    const avgScore = completed.length > 0
      ? completed.reduce((sum, s) => sum + (s.currentScore / s.maxScore * 100), 0) / completed.length
      : 0;

    const lastSession = sessions.length > 0
      ? sessions[sessions.length - 1].createdAt
      : null;

    const settings = db.get('userDifficultySettings')
      .find({ userId: user.id })
      .value();

    return {
      ...user,
      stats: {
        totalSessions: sessions.length,
        completedSessions: completed.length,
        averageScore: Number(avgScore.toFixed(1)),
        lastSessionAt: lastSession
      },
      difficultySettings: settings || null
    };
  });

  res.json({
    users: usersWithStats,
    total: db.get('users').filter({ role: 'student' }).size().value()
  });
});

server.put('/api/admin/users/:userId/difficulty', (req, res) => {
  const db = router.db;

  if (!isAdmin(req, db)) {
    return sendError(res, 403, 'Forbidden', 'Admin access required');
  }

  const admin = getCurrentUser(req, db);
  const { userId } = req.params;
  const { difficulty, questionCount, categoryIds } = req.body;

  const user = db.get('users').find({ id: userId }).value();
  if (!user) {
    return sendError(res, 404, 'NotFound', 'User not found');
  }

  const settings = {
    userId,
    difficulty,
    questionCount,
    categoryIds: categoryIds || null,
    updatedAt: new Date().toISOString(),
    updatedBy: admin.id
  };

  const existing = db.get('userDifficultySettings').find({ userId });
  if (existing.value()) {
    existing.assign(settings).write();
  } else {
    db.get('userDifficultySettings').push(settings).write();
  }

  res.json(settings);
});

server.get('/api/admin/users/:userId/results', (req, res) => {
  const db = router.db;

  if (!isAdmin(req, db)) {
    return sendError(res, 403, 'Forbidden', 'Admin access required');
  }

  const { userId } = req.params;
  const user = db.get('users').find({ id: userId }).value();

  if (!user) {
    return sendError(res, 404, 'NotFound', 'User not found');
  }

  const sessions = db.get('sessions')
    .filter({ userId })
    .value()
    .map(session => getSessionResults(db, session.sessionId));

  res.json({
    userId,
    user,
    sessions
  });
});

server.post('/api/admin/answers/:answerId/grade', (req, res) => {
  const db = router.db;

  if (!isAdmin(req, db)) {
    return sendError(res, 403, 'Forbidden', 'Admin access required');
  }

  const { answerId } = req.params;
  const { rubricScores, generalFeedback } = req.body;

  const answer = db.get('answers').find({ answerId });

  if (!answer.value()) {
    return sendError(res, 404, 'NotFound', 'Answer not found');
  }

  const totalPoints = rubricScores.reduce((sum, r) => sum + r.earnedPoints, 0);

  answer.assign({
    status: totalPoints > 0 ? 'partial' : 'incorrect',
    pointsEarned: totalPoints,
    rubricScores,
    feedback: generalFeedback
  }).write();

  // Обновляем счет в сессии
  const session = db.get('sessions').find({ sessionId: answer.value().sessionId });
  if (session.value()) {
    session.assign({
      currentScore: session.value().currentScore + totalPoints
    }).write();
  }

  res.json({
    answerId,
    questionId: answer.value().questionId,
    status: answer.value().status,
    pointsEarned: totalPoints,
    maxPoints: answer.value().maxPoints,
    rubricScores,
    feedback: generalFeedback
  });
});

// Используем дефолтный router для остальных запросов
server.use(router);

server.listen(PORT, () => {
  console.log(`🚀 Mock Quiz API Server running at http://localhost:${PORT}`);
  console.log(`📖 Available endpoints:`);
  console.log(`   - GET  /api/auth/github/callback?code=mock_code - Mock login`);
  console.log(`   - GET  /api/mode - Get current mode`);
  console.log(`   - GET  /api/categories - Get categories`);
  console.log(`   - GET  /api/questions - Get questions (Game Mode only)`);
  console.log(`   - POST /api/sessions - Create session`);
  console.log(`   - POST /api/sessions/:id/answers - Submit answer`);
  console.log(``);
  console.log(`🔑 To get auth token: GET /api/auth/github/callback?code=mock_code`);
  console.log(`   Use: Bearer <token> in Authorization header`);
});
