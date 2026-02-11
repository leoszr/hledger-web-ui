
# TODO LIST — hledger-web-ui (Vite + React TS + NestJS TS, sem banco)

Objetivo: criar uma interface web local para o hledger, usando como fonte de verdade um arquivo `.journal` e persistindo dados auxiliares em JSON local. Sem PostgreSQL.

---

## 0) Stack final

Backend
- Node.js LTS
- NestJS (TypeScript)
- Execução do hledger via `child_process` (com timeout)
- Upload de arquivo via `multer`
- Validação com `class-validator` e `class-transformer`

Frontend
- Vite + React + TypeScript
- TailwindCSS
- Recharts
- React Hook Form + Zod (opcional)

Persistência
- `storage/journals/main.journal`
- JSONs locais em `storage/data/*.json`

Infra
- Docker
- Docker Compose
- Volume persistente para `storage/`

---

## 1) Estrutura do monorepo

- [ ] Criar pastas na raiz:
  - [ ] `backend/`
  - [ ] `frontend/`
  - [ ] `docker/`
  - [ ] `storage/`
    - [ ] `storage/journals/`
    - [ ] `storage/data/`

- [ ] Definir o arquivo principal do journal:
  - [ ] `storage/journals/main.journal`

- [ ] Definir arquivos JSON persistentes:
  - [ ] `storage/data/settings.json`
  - [ ] `storage/data/projections.json`
  - [ ] `storage/data/investments.json`
  - [ ] `storage/data/rules.json`

---

## 2) Backend (NestJS) — Setup base

- [ ] Criar projeto NestJS em `backend/`
- [ ] Configurar porta padrão: `3000`
- [ ] Habilitar CORS para o frontend (`http://localhost:5173`)
- [ ] Criar prefixo global:
  - [ ] `/api`

- [ ] Criar módulos base:
  - [ ] `HealthModule`
  - [ ] `JournalModule`
  - [ ] `ReportsModule`
  - [ ] `ChartsModule`
  - [ ] `ProjectionsModule`
  - [ ] `InvestmentsModule`
  - [ ] `RulesModule`

---

## 3) Backend — Config e paths (ponto crítico)

- [ ] Criar um arquivo único de paths:
  - [ ] `backend/src/config/paths.ts`

- [ ] Definir os paths absolutos usados no container:
  - [ ] `STORAGE_ROOT=/app/storage`
  - [ ] `JOURNAL_PATH=/app/storage/journals/main.journal`
  - [ ] `DATA_DIR=/app/storage/data`

- [ ] Garantir que o backend cria diretórios se não existirem:
  - [ ] `/app/storage/journals`
  - [ ] `/app/storage/data`

---

## 4) Backend — Storage local (JSON)

- [ ] Criar `backend/src/storage/JsonStorageService.ts`
- [ ] Implementar:
  - [ ] `readJson(filePath, fallback)`
  - [ ] `writeJsonAtomic(filePath, data)`

- [ ] Regras:
  - [ ] se o arquivo não existir, criar com fallback
  - [ ] escrita atômica:
    - escrever em `file.tmp`
    - renomear para o arquivo final

---

## 5) Backend — Endpoint de health

- [ ] Criar:
  - [ ] `GET /api/health`

- [ ] Retornar:
  - [ ] status do backend
  - [ ] se `main.journal` existe
  - [ ] se `hledger` está disponível
  - [ ] versão do hledger (se possível)

---

## 6) Backend — Runner do hledger (execução segura)

- [ ] Criar `backend/src/hledger/HledgerRunnerService.ts`
- [ ] Executar via:
  - [ ] `child_process.execFile` (preferível)
- [ ] Regras obrigatórias:
  - [ ] não aceitar comando livre do usuário
  - [ ] aceitar apenas parâmetros controlados (from, to, account, etc)
  - [ ] timeout (ex: 5000ms)
  - [ ] limitar tamanho da saída (evitar travamento)

- [ ] Sempre executar com:
  - [ ] `-f /app/storage/journals/main.journal`

---

## 7) Backend — Upload do journal

