# Exemplos Práticos de Desenvolvimento

Este documento complementa o `DEVELOPMENT.md` com exemplos práticos e reais do código existente.

---

## 📚 Exemplos de Módulos Existentes

### Exemplo 1: InvestmentsModule (CRUD Completo)

Este é um exemplo perfeito de módulo com CRUD completo.

**Localização:** `backend/src/investments/`

**Estrutura:**
```
investments/
├── dto/
│   └── investment.dto.ts
├── investments.controller.ts
├── investments.service.ts
└── investments.module.ts
```

**Arquivo JSON:** `storage/data/investments.json`
```json
{"investments":[]}
```

**Endpoints:**
- `GET /api/investments` - Lista todos
- `GET /api/investments/:id` - Busca por ID
- `POST /api/investments` - Cria novo
- `PUT /api/investments/:id` - Atualiza
- `DELETE /api/investments/:id` - Remove

**Ver código completo:**
- DTOs: `backend/src/investments/dto/investment.dto.ts`
- Service: `backend/src/investments/investments.service.ts`
- Controller: `backend/src/investments/investments.controller.ts`

---

### Exemplo 2: ProjectionsModule (Sem Persistência, Apenas Cálculo)

Exemplo de módulo que executa lógica e retorna resultado sem CRUD.

**Localização:** `backend/src/projections/`

**Estrutura:**
```
projections/
├── dto/
│   ├── projection.dto.ts
│   └── run-projection.dto.ts
├── projections.controller.ts
├── projections.service.ts
└── projections.module.ts
```

**Características:**
- Recebe parâmetros (meses base, horizonte, método)
- Executa lógica complexa (projeções financeiras)
- Retorna resultado calculado
- TAMBÉM salva histórico (opcional)

**Endpoints:**
- `POST /api/projections/run` - Executa projeção
- `GET /api/projections/history` - Lista histórico
- `GET /api/projections/:id` - Busca projeção específica

**Ver código completo:**
- Service: `backend/src/projections/projections.service.ts`

---

### Exemplo 3: ReportsModule (Integração com hledger)

Exemplo de módulo que integra com processo externo (hledger).

**Localização:** `backend/src/reports/`

**Características:**
- Não tem persistência própria
- Usa `HledgerRunnerService` para executar comandos
- Retorna output do hledger

**Endpoints:**
- `GET /api/reports/balance`
- `GET /api/reports/register`
- `GET /api/reports/income-statement`
- `GET /api/reports/accounts`

**Como integrar com hledger:**
```typescript
import { HledgerRunnerService } from '../hledger/hledger-runner.service';

@Injectable()
export class ReportsService {
  constructor(private readonly hledgerRunner: HledgerRunnerService) {}

  async balance(): Promise<BalanceResponse> {
    const output = await this.hledgerRunner.runCommand(['balance']);
    return {
      success: true,
      data: output,
    };
  }
}
```

**Ver código completo:**
- Service: `backend/src/reports/reports.service.ts`

---

## 🎯 Casos de Uso Comuns

### Caso 1: Criar Módulo com CRUD Simples

**Use como base:** `InvestmentsModule`

**Passos:**
1. Copiar estrutura de `investments/`
2. Renomear arquivos e classes
3. Ajustar DTOs conforme necessidade
4. Criar arquivo JSON
5. Adicionar path em `paths.ts`
6. Registrar em `app.module.ts`

**Tempo estimado:** 30-45 minutos

---

### Caso 2: Criar Módulo que Executa Lógica

**Use como base:** `ProjectionsModule`

**Características:**
- Recebe input DTO
- Executa cálculos/processamento
- Retorna resultado DTO
- Opcionalmente salva histórico

**Exemplo de Service:**
```typescript
async executeLogic(dto: InputDto): Promise<ResultDto> {
  // 1. Validar input
  // 2. Executar lógica
  const result = this.calculate(dto);
  
  // 3. Opcionalmente salvar
  await this.saveHistory(result);
  
  // 4. Retornar resultado
  return {
    success: true,
    result,
  };
}
```

