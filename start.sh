#!/bin/bash

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   hledger Web UI - Startup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verifica se hledger está instalado
if ! command -v hledger &> /dev/null; then
    echo -e "${YELLOW}⚠️  hledger não encontrado. Instale em: https://hledger.org/install.html${NC}"
    exit 1
fi

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js não encontrado. Instale em: https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Pré-requisitos verificados (hledger, node)"
echo ""

# Diretório base do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Função para verificar se porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Porta em uso
    else
        return 1  # Porta livre
    fi
}

# Para processos anteriores
echo -e "${BLUE}→${NC} Parando processos anteriores..."

# Para containers Docker se estiverem rodando
if command -v docker-compose &> /dev/null; then
    docker-compose down 2>/dev/null || true
fi

# Para processos Node.js locais
pkill -9 -f 'node.*dist/main' 2>/dev/null || true
pkill -9 -f 'vite' 2>/dev/null || true
sleep 2

# Verifica se as dependências foram instaladas
echo -e "${BLUE}→${NC} Verificando dependências..."

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependências do backend...${NC}"
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependências do frontend...${NC}"
    cd frontend
    npm install
    cd ..
fi

# Build do backend se necessário
if [ ! -d "backend/dist" ]; then
    echo -e "${YELLOW}⚠️  Compilando backend...${NC}"
    cd backend
    npm run build
    cd ..
fi

echo -e "${GREEN}✓${NC} Dependências OK"
echo ""

# Inicia Backend
echo -e "${BLUE}→${NC} Iniciando backend (porta 3000)..."
cd backend
npm run start:prod > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Aguarda o backend iniciar
sleep 3

# Verifica se o backend está rodando
if ! check_port 3000; then
    echo -e "${YELLOW}⚠️  Backend falhou ao iniciar. Verifique backend.log${NC}"
    tail -20 backend.log
    exit 1
fi

echo -e "${GREEN}✓${NC} Backend rodando (PID: $BACKEND_PID)"

# Inicia Frontend
echo -e "${BLUE}→${NC} Iniciando frontend (porta 5173)..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Aguarda o frontend iniciar
sleep 3

# Verifica se o frontend está rodando
if ! check_port 5173; then
    echo -e "${YELLOW}⚠️  Frontend falhou ao iniciar. Verifique frontend.log${NC}"
    tail -20 frontend.log
    exit 1
fi

echo -e "${GREEN}✓${NC} Frontend rodando (PID: $FRONTEND_PID)"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✓ Aplicação Iniciada com Sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend:  ${BLUE}http://localhost:3000/api/health${NC}"
echo -e "Frontend: ${BLUE}http://localhost:5173${NC}"
echo ""
echo -e "Logs:"
echo -e "  Backend:  ${YELLOW}tail -f backend.log${NC}"
echo -e "  Frontend: ${YELLOW}tail -f frontend.log${NC}"
echo ""
echo -e "Para parar: ${YELLOW}./stop.sh${NC}"
echo ""
