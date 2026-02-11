# Context - hledger-web-ui

## Visão Geral

Interface web local para o **hledger** focada em uso pessoal, sem banco de dados tradicional. A fonte de verdade é um arquivo `.journal` e dados auxiliares são persistidos em JSONs locais.

---

## Stack Técnica

### Backend
- **Framework**: NestJS + TypeScript
- **Porta**: 3000
- **Prefixo global**: `/api`
- **CORS**: `http://localhost:5173`
- **Execução hledger**: `child_process.execFile` com timeout de 5s
- **Persistência**: Arquivos locais (sem PostgreSQL)

### Frontend
- **Build tool**: Vite
- **Framework**: React + TypeScript
- **Porta dev**: 5173
- **UI**: TailwindCSS
- **Gráficos**: Recharts
- **Validação**: React Hook Form + Zod

### Infraestrutura
- **Docker**: Obrigatório
- **Compose**: backend + frontend
- **Volume persistente**: `./storage:/app/storage`

---

## Estrutura de Arquivos

```
hledger-web-ui/
├── backend/
│   └── src/
│       ├── config/
│       │   └── paths.ts           # Paths absolutos (/app/storage)
│       ├── storage/
│       │   └── json-storage.service.ts  # Escrita atômica de JSON
│       ├── hledger/
│       │   └── hledger-runner.service.ts  # Execução segura do hledger
│       ├── health/
│       ├── journal/
│       ├── reports/
│       ├── charts/
│       ├── projections/
│       ├── investments/
│       └── import/
├── frontend/
│   └── src/
│       ├── lib/
│       │   └── api.ts             # Fetch wrapper
│       ├── pages/
│       │   ├── Upload.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Balance.tsx
│       │   ├── Register.tsx
│       │   ├── IncomeStatement.tsx
│       │   ├── Projections.tsx
│       │   ├── Investments.tsx
│       │   ├── ImportCSV.tsx
│       │   └── Settings.tsx
│       └── components/
├── storage/                       # Volume Docker
│   ├── journals/
│   │   └── main.journal          # Fonte de verdade
│   └── data/
│       ├── settings.json
│       ├── projections.json
│       └── investments.json
└── docker-compose.yml
```

---

## Persistência (Sem Banco de Dados)

### Fonte de verdade
- **Localização**: `/app/storage/journals/main.journal` (dentro do container)
- **Upload**: até 20 MB
- **Comportamento**: perguntar sempre se substitui ou faz merge

### Dados auxiliares (JSON)
- `settings.json`: configurações gerais, moeda padrão, metadata do journal
- `projections.json`: histórico de projeções financeiras
- `investments.json`: registros de ativos e alocação

### Escrita Atômica (JsonStorageService)
1. Escrever em `file.tmp`
2. Renomear para arquivo final
3. Criar arquivo com fallback se não existir

---

## Endpoints Backend

### Health
- `GET /api/health`
  - Status do backend
  - Existência do main.journal
  - Disponibilidade e versão do hledger

### Journal
- `POST /api/journal/upload` (multipart, max 20MB)
- `GET /api/journal/status`

### Reports (hledger)
- `GET /api/reports/balance?from=&to=&account=`
- `GET /api/reports/register?from=&to=&account=`
- `GET /api/reports/is?from=&to=`

### Charts (dados processados)
- `GET /api/charts/monthly-summary?from=&to=`
  - Retorna: `{ month, income, expenses, net }[]`
- `GET /api/charts/expenses-by-account?from=&to=&limit=`
  - Retorna: top N contas com total

### Projections
- `POST /api/projections/run` (body: meses base, horizonte)
- `GET /api/projections/history`
- `GET /api/projections/:id`
- **Métodos**: média mensal dos últimos N meses + tendência linear

### Investments (CRUD)
- `GET /api/investments`
- `POST /api/investments`
- `PUT /api/investments/:id`
- `DELETE /api/investments/:id`
- **Campos**: ticker, quantidade, preçoMedio, tipo (ação/FII/renda fixa)

### Import CSV
- `POST /api/import/csv/preview` (multipart)
- `POST /api/import/csv/apply` (body: dados validados)
- **Mapeamento flexível**: usuário escolhe quais colunas do CSV correspondem a date, description, amount, etc.

---

## Rotas Frontend

- `/` → Redireciona para `/upload` (sem journal) ou `/dashboard` (com journal)
- `/upload` → Upload do .journal
- `/dashboard` → Visão geral com cards e gráficos
- `/reports/balance` → Relatório de saldos
- `/reports/register` → Registro de transações
- `/reports/is` → Income Statement (DRE)
- `/projections` → Projeções financeiras
- `/investments` → Gestão de ativos
- `/import/csv` → Importação de CSV
- `/settings` → Configurações (moeda padrão, etc)

