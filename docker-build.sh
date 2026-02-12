#!/bin/bash

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   hledger Web UI - Docker Build${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verifica se docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker não encontrado. Instale em: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Verifica se docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  docker-compose não encontrado. Instale em: https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker e docker-compose verificados"
echo ""

# Para containers anteriores
echo -e "${BLUE}→${NC} Parando containers anteriores..."
docker-compose down 2>/dev/null || true

# Build das imagens
echo -e "${BLUE}→${NC} Construindo imagens Docker..."
docker-compose build --no-cache

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✓ Build Concluído com Sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Para iniciar: ${YELLOW}./docker-start.sh${NC}"
echo ""