- [ ] Criar endpoint:
  - [ ] `POST /api/journal/upload`
  - [ ] multipart upload

- [ ] Validações:
  - [ ] extensão `.journal`
  - [ ] tamanho máximo (ex: 5 MB)

- [ ] Persistência:
  - [ ] salvar como `storage/journals/main.journal`

- [ ] Salvar metadata em `settings.json`:
  - [ ] `journal.originalName`
  - [ ] `journal.lastUploadAt`
  - [ ] `journal.sizeBytes`
  - [ ] `journal.sha256`

- [ ] Criar endpoint:
  - [ ] `GET /api/journal/status`

---

## 8) Backend — Importação de CSV

Objetivo: permitir importar CSV e gerar transações no `.journal`.

- [ ] Criar endpoint:
  - [ ] `POST /api/import/csv`

- [ ] Upload:
  - [ ] `multipart file`

- [ ] Definir formato MVP do CSV:
  - [ ] `date`
  - [ ] `description`
  - [ ] `amount`
  - [ ] `account` (opcional)
  - [ ] `category` (opcional)

- [ ] Criar pipeline:
  - [ ] parse do CSV
  - [ ] normalização (datas, valores, separador decimal)
  - [ ] validação de linhas inválidas
  - [ ] preview do que será importado

- [ ] Criar endpoint de preview:
  - [ ] `POST /api/import/csv/preview`

- [ ] Criar endpoint para aplicar:
  - [ ] `POST /api/import/csv/apply`
  - [ ] adiciona transações no final do `main.journal`

- [ ] Garantir que o append no `.journal` seja seguro:
  - [ ] lock simples em memória (mutex)
  - [ ] evitar concorrência de escrita

---

## 9) Backend — Relatórios (hledger)

- [ ] Balance:
  - [ ] `GET /api/reports/balance?from=&to=&account=`
  - [ ] executar `hledger balance --json`

- [ ] Register:
  - [ ] `GET /api/reports/register?from=&to=&account=`
  - [ ] executar `hledger register --json`

- [ ] Income Statement:
  - [ ] `GET /api/reports/is?from=&to=`
  - [ ] executar `hledger is --json`

- [ ] Padronizar DTOs de retorno:
  - [ ] `ReportBalanceDto`
  - [ ] `ReportRegisterDto`
  - [ ] `ReportIncomeStatementDto`

---

## 10) Backend — Dados prontos para gráficos

- [ ] Criar:
  - [ ] `GET /api/charts/monthly-summary?from=&to=`

- [ ] Retornar por mês:
  - [ ] month (YYYY-MM)
  - [ ] income
  - [ ] expenses
  - [ ] net

- [ ] Criar:
  - [ ] `GET /api/charts/expenses-by-account?from=&to=&limit=`

- [ ] Retornar:
  - [ ] lista de contas com total (top N)

---

## 11) Backend — Projeções financeiras

- [ ] Criar persistência:
  - [ ] `storage/data/projections.json`

- [ ] Implementar projeções MVP:
  - [ ] média mensal dos últimos N meses
  - [ ] tendência linear simples (opcional)

- [ ] Endpoints:
  - [ ] `POST /api/projections/run`
  - [ ] `GET /api/projections/history`
  - [ ] `GET /api/projections/:id`

- [ ] Armazenar:
  - [ ] parâmetros usados
  - [ ] resultados mês a mês
  - [ ] timestamp

---

## 12) Backend — Módulo de investimentos (separado do hledger)

Objetivo: ter uma área separada para registrar ativos e alocação.

- [ ] Persistência:
  - [ ] `storage/data/investments.json`

- [ ] CRUD:
  - [ ] `GET /api/investments`
  - [ ] `POST /api/investments`
  - [ ] `PUT /api/investments/:id`
  - [ ] `DELETE /api/investments/:id`

- [ ] Gráficos:
  - [ ] `GET /api/investments/charts/allocation`

---

## 13) Backend — Regras de classificação (opcional)

Objetivo: permitir mapear descrições/contas para categorias.

- [ ] Persistência:
  - [ ] `storage/data/rules.json`

