
# TODO LIST — hledger-web-ui (Vite + React TS + NestJS TS, sem banco)

Objetivo: criar uma interface web local para o hledger, usando como fonte de verdade um arquivo `.journal` e persistindo dados auxiliares em JSON local. Sem PostgreSQL.

---

## 📊 PROGRESSO GERAL DO PROJETO

**Atualizado em:** 2026-02-11

### Status Atual: ≈ 5% Completo

#### ✅ Concluído (5%)
- Setup inicial do NestJS backend
- Configuração de porta, CORS e prefixo API
- Estrutura básica do monorepo
- Documentação completa (README, context.md, TODO.md)
- Git inicializado

#### 🚧 Em Progresso (0%)
- Nenhuma tarefa em andamento no momento

#### ❌ Pendente (95%)
**Backend (≈60% do projeto):**
- 3 services críticos: paths, storage, hledger runner
- 7 módulos completos com controllers/services
- 16 endpoints da API
- Persistência em JSON local

**Frontend (≈30% do projeto):**
- Setup completo do Vite + React + TypeScript
- TailwindCSS + Recharts
- 9 páginas/rotas
- Componentes e API client

**Infraestrutura (≈10% do projeto):**
- 2 Dockerfiles
- docker-compose.yml
- Estrutura de storage com arquivos JSON

### 🎯 Próximas Tarefas Prioritárias
1. Criar arquivos críticos de configuração (paths.ts, json-storage.service.ts, hledger-runner.service.ts)
2. Implementar HealthModule completo (primeiro endpoint funcional)
3. Criar estrutura de storage com arquivos JSON iniciais
4. Implementar JournalModule (upload do .journal)
5. Setup do frontend Vite + React

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

- [x] Criar pastas na raiz:
  - [x] `backend/` ✅ Criado com NestJS
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

- [x] Criar projeto NestJS em `backend/` ✅ Completo
- [x] Configurar porta padrão: `3000` ✅ Configurado em main.ts
- [x] Habilitar CORS para o frontend (`http://localhost:5173`) ✅ Configurado em main.ts
- [x] Criar prefixo global:
  - [x] `/api` ✅ Configurado em main.ts

- [ ] Criar módulos base:
  - [x] `HealthModule` ⚠️ Criado mas vazio (sem controller/service)
  - [ ] `JournalModule`
  - [ ] `ReportsModule`
  - [ ] `ChartsModule`
  - [ ] `ProjectionsModule`
  - [ ] `InvestmentsModule`
  - [ ] `RulesModule` (opcional)

---

## 3) Backend — Config e paths (ponto crítico)

⚠️ **PRIORIDADE MÁXIMA - Bloqueia outras implementações**

- [ ] Criar um arquivo único de paths:
  - [ ] `backend/src/config/paths.ts` ❌ NÃO EXISTE

- [ ] Definir os paths absolutos usados no container:
  - [ ] `STORAGE_ROOT=/app/storage`
  - [ ] `JOURNAL_PATH=/app/storage/journals/main.journal`
  - [ ] `DATA_DIR=/app/storage/data`

- [ ] Garantir que o backend cria diretórios se não existirem:
  - [ ] `/app/storage/journals`
  - [ ] `/app/storage/data`

**Status:** Nada implementado. Este é um bloqueador crítico para todos os outros módulos.

---

## 4) Backend — Storage local (JSON)

⚠️ **PRIORIDADE MÁXIMA - Service fundamental**

- [ ] Criar `backend/src/storage/JsonStorageService.ts` ❌ NÃO EXISTE
- [ ] Implementar:
  - [ ] `readJson(filePath, fallback)`
  - [ ] `writeJsonAtomic(filePath, data)`

- [ ] Regras:
  - [ ] se o arquivo não existir, criar com fallback
  - [ ] escrita atômica:
    - escrever em `file.tmp`
    - renomear para o arquivo final

**Status:** Nada implementado. Necessário para projections, investments, settings, etc.

---

## 5) Backend — Endpoint de health

- [ ] Criar:
  - [ ] `GET /api/health` ⚠️ Módulo criado mas sem implementação

- [ ] Retornar:
  - [ ] status do backend
  - [ ] se `main.journal` existe
  - [ ] se `hledger` está disponível
  - [ ] versão do hledger (se possível)

**Status atual:** HealthModule existe mas está completamente vazio. Precisa implementar controller e service.

---

## 6) Backend — Runner do hledger (execução segura)

⚠️ **PRIORIDADE MÁXIMA - Service fundamental**

- [ ] Criar `backend/src/hledger/HledgerRunnerService.ts` ❌ NÃO EXISTE
- [ ] Executar via:
  - [ ] `child_process.execFile` (preferível)
- [ ] Regras obrigatórias:
  - [ ] não aceitar comando livre do usuário
  - [ ] aceitar apenas parâmetros controlados (from, to, account, etc)
  - [ ] timeout (ex: 5000ms)
  - [ ] limitar tamanho da saída (evitar travamento)

- [ ] Sempre executar com:
  - [ ] `-f /app/storage/journals/main.journal`

**Status:** Nada implementado. Necessário para todos os reports e charts.

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

