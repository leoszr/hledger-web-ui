# hledger-web-ui

Interface web moderna para o [hledger](https://hledger.org), ferramenta de contabilidade por linha de comando. Permite gerenciar arquivos `.journal`, visualizar relatórios financeiros, criar projeções, gerenciar investimentos e gerar gráficos — tudo via browser, sem banco de dados.

## Tecnologias

### Backend

- NestJS + TypeScript
- Execução do `hledger` via `child_process`
- Persistência em arquivos locais (`.journal` + JSONs)

### Frontend

- React + TypeScript
- Vite
- React Router
- Axios

### Infraestrutura

- Docker + Docker Compose

## Pré-requisitos

- Node.js 18+
- [hledger](https://hledger.org/install.html) instalado e disponível no PATH
- Docker (opcional, para execução em container)

## Como executar

### Opção 1 — Local (desenvolvimento)

```bash
./start.sh
```

O script verifica os pré-requisitos, instala dependências e inicia os serviços:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

Para encerrar:

```bash
./stop.sh
```

Para ver logs:

```bash
tail -f backend.log   # logs do backend
tail -f frontend.log  # logs do frontend
```

### Opção 2 — Docker (produção)

```bash
# Build das imagens (primeira vez)
./docker-build.sh

# Iniciar containers
./docker-start.sh
```

Acesse `http://localhost:8080`.

Para encerrar:

```bash
./docker-stop.sh
```

Ver logs dos containers:

```bash
docker-compose logs -f          # todos
docker-compose logs -f backend  # apenas backend
docker-compose logs -f frontend # apenas frontend
```

## Funcionalidades

- Upload e gerenciamento de arquivo `.journal`
- Relatórios: balance sheet, register, income statement
- Gráficos de despesas por conta
- Projeções financeiras baseadas em histórico
- CRUD de investimentos (ações, FIIs, renda fixa)
- Health check do sistema

## API — Principais endpoints

| Método | Rota                            | Descrição                  |
| ------ | ------------------------------- | -------------------------- |
| GET    | /api/health                     | Status do sistema          |
| GET    | /api/journal/status             | Status do arquivo journal  |
| POST   | /api/journal/upload             | Upload de arquivo .journal |
| GET    | /api/reports/balance            | Balance sheet              |
| GET    | /api/reports/register           | Register                   |
| GET    | /api/reports/income-statement   | Demonstração de resultado  |
| GET    | /api/charts/expenses-by-account | Gráfico de despesas        |
| POST   | /api/projections/run            | Gerar projeção financeira  |
| GET    | /api/investments                | Listar investimentos       |
| POST   | /api/investments                | Criar investimento         |
| PUT    | /api/investments/:id            | Atualizar investimento     |
| DELETE | /api/investments/:id            | Excluir investimento       |

## Persistência

Sem banco de dados. Os dados ficam em:

```
storage/
├── journals/
│   └── main.journal        # Fonte de verdade para transações
└── data/
    ├── settings.json
    ├── projections.json
    ├── investments.json
    └── rules.json
```

## Estrutura do projeto

```
hledger-web-ui/
├── backend/        # API NestJS
├── frontend/       # Interface React
├── storage/        # Dados persistentes (volume Docker)
├── start.sh        # Inicialização local
├── stop.sh         # Parada local
├── docker-build.sh
├── docker-start.sh
└── docker-stop.sh
```

## Desenvolvimento

```bash
# Testes do backend
cd backend && npm test

# Build do backend
cd backend && npm run build

# Build do frontend
cd frontend && npm run build
```
