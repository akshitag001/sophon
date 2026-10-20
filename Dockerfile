# Multi-stage Dockerfile for single-container deployment of Sophon Advisor
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root, backend and frontend package files
COPY package.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm --prefix backend install
RUN npm --prefix frontend install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend and backend
RUN npm --prefix frontend run build
RUN npm --prefix backend run build

# Production runtime image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787
ENV DB_PATH=/app/data/xyrafin.db

# Copy built artifacts and runtime dependencies
COPY backend/package*.json ./backend/
RUN npm --prefix backend install --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/src/data ./backend/dist/data
COPY --from=builder /app/frontend/dist ./frontend/dist

RUN mkdir -p /app/data

EXPOSE 8787

CMD ["node", "backend/dist/server.js"]
