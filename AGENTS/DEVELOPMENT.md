# Guia de Desenvolvimento e Integração de Features

## 🎯 Objetivo

Este documento sistematiza o processo completo de desenvolvimento e integração de novas funcionalidades no **hledger Web UI**, garantindo que o sistema permaneça estável e consistente.

---

## 📋 Índice

1. [Arquitetura do Sistema](#arquitetura-do-sistema)
2. [Checklist de Desenvolvimento](#checklist-de-desenvolvimento)
3. [Backend: Criando um Novo Módulo](#backend-criando-um-novo-módulo)
4. [Frontend: Criando uma Nova Página/Feature](#frontend-criando-uma-nova-páginafeature)
5. [Integração Backend-Frontend](#integração-backend-frontend)
6. [Testes e Validação](#testes-e-validação)
7. [Convenções e Padrões](#convenções-e-padrões)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

**Backend:**
- Framework: NestJS (Node.js + TypeScript)
- Persistência: Arquivos JSON locais (sem banco de dados)
- Integração: hledger via `child_process`
- Porta: 3000

**Frontend:**
- Framework: React 19 + TypeScript + Vite
- Routing: React Router DOM
- HTTP Client: Axios
- Porta: 5173 (dev) / 8080 (Docker)

### Estrutura de Pastas

```
hledger-web-ui/
├── backend/
│   └── src/
│       ├── config/          # Configurações e paths
│       ├── storage/         # JsonStorageService
│       ├── hledger/         # HledgerRunnerService
│       ├── [feature]/       # Módulo da feature
│       │   ├── dto/         # Data Transfer Objects
│       │   ├── [feature].controller.ts
│       │   ├── [feature].service.ts
│       │   ├── [feature].module.ts
│       │   └── [feature].spec.ts (testes)
│       ├── app.module.ts    # Módulo raiz
│       └── main.ts          # Entry point
├── frontend/
│   └── src/
│       ├── components/      # Componentes reutilizáveis
│       ├── pages/          # Páginas da aplicação
│       ├── services/       # API client (api.ts)
│       ├── types/          # TypeScript types (api.ts)
│       └── App.tsx         # Router principal
└── storage/
    ├── journals/           # Arquivos .journal
    └── data/              # JSONs (*.json)
```

---

## ✅ Checklist de Desenvolvimento

Use este checklist para **TODA nova feature**:

### Backend
- [ ] 1. Criar DTOs em `dto/[feature].dto.ts`
- [ ] 2. Criar Service em `[feature].service.ts`
- [ ] 3. Criar Controller em `[feature].controller.ts`
- [ ] 4. Criar Module em `[feature].module.ts`
- [ ] 5. Registrar módulo em `app.module.ts`
- [ ] 6. Adicionar tipos em `frontend/src/types/api.ts`
- [ ] 7. Adicionar endpoints em `frontend/src/services/api.ts`
- [ ] 8. Compilar backend: `npm run build`
- [ ] 9. Testar endpoints com curl/Postman
- [ ] 10. Escrever testes unitários

### Frontend
- [ ] 11. Criar página em `pages/[Feature].tsx`
- [ ] 12. Criar CSS em `pages/[Feature].css`
- [ ] 13. Adicionar rota em `App.tsx`
- [ ] 14. Adicionar link na navegação (`Layout.tsx`)
- [ ] 15. Testar integração com API
- [ ] 16. Validar responsividade e UX

### Persistência (se aplicável)
- [ ] 17. Criar arquivo JSON em `storage/data/[feature].json`
- [ ] 18. Adicionar path em `backend/src/config/paths.ts`
- [ ] 19. Inicializar arquivo com estrutura correta

### Documentação
- [ ] 20. Atualizar `README.md` (se necessário)
- [ ] 21. Documentar API endpoints
- [ ] 22. Adicionar comentários no código

---

## 🔧 Backend: Criando um Novo Módulo

### Passo 1: Criar Estrutura de Pastas

```bash
cd backend/src
mkdir -p [feature]/dto
```

### Passo 2: Criar DTOs

**Arquivo:** `backend/src/[feature]/dto/[feature].dto.ts`

```typescript
// DTOs de entrada (request)
export class Create[Feature]Dto {
  campo1: string;
  campo2: number;
  campo3: 'tipo1' | 'tipo2';
}

export class Update[Feature]Dto {
  campo1?: string;
  campo2?: number;
  campo3?: 'tipo1' | 'tipo2';
}

// DTOs de saída (response)
export class [Feature]Dto {
  id: string;
  campo1: string;
  campo2: number;
  campo3: 'tipo1' | 'tipo2';
  createdAt: string;
  updatedAt: string;
}

export class [Feature]ResponseDto {
  success: boolean;
  [feature]: [Feature]Dto;
}

export class [Feature]ListResponseDto {
  success: boolean;
  [features]: [Feature]Dto[];
}
```

**⚠️ IMPORTANTE:**
- Use nomes descritivos e consistentes
- Sempre inclua tipos explícitos
- DTOs de response devem incluir `success: boolean`
- Use `?` para campos opcionais

### Passo 3: Criar Service

**Arquivo:** `backend/src/[feature]/[feature].service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonStorageService } from '../storage/json-storage.service';
import { PATHS } from '../config/paths';
import { v4 as uuidv4 } from 'uuid';
import {
  Create[Feature]Dto,
  Update[Feature]Dto,
  [Feature]Dto,
  [Feature]ResponseDto,
  [Feature]ListResponseDto,
} from './dto/[feature].dto';

interface [Feature]sData {
  [features]: [Feature]Dto[];
}

@Injectable()
export class [Feature]sService {
  constructor(private readonly jsonStorage: JsonStorageService) {}

  async findAll(): Promise<[Feature]ListResponseDto> {
    const data = await this.jsonStorage.readJson<[Feature]sData>(
      PATHS.[FEATURE]_JSON,
      { [features]: [] },
    );
    
    return {
      success: true,
      [features]: data.[features] || [],
    };
  }

  async findOne(id: string): Promise<[Feature]ResponseDto> {
    const data = await this.jsonStorage.readJson<[Feature]sData>(
      PATHS.[FEATURE]_JSON,
      { [features]: [] },
    );
    
    const item = data.[features].find((i) => i.id === id);
    
    if (!item) {
      throw new NotFoundException(`[Feature] with id ${id} not found`);
    }
    
    return {
      success: true,
      [feature]: item,
    };
  }

  async create(dto: Create[Feature]Dto): Promise<[Feature]ResponseDto> {
    const data = await this.jsonStorage.readJson<[Feature]sData>(
      PATHS.[FEATURE]_JSON,
      { [features]: [] },
    );
    
    const now = new Date().toISOString();
    const newItem: [Feature]Dto = {
      id: uuidv4(),
      ...dto,
      createdAt: now,
      updatedAt: now,
    };
    
    data.[features].push(newItem);
    await this.jsonStorage.writeJsonAtomic(PATHS.[FEATURE]_JSON, data);
    
    return {
      success: true,
      [feature]: newItem,
    };
  }

  async update(id: string, dto: Update[Feature]Dto): Promise<[Feature]ResponseDto> {
    const data = await this.jsonStorage.readJson<[Feature]sData>(
      PATHS.[FEATURE]_JSON,
      { [features]: [] },
    );
    
    const index = data.[features].findIndex((i) => i.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`[Feature] with id ${id} not found`);
    }
    
    const updated = {
      ...data.[features][index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    
    data.[features][index] = updated;
    await this.jsonStorage.writeJsonAtomic(PATHS.[FEATURE]_JSON, data);
    
    return {
      success: true,
      [feature]: updated,
    };
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const data = await this.jsonStorage.readJson<[Feature]sData>(
      PATHS.[FEATURE]_JSON,
      { [features]: [] },
    );
    
    const index = data.[features].findIndex((i) => i.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`[Feature] with id ${id} not found`);
    }
    
    data.[features].splice(index, 1);
    await this.jsonStorage.writeJsonAtomic(PATHS.[FEATURE]_JSON, data);
    
    return {
      success: true,
      message: `[Feature] with id ${id} deleted successfully`,
    };
  }
}
```

**⚠️ IMPORTANTE:**
- SEMPRE use `readJson` com fallback: `{ [features]: [] }`
- SEMPRE use `writeJsonAtomic` (não `write`)
- SEMPRE use `uuidv4()` para IDs
- SEMPRE use `NotFoundException` quando item não for encontrado
- SEMPRE retorne DTOs tipados

### Passo 4: Criar Controller

**Arquivo:** `backend/src/[feature]/[feature].controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { [Feature]sService } from './[features].service';
import {
  Create[Feature]Dto,
  Update[Feature]Dto,
  [Feature]ResponseDto,
  [Feature]ListResponseDto,
} from './dto/[feature].dto';

@Controller('[features]')
export class [Feature]sController {
  constructor(private readonly [features]Service: [Feature]sService) {}

  @Get()
  async findAll(): Promise<[Feature]ListResponseDto> {
    return this.[features]Service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<[Feature]ResponseDto> {
    return this.[features]Service.findOne(id);
  }

  @Post()
  async create(@Body() dto: Create[Feature]Dto): Promise<[Feature]ResponseDto> {
    return this.[features]Service.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Update[Feature]Dto,
  ): Promise<[Feature]ResponseDto> {
    return this.[features]Service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return this.[features]Service.remove(id);
  }
}
```

**⚠️ IMPORTANTE:**
- Use `@Controller('[features]')` no plural
- Endpoints padrão REST: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
- SEMPRE use decoradores de validação do NestJS

### Passo 5: Criar Module

**Arquivo:** `backend/src/[feature]/[feature].module.ts`

```typescript
import { Module } from '@nestjs/common';
import { [Feature]sController } from './[features].controller';
import { [Feature]sService } from './[features].service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [[Feature]sController],
  providers: [[Feature]sService],
  exports: [[Feature]sService],
})
export class [Feature]sModule {}
```

**⚠️ IMPORTANTE:**
- SEMPRE importe `StorageModule` se usar `JsonStorageService`
- SEMPRE exporte o Service se outros módulos precisarem usar

### Passo 6: Registrar no AppModule

**Arquivo:** `backend/src/app.module.ts`

```typescript
// Adicionar import
import { [Feature]sModule } from './[features]/[features].module';

@Module({
  imports: [
    StorageModule,
    HledgerModule,
    HealthModule,
    JournalModule,
    ReportsModule,
    ChartsModule,
    ProjectionsModule,
    InvestmentsModule,
    [Feature]sModule,  // ← ADICIONAR AQUI
  ],
  // ...
})
export class AppModule {}
```

### Passo 7: Adicionar Path (se usar JSON)

**Arquivo:** `backend/src/config/paths.ts`

```typescript
export const PATHS = {
  // ... paths existentes
  [FEATURE]_JSON: join(DATA_DIR, '[features].json'),
};
```

### Passo 8: Criar Arquivo JSON

**Arquivo:** `storage/data/[features].json`

```json
{"[features]":[]}
```

**⚠️ IMPORTANTE:**
- Formato DEVE ser `{"[features]":[]}` (objeto com array)
- NÃO usar apenas `[]` (array direto)

### Passo 9: Build e Teste

```bash
# Build
cd backend
npm run build

# Testar endpoints
curl http://localhost:3000/api/[features]
curl -X POST http://localhost:3000/api/[features] -H "Content-Type: application/json" -d '{"campo1":"valor"}'
```

---

## 🎨 Frontend: Criando uma Nova Página/Feature

### Passo 1: Adicionar Tipos TypeScript

**Arquivo:** `frontend/src/types/api.ts`

```typescript
// Adicionar no final do arquivo
export interface Create[Feature]Dto {
  campo1: string;
  campo2: number;
  campo3: 'tipo1' | 'tipo2';
}

export interface Update[Feature]Dto {
  campo1?: string;
  campo2?: number;
  campo3?: 'tipo1' | 'tipo2';
}

export interface [Feature]Dto {
  id: string;
  campo1: string;
  campo2: number;
  campo3: 'tipo1' | 'tipo2';
  createdAt: string;
  updatedAt: string;
}

export interface [Feature]ResponseDto {
  success: boolean;
  [feature]: [Feature]Dto;
}

export interface [Feature]ListResponseDto {
  success: boolean;
  [features]: [Feature]Dto[];
}
```

**⚠️ IMPORTANTE:**
- Tipos DEVEM ser idênticos aos DTOs do backend
- Use os mesmos nomes de campos

### Passo 2: Adicionar API Client

**Arquivo:** `frontend/src/services/api.ts`

```typescript
// Adicionar imports
import type {
  Create[Feature]Dto,
  Update[Feature]Dto,
  [Feature]ResponseDto,
  [Feature]ListResponseDto,
} from '../types/api';

// Adicionar no final do arquivo
export const [features]Api = {
  list: () => api.get<[Feature]ListResponseDto>('/[features]'),
  getById: (id: string) => api.get<[Feature]ResponseDto>(`/[features]/${id}`),
  create: (data: Create[Feature]Dto) => api.post<[Feature]ResponseDto>('/[features]', data),
  update: (id: string, data: Update[Feature]Dto) => api.put<[Feature]ResponseDto>(`/[features]/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/[features]/${id}`),
};
```

### Passo 3: Criar Página

**Arquivo:** `frontend/src/pages/[Feature].tsx`

```typescript
import { useEffect, useState } from 'react';
import { [features]Api } from '../services/api';
import type { [Feature]Dto, Create[Feature]Dto } from '../types/api';
import './[Feature].css';

export default function [Feature]() {
  const [items, setItems] = useState<[Feature]Dto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Create[Feature]Dto>({
    campo1: '',
    campo2: 0,
    campo3: 'tipo1',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await [features]Api.list();
      setItems(response.data.[features]);
    } catch (err) {
      console.error('Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await [features]Api.create(formData);
      setFormData({ campo1: '', campo2: 0, campo3: 'tipo1' });
      setShowForm(false);
      loadItems();
    } catch (err) {
      console.error('Erro ao criar:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir?')) {
      try {
        await [features]Api.delete(id);
        loadItems();
      } catch (err) {
        console.error('Erro ao excluir:', err);
      }
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="[feature]">
      <div className="header">
        <h1>[Feature]s</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : 'Novo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Campo 1:</label>
            <input
              type="text"
              value={formData.campo1}
              onChange={(e) => setFormData({ ...formData, campo1: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Criar</button>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Campo 1</th>
            <th>Campo 2</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.campo1}</td>
              <td>{item.campo2}</td>
              <td>
                <button onClick={() => handleDelete(item.id)} className="btn-danger">
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && <p className="empty-state">Nenhum item cadastrado</p>}
    </div>
  );
}
```

**⚠️ IMPORTANTE:**
- SEMPRE use `useEffect` para carregar dados na montagem
- SEMPRE use estado de loading
- SEMPRE faça tratamento de erros com try/catch
- SEMPRE confirme antes de deletar

### Passo 4: Criar CSS

**Arquivo:** `frontend/src/pages/[Feature].css`

```css
.[feature] {
  max-width: 1200px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
}

.form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table {
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-collapse: collapse;
  overflow: hidden;
}

.table th {
  background-color: #34495e;
  color: white;
  padding: 12px;
  text-align: left;
}

.table td {
  padding: 12px;
  border-bottom: 1px solid #ecf0f1;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 1.1rem;
}
```

### Passo 5: Adicionar Rota

**Arquivo:** `frontend/src/App.tsx`

```typescript
// Adicionar import
import [Feature] from './pages/[Feature]';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="investments" element={<Investments />} />
          <Route path="projections" element={<Projections />} />
          <Route path="journal" element={<Journal />} />
          <Route path="[features]" element={<[Feature] />} />  {/* ← ADICIONAR */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Passo 6: Adicionar na Navegação

**Arquivo:** `frontend/src/components/Layout.tsx`

```typescript
<nav className="sidebar">
  <h1>hledger Web UI</h1>
  <ul>
    <li><Link to="/">Dashboard</Link></li>
    <li><Link to="/reports">Relatórios</Link></li>
    <li><Link to="/investments">Investimentos</Link></li>
    <li><Link to="/projections">Projeções</Link></li>
    <li><Link to="/journal">Journal</Link></li>
    <li><Link to="/[features]">[Feature]s</Link></li>  {/* ← ADICIONAR */}
  </ul>
</nav>
```

---

## 🔗 Integração Backend-Frontend

### Processo de Integração Completo

1. **Backend pronto e testado**
   - Endpoints funcionando
   - Retornando dados corretos

2. **Tipos sincronizados**
   - DTOs do backend = Types do frontend
   - Nomes de campos idênticos

3. **API client configurado**
   - Endpoints mapeados em `services/api.ts`
   - Tipos TypeScript aplicados

4. **Teste de integração**
   ```bash
   # Backend rodando
   curl http://localhost:3000/api/[features]
   
   # Frontend fazendo chamada
   # Verificar Network tab no browser DevTools
   ```

5. **Validação**
   - Dados carregam corretamente
   - CRUD funciona end-to-end
   - Erros são tratados

---

## 🧪 Testes e Validação

### Checklist de Testes Obrigatórios

#### Backend
- [ ] `GET /api/[features]` retorna lista vazia inicialmente
- [ ] `POST /api/[features]` cria novo item
- [ ] `GET /api/[features]/:id` retorna item criado
- [ ] `PUT /api/[features]/:id` atualiza item
- [ ] `DELETE /api/[features]/:id` remove item
- [ ] `GET /api/[features]/:id` com ID inválido retorna 404
- [ ] JSON é persistido corretamente em `storage/data/`

#### Frontend
- [ ] Página carrega sem erros
- [ ] Lista de itens é exibida
- [ ] Formulário de criação funciona
- [ ] Item criado aparece na lista
- [ ] Exclusão funciona com confirmação
- [ ] Loading states funcionam
- [ ] Tratamento de erros funciona

### Comandos de Teste

```bash
# Backend - Testes unitários
cd backend
npm test

# Backend - Build
npm run build

# Backend - Teste manual
curl http://localhost:3000/api/[features]

# Frontend - Build
cd frontend
npm run build

# Verificar se não há erros de TypeScript
npm run build
```

---

## 📐 Convenções e Padrões

### Nomenclatura

**Backend:**
- Arquivos: `[feature].controller.ts`, `[feature].service.ts`, `[feature].module.ts`
- Classes: `[Feature]sController`, `[Feature]sService`, `[Feature]sModule`
- DTOs: `Create[Feature]Dto`, `Update[Feature]Dto`, `[Feature]Dto`
- Rotas: `/api/[features]` (plural, minúsculo)

**Frontend:**
- Arquivos: `[Feature].tsx`, `[Feature].css`
- Componentes: `function [Feature]()` (PascalCase)
- Rotas: `/[features]` (plural, minúsculo)

### Estrutura de Dados

**JSON sempre como objeto:**
```json
✅ CORRETO: {"items":[]}
❌ ERRADO:  []
```

**DTOs sempre tipados:**
```typescript
✅ CORRETO: Promise<ItemResponseDto>
❌ ERRADO:  Promise<any>
```

### Padrões de Resposta da API

```typescript
// Sucesso
{
  "success": true,
  "item": {...}
}

// Lista
{
  "success": true,
  "items": [...]
}

// Erro (automático via NestJS)
{
  "statusCode": 404,
  "message": "Item not found",
  "error": "Not Found"
}
```

---

## ⚠️ Regras Críticas - NÃO QUEBRAR

### 1. JsonStorageService

```typescript
// ✅ SEMPRE ASSIM
const data = await this.jsonStorage.readJson<DataType>(
  PATHS.FILE_JSON,
  { items: [] }  // ← FALLBACK OBRIGATÓRIO
);

await this.jsonStorage.writeJsonAtomic(PATHS.FILE_JSON, data);

// ❌ NUNCA ASSIM
const data = await this.jsonStorage.read(PATHS.FILE_JSON);  // Método não existe
await this.jsonStorage.write(PATHS.FILE_JSON, data);  // Use writeJsonAtomic
```

### 2. Estrutura de Módulos NestJS

```typescript
// ✅ SEMPRE importar StorageModule
@Module({
  imports: [StorageModule],  // ← OBRIGATÓRIO se usar JsonStorageService
  // ...
})

// ❌ Nunca esquecer de importar
@Module({
  controllers: [MyController],
  providers: [MyService],  // ← Vai dar erro em runtime
})
```

### 3. Registro no AppModule

```typescript
// ✅ SEMPRE adicionar em app.module.ts
@Module({
  imports: [
    // ... outros módulos
    NewFeatureModule,  // ← OBRIGATÓRIO
  ],
})

// ❌ Esquecer de adicionar = endpoint não funciona
```

### 4. Build Obrigatório

```bash
# ✅ SEMPRE fazer build após mudanças no backend
npm run build

# ❌ Não fazer build = mudanças não aplicadas
```

### 5. Tipos TypeScript

```typescript
// ✅ SEMPRE tipar explicitamente
async findAll(): Promise<ItemListResponseDto> {
  // ...
}

// ❌ NUNCA usar any
async findAll(): Promise<any> {  // ← PROIBIDO
  // ...
}
```

---

## 🐛 Troubleshooting

### Erro: "Cannot GET /api/[feature]"

**Causa:** Módulo não registrado em `app.module.ts`

**Solução:**
```typescript
// app.module.ts
imports: [
  // ...
  [Feature]Module,  // ← Adicionar
],
```

### Erro: "Property 'read' does not exist"

**Causa:** Método incorreto do JsonStorageService

**Solução:**
```typescript
// ❌ ERRADO
this.jsonStorage.read()

// ✅ CORRETO
this.jsonStorage.readJson()
```

### Erro: "EADDRINUSE: address already in use"

**Causa:** Porta já está sendo usada

**Solução:**
```bash
./stop.sh
./start.sh
```

### Erro: Build do backend falha

**Causa:** Erros de TypeScript

**Solução:**
1. Verificar imports
2. Verificar tipos
3. Rodar `npm run build` para ver erros

### Frontend: Página em branco

**Causa:** Erro JavaScript não tratado

**Solução:**
1. Abrir DevTools (F12)
2. Ver Console para erros
3. Verificar Network tab para erros de API

---

## 📝 Template Rápido

### Comando Rápido para Nova Feature

```bash
# Backend
mkdir -p backend/src/[feature]/dto
touch backend/src/[feature]/dto/[feature].dto.ts
touch backend/src/[feature]/[feature].service.ts
touch backend/src/[feature]/[feature].controller.ts
touch backend/src/[feature]/[feature].module.ts
echo '{"[features]":[]}' > storage/data/[features].json

# Frontend
touch frontend/src/pages/[Feature].tsx
touch frontend/src/pages/[Feature].css
```

---

## 🎓 Resumo para Agentes de Código

**Antes de codificar uma feature, SEMPRE:**

1. ✅ Entenda a arquitetura existente
2. ✅ Siga o padrão dos módulos existentes (ProjectionsModule, InvestmentsModule)
3. ✅ Use o checklist completo
4. ✅ Teste cada etapa antes de prosseguir
5. ✅ NUNCA pule o build do backend
6. ✅ NUNCA esqueça de registrar no AppModule
7. ✅ SEMPRE use tipos TypeScript explícitos
8. ✅ SEMPRE use `readJson` com fallback
9. ✅ SEMPRE use `writeJsonAtomic`
10. ✅ SEMPRE teste os endpoints antes de integrar frontend

**Se algo quebrar:**
1. Verifique erros de build: `npm run build`
2. Verifique se módulo está em `app.module.ts`
3. Verifique se JSON está no formato correto
4. Verifique DevTools no browser
5. Reinicie com `./stop.sh && ./start.sh`

---

## 📚 Referências

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [hledger Manual](https://hledger.org/docs.html)

---

**Versão:** 1.0  
**Última atualização:** Fevereiro 2026  
**Mantenedores:** Equipe hledger Web UI
