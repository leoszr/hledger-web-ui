# Guia Rápido - hledger Web UI

## Instalação e Execução

### Primeira Vez

```bash
# Clonar/navegar até o projeto
cd hledger-web-ui

# Opção 1: Executar localmente
./start.sh

# Opção 2: Executar com Docker
./docker-build.sh  # Primeira vez apenas
./docker-start.sh
```

### Uso Diário

**Local:**
```bash
./start.sh  # Inicia tudo
./stop.sh   # Para tudo
```

**Docker:**
```bash
./docker-start.sh  # Inicia containers
./docker-stop.sh   # Para containers
```

### Com Makefile (Opcional)

```bash
make help           # Ver todos os comandos
make start          # Inicia local
make stop           # Para local
make docker-start   # Inicia Docker
make docker-stop    # Para Docker
make logs           # Ver logs
```

---

## URLs

**Local:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api

**Docker:**
- Aplicação: http://localhost:8080

---

## Estrutura de Arquivos

```
hledger-web-ui/
├── backend/           # API NestJS
├── frontend/          # Interface React
├── storage/           # Dados persistidos
│   ├── journals/      # Arquivo .journal
│   └── data/         # JSONs (investimentos, projeções)
├── start.sh          # Iniciar localmente
├── stop.sh           # Parar localmente
├── docker-build.sh   # Build Docker
├── docker-start.sh   # Iniciar Docker
└── docker-stop.sh    # Parar Docker
```

---

## Troubleshooting

**Erro "address already in use" (porta em uso):**

O script agora para automaticamente containers Docker e processos anteriores. Se ainda assim der erro:

```bash
./stop.sh  # Para tudo (Docker e processos locais)
./start.sh # Inicia novamente
```

Ou manualmente:
```bash
# Para containers Docker
docker-compose down

# Para processos locais
pkill -9 -f 'node.*dist/main'
pkill -9 -f 'vite'

# Depois inicia
./start.sh
```

**Porta em uso:**
```bash
./stop.sh  # Para processos anteriores
```

**Limpar tudo e recomeçar:**
```bash
# Local
./stop.sh
rm -rf backend/node_modules frontend/node_modules
./start.sh

# Docker
./docker-stop.sh
docker-compose down -v
./docker-build.sh
./docker-start.sh
```

**Ver logs:**
```bash
# Local
tail -f backend.log
tail -f frontend.log

# Docker
docker-compose logs -f
```

---

## Funcionalidades

- ✅ Dashboard com status do sistema
- ✅ Upload de arquivo .journal
- ✅ Relatórios (balance, register, income statement)
- ✅ Gerenciamento de investimentos (ações, FIIs, renda fixa)
- ✅ Projeções financeiras

---

## Stack

- **Backend:** NestJS + TypeScript
- **Frontend:** Vite + React + TypeScript
- **Persistência:** Arquivos locais (JSON + .journal)
- **hledger:** Ferramenta CLI para contabilidade
