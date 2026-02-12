.PHONY: help start stop logs status clean install build docker-build docker-start docker-stop docker-logs

help: ## Mostra esta mensagem de ajuda
	@echo "hledger Web UI - Comandos Disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# Execução Local
start: ## Inicia backend e frontend localmente
	./start.sh

stop: ## Para backend e frontend localmente
	./stop.sh

logs: ## Mostra logs do backend e frontend
	@echo "=== Backend Log ===" && tail -20 backend.log && echo "" && echo "=== Frontend Log ===" && tail -20 frontend.log

status: ## Verifica status dos processos
	@ps aux | grep -E "(node.*dist/main|vite)" | grep -v grep || echo "Nenhum processo rodando"

# Docker
docker-build: ## Faz build das imagens Docker
	./docker-build.sh

docker-start: ## Inicia containers Docker
	./docker-start.sh

docker-stop: ## Para containers Docker
	./docker-stop.sh

docker-logs: ## Mostra logs dos containers
	docker-compose logs -f

docker-status: ## Status dos containers
	docker-compose ps

# Desenvolvimento
install: ## Instala dependências do backend e frontend
	cd backend && npm install
	cd frontend && npm install

build: ## Compila backend e frontend
	cd backend && npm run build
	cd frontend && npm run build

clean: ## Remove node_modules e builds
	rm -rf backend/node_modules backend/dist
	rm -rf frontend/node_modules frontend/dist
	rm -f *.log

test: ## Executa testes
	cd backend && npm test