**Tempo estimado:** 1-2 horas (depende da complexidade da lógica)

---

### Caso 3: Integrar com hledger

**Use como base:** `ReportsModule`

**Passos:**
1. Injetar `HledgerRunnerService`
2. Usar método `runCommand(['comando', 'args'])`
3. Processar output
4. Retornar response DTO

**Exemplo:**
```typescript
import { HledgerRunnerService } from '../hledger/hledger-runner.service';

@Injectable()
export class MyService {
  constructor(private readonly hledgerRunner: HledgerRunnerService) {}

  async myReport(): Promise<MyResponseDto> {
    try {
      const output = await this.hledgerRunner.runCommand([
        'balance',
        '--monthly',
        'expenses:',
      ]);
      
      return {
        success: true,
        data: output,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate report');
    }
  }
}
```

**Tempo estimado:** 30 minutos

---

## 🔍 Padrões de Código

### Pattern 1: Service com CRUD Completo

```typescript
@Injectable()
export class ItemsService {
  constructor(private readonly jsonStorage: JsonStorageService) {}

  // READ ALL
  async findAll(): Promise<ItemListResponseDto> {
    const data = await this.jsonStorage.readJson<ItemsData>(
      PATHS.ITEMS_JSON,
      { items: [] },
    );
    return { success: true, items: data.items };
  }

  // READ ONE
  async findOne(id: string): Promise<ItemResponseDto> {
    const data = await this.jsonStorage.readJson<ItemsData>(
      PATHS.ITEMS_JSON,
      { items: [] },
    );
    const item = data.items.find((i) => i.id === id);
    if (!item) throw new NotFoundException(`Item ${id} not found`);
    return { success: true, item };
  }

  // CREATE
  async create(dto: CreateItemDto): Promise<ItemResponseDto> {
    const data = await this.jsonStorage.readJson<ItemsData>(
      PATHS.ITEMS_JSON,
      { items: [] },
    );
    const newItem = {
      id: uuidv4(),
      ...dto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.items.push(newItem);
    await this.jsonStorage.writeJsonAtomic(PATHS.ITEMS_JSON, data);
    return { success: true, item: newItem };
  }

  // UPDATE
  async update(id: string, dto: UpdateItemDto): Promise<ItemResponseDto> {
    const data = await this.jsonStorage.readJson<ItemsData>(
      PATHS.ITEMS_JSON,
      { items: [] },
    );
    const index = data.items.findIndex((i) => i.id === id);
    if (index === -1) throw new NotFoundException(`Item ${id} not found`);
    
    const updated = {
      ...data.items[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    data.items[index] = updated;
    await this.jsonStorage.writeJsonAtomic(PATHS.ITEMS_JSON, data);
    return { success: true, item: updated };
  }

  // DELETE
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const data = await this.jsonStorage.readJson<ItemsData>(
      PATHS.ITEMS_JSON,
      { items: [] },
    );
    const index = data.items.findIndex((i) => i.id === id);
    if (index === -1) throw new NotFoundException(`Item ${id} not found`);
    
    data.items.splice(index, 1);
    await this.jsonStorage.writeJsonAtomic(PATHS.ITEMS_JSON, data);
    return { success: true, message: `Item ${id} deleted` };
  }
}
```

---

### Pattern 2: Controller RESTful

```typescript
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll() { return this.itemsService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.itemsService.findOne(id); }

  @Post()
  create(@Body() dto: CreateItemDto) { return this.itemsService.create(dto); }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.itemsService.remove(id); }
}
```

---

### Pattern 3: DTOs TypeScript

