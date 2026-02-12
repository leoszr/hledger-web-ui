#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   hledger Web UI - Shutdown Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Para containers Docker se estiverem rodando
if command -v docker-compose &> /dev/null; then
    echo -e "${BLUE}→${NC} Parando containers Docker..."
    if docker-compose down 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Containers Docker parados"
    fi
fi

# Para o backend local
echo -e "${BLUE}→${NC} Parando backend local..."
if pkill -9 -f 'node.*dist/main' 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Backend parado"
else
    echo -e "${RED}✗${NC} Backend não estava rodando"
fi

# Para o frontend local
echo -e "${BLUE}→${NC} Parando frontend local..."
if pkill -9 -f 'vite' 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Frontend parado"
else
    echo -e "${RED}✗${NC} Frontend não estava rodando"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✓ Servidores Parados${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
