
# hledger-web-ui

Interface web simples para o **hledger**, com foco em uso pessoal.

O objetivo é fornecer uma UI moderna para:
- importar e gerenciar um arquivo `.journal`
- gerar relatórios (balance, register, is)
- gerar gráficos financeiros
- criar projeções financeiras
- importar dados via CSV
- armazenar configurações e dados extras em JSON local (sem banco)

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
- TailwindCSS
- Recharts (gráficos)

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
  backend/
  frontend/
  docker/
  storage/            # volume local (persistência)
    journals/
    data/