```typescript
// Input DTOs
export class CreateItemDto {
  name: string;
  value: number;
  type: 'typeA' | 'typeB';
}

export class UpdateItemDto {
  name?: string;
  value?: number;
  type?: 'typeA' | 'typeB';
}

// Entity DTO
export interface ItemDto {
  id: string;
  name: string;
  value: number;
  type: 'typeA' | 'typeB';
  createdAt: string;
  updatedAt: string;
}

// Response DTOs
export interface ItemResponseDto {
  success: boolean;
  item: ItemDto;
}

export interface ItemListResponseDto {
  success: boolean;
  items: ItemDto[];
}
```

---

### Pattern 4: Frontend Page Component

```typescript
import { useEffect, useState } from 'react';
import { itemsApi } from '../services/api';
import type { ItemDto, CreateItemDto } from '../types/api';

export default function Items() {
  const [items, setItems] = useState<ItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await itemsApi.list();
      setItems(response.data.items);
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateItemDto) => {
    try {
      await itemsApi.create(data);
      loadItems();
    } catch (err) {
      console.error('Error creating item:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try {
      await itemsApi.delete(id);
      loadItems();
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Render UI */}
    </div>
  );
}
```

---

## 🧪 Testes Práticos

### Teste 1: Backend CRUD

```bash
# GET (lista vazia)
curl http://localhost:3000/api/items
# {"success":true,"items":[]}

# POST (criar)
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","value":100,"type":"typeA"}'
# {"success":true,"item":{"id":"...","name":"Test",...}}

# GET (listar com item)
curl http://localhost:3000/api/items
# {"success":true,"items":[{...}]}

# GET by ID
curl http://localhost:3000/api/items/[ID]
# {"success":true,"item":{...}}

# PUT (atualizar)
curl -X PUT http://localhost:3000/api/items/[ID] \
  -H "Content-Type: application/json" \
  -d '{"value":200}'
# {"success":true,"item":{"value":200,...}}

# DELETE
curl -X DELETE http://localhost:3000/api/items/[ID]
# {"success":true,"message":"..."}

# GET (verificar exclusão)
curl http://localhost:3000/api/items
# {"success":true,"items":[]}
```

---

### Teste 2: Verificar Persistência

```bash
# 1. Criar item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# 2. Verificar arquivo JSON
cat storage/data/items.json
# {"items":[{"id":"...","name":"Test",...}]}

# 3. Reiniciar servidor
./stop.sh && ./start.sh

# 4. Verificar se item ainda existe
curl http://localhost:3000/api/items
# {"success":true,"items":[{...}]}
```

---

## 🎓 Checklist Resumido

### Nova Feature Backend

- [ ] Criar DTOs em `dto/[feature].dto.ts`
- [ ] Criar Service em `[feature].service.ts`
- [ ] Criar Controller em `[feature].controller.ts`
- [ ] Criar Module em `[feature].module.ts`
- [ ] Registrar em `app.module.ts`
- [ ] Criar JSON em `storage/data/[features].json`
- [ ] Adicionar path em `config/paths.ts`
- [ ] Build: `npm run build`
- [ ] Testar com curl

### Nova Feature Frontend

- [ ] Adicionar tipos em `types/api.ts`
- [ ] Adicionar API em `services/api.ts`
- [ ] Criar página em `pages/[Feature].tsx`
- [ ] Criar CSS em `pages/[Feature].css`
- [ ] Adicionar rota em `App.tsx`
- [ ] Adicionar link em `Layout.tsx`
- [ ] Testar no browser

---

## 💡 Dicas Rápidas

**Backend:**
- Copie um módulo existente como base (ex: InvestmentsModule)
- Sempre use `readJson` com fallback
- Sempre use `writeJsonAtomic`
- Sempre injete dependências no constructor

**Frontend:**
- Use hooks (useState, useEffect)
- Sempre trate erros com try/catch
- Sempre mostre loading state
- Sempre confirme antes de deletar

**Geral:**
- Build após cada mudança no backend
- Teste incrementalmente
- Siga o padrão existente
- Mantenha tipos sincronizados

---

**Ver também:** `DEVELOPMENT.md` para guia completo
