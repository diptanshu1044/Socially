# Socket Server for Socially

A real-time WebSocket server for the Socially application, built with Socket.io and Prisma.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file in the socket-server directory:
```env
DATABASE_URL="postgresql://username:password@host:5432/database_name"
NODE_ENV="production"
```

### 3. Generate Prisma Client
```bash
npm run build
```

### 4. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Debug mode
npm run dev:debug
```

## 📋 Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart
- `npm run dev:debug` - Start with Node.js debugger
- `npm run build` - Generate Prisma client
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run health` - Check database connection

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 8080)

### Database Setup
The socket server uses the same database as the main application. Make sure:
1. The database is accessible
2. The schema is up to date
3. The `DATABASE_URL` is correctly configured

## 🏥 Health Check

The server provides a health check endpoint:
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Troubleshooting

### Database Connection Issues
1. Verify `DATABASE_URL` is correct
2. Check if database is accessible
3. Run `npm run health` to test connection

### Prisma Issues
1. Run `npm run build` to regenerate Prisma client
2. Run `npm run db:push` to sync schema
3. Check Prisma logs for detailed errors

### Socket Connection Issues
1. Verify CORS settings
2. Check authentication tokens
3. Ensure proper environment variables

## 📊 Monitoring

The server logs include:
- Database connection status
- Socket connection events
- Message processing
- Error details

## 🚀 Deployment

### PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start start.js --name socket-server

# Monitor logs
pm2 logs socket-server

# Restart with new environment
pm2 restart socket-server --update-env
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

## 🔒 Security

- All socket connections require authentication
- Database queries are validated
- CORS is properly configured
- Input sanitization is implemented

## 📈 Performance

- Connection pooling for database
- Efficient message broadcasting
- Optimized query patterns
- Graceful error handling 