---

## HledgerRunnerService (Segurança)

### Regras obrigatórias
1. **NÃO** aceitar comando livre do usuário
2. Aceitar apenas parâmetros controlados: `from`, `to`, `account`, `limit`
3. Sempre executar com `-f /app/storage/journals/main.journal`
4. **Timeout**: 5000ms
5. Limitar tamanho da saída (evitar travamento)
6. Usar `child_process.execFile` (não `exec` ou `spawn` com shell)

### Exemplo de comando seguro
```typescript
execFile('hledger', [
  '-f', '/app/storage/journals/main.journal',
  'balance',
  '--begin', '2024-01-01',
  '--end', '2024-12-31',
  '--json'
], { timeout: 5000 })
```

---

## Importação CSV

### Fluxo
1. **Upload**: usuário envia CSV
2. **Preview**: sistema faz parse e mostra amostra das linhas
3. **Mapeamento**: usuário escolhe quais colunas correspondem a cada campo
4. **Validação**: sistema valida datas, valores, etc.
5. **Apply**: append no final do `main.journal` com lock simples

### Formato CSV flexível
- Usuário mapeia colunas do CSV para: `date`, `description`, `amount`, `account`, `category`
- Auto-detecção de formato de data (ISO 8601 ou DD/MM/YYYY)
- Separador decimal: auto-detect (, ou .)

### Lock de escrita
- Mutex simples em memória (dentro do NestJS)
- Evita concorrência de escrita no .journal

---

## Dashboard

### Filtros
- Período: `from` e `to` (date pickers)

### Cards de resumo
- Total Income
- Total Expenses
- Net (líquido)

### Gráficos
1. **Linha**: Net por mês ao longo do tempo
2. **Barras agrupadas**: Income vs Expenses por mês
3. **Pizza**: Expenses by account (top 10)

---

## Projeções Financeiras

### Métodos implementados
1. **Média mensal**: calcula média dos últimos N meses e projeta
2. **Tendência linear**: regressão linear simples sobre saldo histórico

### Dados armazenados
- Parâmetros usados (meses base, horizonte)
- Resultados mês a mês (projetado)
- Timestamp da geração
- ID único para consulta

---

## Investimentos

### Estrutura básica
```typescript
{
  id: string;
  ticker: string;          // PETR4, MXRF11, etc
  quantidade: number;
  precoMedio: number;
  tipo: 'acao' | 'fii' | 'renda-fixa';
  createdAt: string;
  updatedAt: string;
}
```

### Gráfico de alocação
- Pizza mostrando % por tipo de ativo
- Card com patrimônio total

---

## Settings

### Configurações globais
- **Moeda padrão**: BRL, USD, EUR, etc (configurável)
- **Formato de data preferido**: ISO ou BR (para exibição)
- **Metadata do journal**:
  - Nome original do arquivo
  - Data do último upload
  - Tamanho em bytes
  - SHA256 hash

---

## Docker

### Dockerfile - Backend
```dockerfile
FROM node:lts-alpine
RUN apk add --no-cache hledger
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Dockerfile - Frontend
```dockerfile
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    volumes:
      - ./storage:/app/storage
    environment:
      - NODE_ENV=production

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
```

---

## Decisões de Produto

### ✅ Incluído no MVP
- Todos os endpoints listados
- React Hook Form + Zod
- Projeções: ambos os métodos (média + tendência)
- CSV: mapeamento flexível
- Investimentos: estrutura básica

### ❌ Não incluído no MVP
- Segurança (x-app-password guard)
- Módulo de regras de classificação
- Export CSV dos relatórios
- Multi-journal support
- API de cotações em tempo real

### 🔄 Comportamentos específicos
- Upload de journal: **sempre perguntar** se substitui ou faz merge
- Formato de data: **auto-detect** (ISO ou BR)
- Moeda: **configurável** via Settings
- Timeout hledger: **5 segundos**
- Max upload: **20 MB**

---

## Próximos Passos

1. ✅ Criar estrutura do monorepo
2. Backend: setup NestJS + módulos base
3. Backend: implementar JsonStorageService
4. Backend: implementar HledgerRunnerService
5. Backend: endpoints de health e journal
6. Backend: endpoints de reports e charts
7. Backend: endpoints de projections e investments
8. Backend: importação CSV
9. Frontend: setup Vite + TailwindCSS + Recharts
10. Frontend: páginas e componentes
11. Docker: Dockerfiles + compose
12. Testes: subir stack completa e validar fluxos

---

**Criado em**: 2026-02-11
**Versão**: MVP 1.0