- [ ] Endpoints:
  - [ ] `GET /api/rules`
  - [ ] `POST /api/rules`
  - [ ] `DELETE /api/rules/:id`

- [ ] Aplicação:
  - [ ] usar regras no importador de CSV
  - [ ] sugerir conta/categoria automaticamente

---

## 14) Backend — Segurança mínima (uso pessoal)

- [ ] Criar ENV:
  - [ ] `APP_PASSWORD`

- [ ] Exigir header:
  - [ ] `x-app-password`

- [ ] Criar Guard global simples:
  - [ ] bloqueia tudo exceto `/api/health`

---

## 15) Frontend (Vite + React TS) — Setup base

- [ ] Criar projeto Vite React TS em `frontend/`
- [ ] Instalar TailwindCSS
- [ ] Instalar Recharts
- [ ] Instalar React Hook Form
- [ ] Criar `src/lib/api.ts` com fetch wrapper

- [ ] Definir env:
  - [ ] `VITE_API_URL=http://localhost:3000/api`
  - [ ] `VITE_APP_PASSWORD=...`

---

## 16) Frontend — Rotas obrigatórias

- [ ] `/upload`
- [ ] `/dashboard`
- [ ] `/reports/balance`
- [ ] `/reports/register`
- [ ] `/reports/is`
- [ ] `/projections`
- [ ] `/investments`
- [ ] `/settings`
- [ ] `/import/csv`

---

## 17) Frontend — Upload do journal

- [ ] Criar página `/upload`
- [ ] Upload de `.journal`
- [ ] Mostrar status atual:
  - [ ] nome do arquivo
  - [ ] data do último upload
  - [ ] tamanho

---

## 18) Frontend — Dashboard com gráficos

- [ ] Filtros:
  - [ ] from/to (período)

- [ ] Cards:
  - [ ] total income
  - [ ] total expenses
  - [ ] net

- [ ] Gráficos:
  - [ ] linha: net por mês
  - [ ] barras: income vs expenses por mês
  - [ ] pizza: expenses by account

---

## 19) Frontend — Relatórios

Balance
- [ ] filtros (from, to, account)
- [ ] tabela
- [ ] export CSV

Register
- [ ] filtros (from, to, account)
- [ ] tabela paginada (client-side MVP)
- [ ] busca por descrição

Income Statement
- [ ] filtros (from, to)
- [ ] tabela simples

---

## 20) Frontend — Importação CSV

- [ ] Página `/import/csv`
- [ ] Upload do CSV
- [ ] Preview das linhas importadas
- [ ] Mostrar erros de linhas inválidas
- [ ] Botão "Aplicar importação"
- [ ] Mensagem de sucesso e link para `/reports/register`

---

## 21) Frontend — Projeções

- [ ] Página `/projections`
- [ ] Form:
  - [ ] meses base (ex: 6)
  - [ ] horizonte (ex: 6)
- [ ] Botão "Gerar"
- [ ] Tabela mês a mês
- [ ] Gráfico do saldo projetado
- [ ] Histórico de projeções

---

## 22) Frontend — Investimentos

- [ ] Página `/investments`
- [ ] CRUD simples
- [ ] Card de patrimônio total
- [ ] Gráfico de alocação

---

## 23) Docker

- [ ] Criar Dockerfile do backend:
  - [ ] instalar hledger
  - [ ] copiar o código
  - [ ] build
  - [ ] rodar em produção
  - [ ] usar `/app/storage`

- [ ] Criar Dockerfile do frontend:
  - [ ] build do Vite
  - [ ] servir estático com nginx (recomendado)

- [ ] Criar `docker-compose.yml` na raiz:
  - [ ] `backend`
  - [ ] `frontend`
  - [ ] volume persistente: `./storage:/app/storage`

---

## 24) Checklist final do MVP

- [ ] Subir tudo com `docker compose up --build`
- [ ] Testar:
  - [ ] `GET /api/health`
  - [ ] upload do journal
  - [ ] reports
  - [ ] gráficos no dashboard
  - [ ] importação CSV
  - [ ] projeções
  - [ ] investimentos

---

