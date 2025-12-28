# Инструкция по деплою проекта

## Обзор
- **Frontend**: Vercel
- **Backend**: Railway
- **Summary API**: Railway

**Real-time обновления:**
- **WebSocket**: Backend предоставляет WebSocket сервер на `/ws/approved-summaries` для связи с Summary API
- **SSE (Server-Sent Events)**: Backend предоставляет SSE эндпоинт `/api/email-groups/approved/sse` для клиентов
- При деплое на Railway WebSocket автоматически работает через wss:// (WebSocket Secure)

---

## 1. Подготовка к деплою

### 1.1 Переменные окружения

#### Backend (.env)
```env
# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=shipment_email_merger
DB_USER=postgres
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your-secret-key-min-32-chars

# Session
SESSION_SECRET=your-session-secret

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Server
PORT=3001
NODE_ENV=production

# CORS (можно указать несколько URL через запятую, замените на ваш Vercel URL после деплоя)
# Пример: CORS_ORIGIN=https://your-app.vercel.app,https://your-custom-domain.com
# ВАЖНО: 
# 1. Добавьте эту переменную в Railway Environment Variables после деплоя frontend на Vercel
# 2. Без этой переменной frontend не сможет подключиться к backend в production
# 3. Можно указать несколько URL через запятую для разных окружений
# 4. После деплоя на Vercel добавьте ваш домен (например: https://shipment-email-merger.vercel.app)
CORS_ORIGIN=https://your-app.vercel.app

# OAuth (Mail.ru)
MAILRU_CLIENT_ID=your-client-id
MAILRU_CLIENT_SECRET=your-client-secret
MAILRU_REDIRECT_URI=https://your-app.vercel.app/auth/callback
```

#### Frontend (.env.local или Environment Variables в Vercel)
```env
# В Vercel это нужно добавить в Environment Variables
# NEXT_PUBLIC_ префикс означает, что переменная будет доступна в браузере
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
```

#### Summary API (.env)
```env
# URL основного backend API
MAIN_API_URL=https://your-backend.railway.app

# Секретный ключ для внутренней аутентификации (должен совпадать с backend)
INTERNAL_API_TOKEN=your-internal-api-token

# Порт (по умолчанию 3002)
SUMMARY_API_PORT=3002

# Окружение
NODE_ENV=production
```

## 2. Деплой Backend на Railway

### 2.1 Создание проекта на Railway

