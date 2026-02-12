#!/bin/bash

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   hledger Web UI - Docker Start${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${BLUE}→${NC} Iniciando containers..."
docker-compose up -d

echo ""
echo -e "${BLUE}→${NC} Aguardando containers ficarem prontos..."
sleep 5

# Verifica status dos containers
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓${NC} Containers iniciados com sucesso"
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   ✓ Aplicação Rodando!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "Acesse: ${BLUE}http://localhost:8080${NC}"
    echo ""
    echo -e "Logs:"
    echo -e "  Todos:    ${YELLOW}docker-compose logs -f${NC}"
    echo -e "  Backend:  ${YELLOW}docker-compose logs -f backend${NC}"
    echo -e "  Frontend: ${YELLOW}docker-compose logs -f frontend${NC}"
    echo ""
    echo -e "Status: ${YELLOW}docker-compose ps${NC}"
    echo -e "Parar:  ${YELLOW}./docker-stop.sh${NC}"
    echo ""
else
    echo -e "${RED}✗${NC} Erro ao iniciar containers"
    docker-compose ps
    exit 1
fi
