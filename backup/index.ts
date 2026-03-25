import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { auth } from './routes/auth'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello World!')
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// С параметрами
app.get('/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ userId: id });
});

// POST с телом
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
