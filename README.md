
# hledger-web-ui

Interface web simples para o **hledger**, com foco em uso pessoal.

O objetivo é fornecer uma UI moderna para:
- importar e gerenciar um arquivo `.journal`
- gerar relatórios (balance, register, is)
- gerar gráficos financeiros
- criar projeções financeiras
- importar dados via CSV
- armazenar configurações e dados extras em JSON local (sem banco)

## 📚 Documentação

- **[QUICKSTART.md](QUICKSTART.md)** - Guia rápido de 5 minutos
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Guia completo de desenvolvimento de features
- **[EXAMPLES.md](EXAMPLES.md)** - Exemplos práticos de código
- **[storage/journals/README.md](storage/journals/README.md)** - Informações sobre o arquivo journal de teste

---

## 🧱 Stack

### Backend
- NestJS + TypeScript
- Execução do `hledger` via processo (ProcessBuilder equivalente no Node: `child_process`)
- Persistência local via arquivos:
  - `.journal` principal
  - JSONs locais para memória recorrente

### Frontend
- Vite + React + TypeScript
- React Router
- Axios para HTTP client
- CSS Modules

### Infra
- Docker + Docker Compose
- Volume persistente para `/app/storage`

---

## 💾 Persistência (sem banco)

Este projeto **não usa PostgreSQL** (nem nenhum outro banco).

A fonte de verdade é o arquivo:

- `storage/journals/main.journal`

E os dados auxiliares ficam em:

- `storage/data/settings.json`
- `storage/data/projections.json`
- `storage/data/investments.json`
- `storage/data/rules.json`

---

## 📦 Estrutura do monorepo

```txt
hledger-web-ui/
  backend/              # API NestJS
    src/
      config/          # Configurações e paths
      storage/         # JsonStorageService
      hledger/         # HledgerRunnerService
      health/          # HealthModule
      journal/         # JournalModule (upload, status)
      reports/         # ReportsModule (balance, register, etc)
      charts/          # ChartsModule (gráficos)
      projections/     # ProjectionsModule (projeções financeiras)
      investments/     # InvestmentsModule (CRUD investimentos)
    dist/             # Código compilado
    package.json
  frontend/            # Interface React
    src/
      components/      # Componentes reutilizáveis
      pages/          # Páginas da aplicação
      services/       # API client
      types/          # TypeScript types
    package.json
  storage/            # Volume local (persistência)
    journals/         # Arquivos .journal
    data/            # JSONs (settings, projections, investments)
  docker-compose.yml  # Configuração Docker
  start.sh           # Script de inicialização local
  stop.sh            # Script de parada local
  docker-build.sh    # Build das imagens Docker
  docker-start.sh    # Inicia containers
  docker-stop.sh     # Para containers
```

---

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** v18+ ([instalar](https://nodejs.org/))
- **hledger** ([instalar](https://hledger.org/install.html))
- **Docker** (opcional, para ambiente containerizado)

### Opção 1: Executar Localmente (Desenvolvimento)

**Iniciar todos os serviços com um único comando:**

```bash
./start.sh
```

Este script vai:
- ✅ Verificar pré-requisitos (hledger, node)
- ✅ Instalar dependências se necessário
- ✅ Compilar o backend se necessário
- ✅ Iniciar backend (porta 3000)
- ✅ Iniciar frontend (porta 5173)

**Acessar a aplicação:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

**Parar os serviços:**

```bash
./stop.sh
```

**Ver logs:**

```bash
# Backend
tail -f backend.log

# Frontend
tail -f frontend.log
```

### Opção 2: Executar com Docker (Produção)

**1. Build das imagens (primeira vez):**

```bash
./docker-build.sh
```

**2. Iniciar containers:**

```bash
./docker-start.sh
```

**Acessar a aplicação:**
- http://localhost:8080

**Parar containers:**

```bash
./docker-stop.sh
```

**Ver logs:**

```bash
# Todos os containers
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

**Ver status:**

```bash
docker-compose ps
```

---

## 📋 Funcionalidades Implementadas

### ✅ Backend (NestJS + TypeScript)

**Módulos:**
- **HealthModule** - Health check do sistema
- **JournalModule** - Upload e gerenciamento do arquivo .journal
- **ReportsModule** - Relatórios do hledger (balance, register, income statement)
- **ChartsModule** - Dados para gráficos
- **ProjectionsModule** - Projeções financeiras baseadas em histórico
- **InvestmentsModule** - CRUD de investimentos (ações, FIIs, renda fixa)

**APIs:**
- `GET /api/health` - Status do sistema
- `GET /api/journal/status` - Status do journal
- `POST /api/journal/upload` - Upload de journal
- `GET /api/reports/balance` - Balance sheet
- `GET /api/reports/register` - Register
- `GET /api/reports/income-statement` - Income statement
- `GET /api/reports/accounts` - Lista de contas
- `GET /api/charts/expenses-by-account` - Despesas por conta
- `POST /api/projections/run` - Gerar projeção
- `GET /api/projections/history` - Histórico de projeções
- `GET /api/investments` - Listar investimentos
- `POST /api/investments` - Criar investimento
- `PUT /api/investments/:id` - Atualizar investimento
- `DELETE /api/investments/:id` - Excluir investimento

### ✅ Frontend (React + TypeScript)

**Páginas:**
- **Dashboard** - Visão geral do sistema
- **Relatórios** - Visualização de relatórios do hledger
- **Investimentos** - Gerenciamento de carteira de investimentos
- **Projeções** - Criação e visualização de projeções financeiras
- **Journal** - Upload e status do arquivo journal

**Recursos:**
- Navegação com React Router
- API client tipado com TypeScript
- Formulários para CRUD de investimentos
- Tabelas e visualização de dados
- Proxy para API do backend

---

## 🛠️ Desenvolvimento

### Estrutura de Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Build de Produção

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## 📝 Notas

- Os dados são persistidos localmente em `storage/`
- Não utiliza banco de dados
- O arquivo `.journal` é a fonte de verdade para transações
- Dados auxiliares (investimentos, projeções) são armazenados em JSON
