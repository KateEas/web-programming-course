# ---- Builder Stage ----
FROM node:20-alpine AS builder  #используем вот такое окружение

WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm ci --legacy-peer-deps

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Сборка TypeScript
RUN npm run build

# ---- Runner Stage ----
#создаем заново на основе такого окружения

FROM node:20-alpine AS runner 
WORKDIR /app

# Копируем собранный код и зависимости из builder
# Подгружает файлы с созданного ранее для уменьшения размера архива
COPY --from=builder /app/dist ./dist  
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma


# Создаем непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs
# На этом порту будет стараться запуститься
EXPOSE 3000 

# Команда запуска с ожиданием БД
CMD ["node", "dist/index.js"]