1. Зайдите на [railway.app](https://railway.app)
2. Создайте новый проект
3. Выберите "Deploy from GitHub repo"

### 2.2 Настройка базы данных PostgreSQL

1. В проекте Railway нажмите "+ New"
2. Выберите "Database" → "PostgreSQL"
3. Railway автоматически создаст базу данных
4. Скопируйте переменные окружения из базы данных:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

### 2.3 Деплой Backend сервиса

1. В проекте Railway нажмите "+ New" → "GitHub Repo"
2. Выберите ваш репозиторий
3. Укажите root directory: `shipment-email-merger/backend`
4. Railway автоматически определит Node.js проект

### 2.4 Настройка переменных окружения на Railway

1. Откройте ваш сервис backend
2. Перейдите в "Variables"
3. Добавьте все переменные из раздела 1.1 (Backend)
4. **Важно**: 
   - Для `CORS_ORIGIN` используйте URL вашего Vercel приложения (добавьте после деплоя frontend)
   - Можно указать несколько URL через запятую: `https://app1.vercel.app,https://app2.vercel.app`

### 2.5 Получение URL Backend

1. После деплоя Railway предоставит URL вида: `https://your-backend-production.up.railway.app`
2. Скопируйте этот URL для использования в frontend

---

## 3. Деплой Frontend на Vercel

### 3.1 Подготовка проекта

1. Убедитесь, что в `shipment-email-merger/frontend/next.config.js` настроен `publicRuntimeConfig`:
```javascript
module.exports = {
  publicRuntimeConfig: {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
  },
};
```

### 3.2 Создание проекта на Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите "Add New" → "Project"
3. Импортируйте ваш GitHub репозиторий
4. Настройте проект:
   - **Framework Preset**: Next.js
   - **Root Directory**: `shipment-email-merger/frontend` (если проект в монорепозитории)

### 3.3 Добавление переменных окружения в Vercel

**КРИТИЧЕСКИ ВАЖНО:** Переменные окружения нужно добавить ДО первого деплоя или пересобрать проект после добавления.

1. В настройках проекта Vercel перейдите в **Settings** → **Environment Variables**
2. Добавьте переменную:
   - **Key**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: URL вашего backend на Railway (например: `https://your-backend-production.up.railway.app`)
3. **ВАЖНО**: После добавления переменной:
   - Перейдите в **Deployments**
   - Найдите последний деплой
   - Нажмите **"..."** → **"Redeploy"** (или создайте новый деплой через push в git)
   - Переменные с префиксом `NEXT_PUBLIC_` встраиваются в код во время сборки, поэтому нужен пересбор

### 3.4 Деплой

1. Нажмите "Deploy"
2. Vercel автоматически соберет и задеплоит проект
3. После завершения вы получите URL вида: `https://your-app.vercel.app`

### 3.5 Обновление CORS на Backend

1. Вернитесь в Railway → ваш backend сервис → Variables
2. Обновите `CORS_ORIGIN` на URL вашего Vercel приложения
3. Railway автоматически перезапустит сервис

---

## 4. Деплой Summary API (опционально)

### 4.1 Создание сервиса на Railway

1. В том же проекте Railway нажмите "+ New" → "GitHub Repo"
2. Выберите тот же репозиторий
3. Укажите root directory: `summary-api`

### 4.2 Настройка переменных окружения

Добавьте переменные из раздела 1.1 (Summary API)

---

## 5. Проверка деплоя

### 5.1 Проверка Backend

```bash
# Health check
curl https://your-backend.railway.app/api/health

# Должен вернуть: {"success":true,"data":{"status":"healthy"}}
```

### 5.2 Проверка Frontend

1. Откройте `https://your-app.vercel.app`
2. Проверьте, что страница загружается
3. Попробуйте авторизоваться

### 5.3 Проверка CORS

1. Откройте консоль браузера (F12)
2. Проверьте, что нет ошибок CORS
3. Если есть ошибки, проверьте `CORS_ORIGIN` в Railway

---

## 6. Настройка OAuth (Mail.ru)

### 6.1 Обновление Redirect URI

1. Зайдите в настройки приложения Mail.ru
2. Добавьте новый Redirect URI: `https://your-app.vercel.app/auth/callback`
3. Обновите `MAILRU_REDIRECT_URI` в Railway

---

## 7. Мониторинг и логи

### 7.1 Railway

- Логи доступны в разделе "Deployments" → выберите деплой → "View Logs"
- Метрики доступны в разделе "Metrics"

### 7.2 Vercel

- Логи доступны в разделе "Deployments" → выберите деплой → "View Function Logs"
- Аналитика доступна в разделе "Analytics"

---

## 8. Real-time обновления (WebSocket и SSE)

### 8.1 WebSocket для Summary API

Summary API автоматически подключается к WebSocket серверу backend для получения real-time уведомлений о новых approved summary.

**Настройка:**
- WebSocket сервер запускается автоматически на backend при старте
- URL WebSocket: `ws://your-backend.railway.app/ws/approved-summaries` (в production: `wss://`)
- Summary API автоматически подключается при старте
- При разрыве соединения Summary API автоматически переподключается

**Проверка:**
- Проверьте логи Summary API на наличие сообщений о подключении к WebSocket
- При успешном подключении в логах будет: `WebSocket connected to backend`

### 8.2 SSE для клиентов

Backend предоставляет SSE эндпоинт для клиентов (frontend, внешние системы).

**Использование:**
- URL: `https://your-backend.railway.app/api/email-groups/approved/sse?sessionId=YOUR_SESSION_ID`
- Клиенты подключаются через стандартный EventSource API
- При изменении статуса summary на `approved` все подключенные клиенты получают событие

**Пример подключения:**
```javascript
const eventSource = new EventSource('https://your-backend.railway.app/api/email-groups/approved/sse?sessionId=YOUR_SESSION_ID');

eventSource.addEventListener('approved_summary', (event) => {
    const data = JSON.parse(event.data);
    console.log('Received approved summary:', data);
});
```

**Примечание:** 
- SSE работает через HTTP, не требует дополнительных портов
- WebSocket требует поддержки WebSocket протокола (Railway поддерживает автоматически)

---

## 9. Troubleshooting

### Проблема: CORS ошибки

**Решение**: 
1. Проверьте `CORS_ORIGIN` в Railway (должен быть URL Vercel)
2. Убедитесь, что URL без слеша в конце
3. Перезапустите backend сервис

### Проблема: Backend не подключается к базе данных

**Решение**:
1. Проверьте переменные окружения базы данных в Railway
2. Убедитесь, что база данных запущена
3. Проверьте логи backend сервиса

### Проблема: Frontend не может подключиться к Backend

**Решение**:
1. Проверьте `NEXT_PUBLIC_BACKEND_URL` в Vercel
2. Убедитесь, что backend доступен (проверьте health check)
3. Проверьте CORS настройки