⚠️ **TODO O FRONTEND ESTÁ PENDENTE - 0% implementado**

- [ ] Criar projeto Vite React TS em `frontend/` ❌ Diretório vazio
- [ ] Instalar TailwindCSS
- [ ] Instalar Recharts
- [ ] Instalar React Hook Form
- [ ] Criar `src/lib/api.ts` com fetch wrapper

- [ ] Definir env:
  - [ ] `VITE_API_URL=http://localhost:3000/api`
  - [ ] `VITE_APP_PASSWORD=...`

**Status:** Nada criado. O diretório frontend/ está completamente vazio.

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

⚠️ **INFRAESTRUTURA PENDENTE - 0% implementado**

- [ ] Criar Dockerfile do backend: ❌ NÃO EXISTE
  - [ ] instalar hledger
  - [ ] copiar o código
  - [ ] build
  - [ ] rodar em produção
  - [ ] usar `/app/storage`

- [ ] Criar Dockerfile do frontend: ❌ NÃO EXISTE
  - [ ] build do Vite
  - [ ] servir estático com nginx (recomendado)

- [ ] Criar `docker-compose.yml` na raiz: ❌ NÃO EXISTE
  - [ ] `backend`
  - [ ] `frontend`
  - [ ] volume persistente: `./storage:/app/storage`

**Status:** Nada criado. Diretório docker/ está vazio.

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

## 📈 ESTATÍSTICAS DETALHADAS DO PROJETO

### Backend
- **Módulos:** 1/7 criados (14%) - HealthModule existe mas vazio
- **Services críticos:** 0/3 (0%) - paths.ts, JsonStorage, HledgerRunner
- **Controllers:** 0/7 (0%)
- **Endpoints API:** 0/16 (0%)
- **DTOs:** 0/10 (0%)

### Frontend
- **Setup:** 0/1 (0%)
- **Páginas:** 0/9 (0%)
- **Componentes:** 0/~20 (0%)
- **API Client:** 0/1 (0%)

### Infraestrutura
- **Dockerfiles:** 0/2 (0%)
- **docker-compose:** 0/1 (0%)
- **Storage structure:** 0/1 (0%)

### Documentação
- **README:** 1/1 (100%) ✅
- **Context:** 1/1 (100%) ✅
- **TODO:** 1/1 (100%) ✅

---

## 🎯 ROADMAP SUGERIDO

### Sprint 1: Fundação Backend (Semana 1)
**Objetivo:** Ter o primeiro endpoint funcional e estrutura de storage

1. Criar `config/paths.ts`
2. Criar `storage/JsonStorageService.ts`
3. Criar `hledger/HledgerRunnerService.ts`
4. Implementar HealthModule completo (controller + service)
5. Criar estrutura de diretórios storage/ com arquivos JSON

**Entregável:** `GET /api/health` funcional retornando status do hledger

### Sprint 2: Backend Core (Semana 2)
**Objetivo:** Upload de journal e relatórios básicos funcionando

6. Implementar JournalModule (upload e status)
7. Implementar ReportsModule (balance, register, is)
8. Implementar ChartsModule (monthly-summary, expenses-by-account)

**Entregável:** 7 endpoints funcionais para journal, reports e charts

### Sprint 3: Frontend Base (Semana 3)
**Objetivo:** Interface funcional para upload e visualização de dados

9. Setup Vite + React + TypeScript + TailwindCSS
10. Criar API client
11. Implementar página de Upload
12. Implementar Dashboard com gráficos
13. Implementar páginas de Reports (Balance, Register, IS)

**Entregável:** Interface web funcional para operações básicas

### Sprint 4: Features Avançadas (Semana 4)
**Objetivo:** Projeções, investimentos e importação CSV

14. Implementar ProjectionsModule
15. Implementar InvestmentsModule
16. Implementar ImportModule (CSV)
17. Criar páginas frontend correspondentes
18. Implementar Settings

**Entregável:** Todas as features do MVP funcionando

### Sprint 5: Deploy e Testes (Semana 5)
**Objetivo:** Aplicação pronta para produção

19. Criar Dockerfiles (backend e frontend)
20. Criar docker-compose.yml
21. Testes end-to-end
22. Documentação de deploy
23. Ajustes finais e polish

**Entregável:** Aplicação completa deployável via Docker

---

## 🔧 DEPENDÊNCIAS TÉCNICAS

### Backend (já instaladas)
- ✅ @nestjs/common, @nestjs/core, @nestjs/platform-express
- ✅ reflect-metadata, rxjs
- ✅ TypeScript, ESLint, Prettier, Jest

### Backend (faltam instalar)
- ❌ @nestjs/config (variáveis de ambiente)
- ❌ class-validator, class-transformer (validação)
- ❌ multer types: @types/multer (upload de arquivos)

### Frontend (tudo falta instalar)
- ❌ vite, react, react-dom
- ❌ @types/react, @types/react-dom
- ❌ typescript
- ❌ tailwindcss, postcss, autoprefixer
- ❌ recharts
- ❌ react-hook-form, @hookform/resolvers, zod
- ❌ react-router-dom

---

**Última atualização:** 2026-02-11  
**Responsável pela atualização:** Análise automatizada do projeto
