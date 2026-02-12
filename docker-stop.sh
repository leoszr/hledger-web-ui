#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   hledger Web UI - Docker Stop${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${BLUE}→${NC} Parando containers..."
docker-compose down

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✓ Containers Parados${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
