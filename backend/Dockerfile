# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Instalar hledger
RUN apk add --no-cache hledger

WORKDIR /app

# Copiar apenas o necessário do stage de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Criar diretório de storage
RUN mkdir -p /app/storage/journals /app/storage/data

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/main"]
