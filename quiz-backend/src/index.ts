import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import 'dotenv/config'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import {auth} from './routes/auth.js'
import sessionsRoutes from './routes/sessions.js'
import questionsRoutes from './routes/questions.js'
import adminRoutes from './routes/admin.js'

const app = new Hono()
// Middleware
app.use('*', logger())
app.use('*', cors())

// Routes
app.route('/api/auth', auth)
app.route('/api/sessions', sessionsRoutes)
app.route('/api/questions', questionsRoutes)
app.route('/api/admin', adminRoutes) 

app.get('/', (c) => {
  return c.text('Hello World!')
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})


app.get('/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ userId: id });
});


app.post('/users', async (c) => {
  const body = await c.req.json();
  return c.json({ created: body }, 201);
});

app.route('/api/auth', auth)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

export default app
