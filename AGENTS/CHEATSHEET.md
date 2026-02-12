# Referência Rápida - hledger Web UI

Guia de bolso para desenvolvimento rápido.

---

## 🚀 Comandos Essenciais

```bash
# Iniciar aplicação
./start.sh

# Parar aplicação
./stop.sh

# Docker
./docker-build.sh   # Build (primeira vez)
./docker-start.sh   # Iniciar
./docker-stop.sh    # Parar

# Desenvolvimento
cd backend && npm run build        # Build backend
cd backend && npm test             # Testes
cd frontend && npm run build       # Build frontend
```

---

## 📂 Estrutura Resumida

```
backend/src/
  ├── [feature]/
  │   ├── dto/[feature].dto.ts
  │   ├── [feature].service.ts
  │   ├── [feature].controller.ts
  │   └── [feature].module.ts
  ├── config/paths.ts
  └── app.module.ts

frontend/src/
  ├── pages/[Feature].tsx
  ├── types/api.ts
  └── services/api.ts

storage/
  ├── journals/main.journal
  └── data/[features].json
```

---

## ⚡ Criar Nova Feature

### 1. Backend (5 arquivos)

**DTOs:**
```typescript
// backend/src/[feature]/dto/[feature].dto.ts
export class Create[Feature]Dto { campo: string; }
export class [Feature]Dto { id: string; campo: string; createdAt: string; }
export interface [Feature]ResponseDto { success: boolean; item: [Feature]Dto; }
```

**Service:**
```typescript
// backend/src/[feature]/[feature].service.ts
@Injectable()
export class [Feature]sService {
  constructor(private readonly jsonStorage: JsonStorageService) {}
  
  async findAll() {
    const data = await this.jsonStorage.readJson(PATHS.FILE, { items: [] });
    return { success: true, items: data.items };
  }
  
  async create(dto: CreateDto) {
    const data = await this.jsonStorage.readJson(PATHS.FILE, { items: [] });
    const item = { id: uuidv4(), ...dto, createdAt: new Date().toISOString() };
    data.items.push(item);
    await this.jsonStorage.writeJsonAtomic(PATHS.FILE, data);
    return { success: true, item };
  }
}
```

**Controller:**
```typescript
// backend/src/[feature]/[feature].controller.ts
@Controller('[features]')
export class [Feature]sController {
  constructor(private readonly service: [Feature]sService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() dto) { return this.service.create(dto); }
}
```

**Module:**
```typescript
// backend/src/[feature]/[feature].module.ts
@Module({
  imports: [StorageModule],
  controllers: [[Feature]sController],
  providers: [[Feature]sService],
})
export class [Feature]sModule {}
```

**Registrar:**
```typescript
// backend/src/app.module.ts
imports: [..., [Feature]sModule]
```

### 2. Persistência

```bash
# Criar JSON
echo '{"items":[]}' > storage/data/items.json

# Adicionar path
# backend/src/config/paths.ts
export const PATHS = {
  ITEMS_JSON: join(DATA_DIR, 'items.json'),
};
```

### 3. Build & Test

```bash
cd backend
npm run build
curl http://localhost:3000/api/items
```

### 4. Frontend (3 arquivos)

**Types:**
```typescript
// frontend/src/types/api.ts
export interface ItemDto { id: string; name: string; }
export interface ItemResponseDto { success: boolean; item: ItemDto; }
```

**API:**
```typescript
// frontend/src/services/api.ts
export const itemsApi = {
  list: () => api.get<ItemListResponseDto>('/items'),
  create: (data) => api.post<ItemResponseDto>('/items', data),
};
```

**Page:**
```typescript
// frontend/src/pages/Items.tsx
export default function Items() {
  const [items, setItems] = useState([]);
  useEffect(() => { loadItems(); }, []);
  
  const loadItems = async () => {
    const response = await itemsApi.list();
    setItems(response.data.items);
  };
  
  return <div>{/* UI */}</div>;
}
```

**Route:**
```typescript
// frontend/src/App.tsx
<Route path="items" element={<Items />} />

// frontend/src/components/Layout.tsx
<Link to="/items">Items</Link>
```

---

## 🔍 Debugging

```bash
# Ver logs
tail -f backend.log
tail -f frontend.log

# Testar endpoint
curl http://localhost:3000/api/[feature]

# Build com erros
cd backend && npm run build

# Reiniciar tudo
./stop.sh && ./start.sh

# Docker logs
docker-compose logs -f
```

---

## ⚠️ Regras Críticas

```typescript
// ✅ SEMPRE
readJson(path, { items: [] })      // Com fallback
writeJsonAtomic(path, data)        // Atômico
@Module({ imports: [StorageModule] })  // Import modules

// ❌ NUNCA
readJson(path)                     // Sem fallback
write(path, data)                  // Não é atômico
any                                // Sem tipos
```

---

## 📋 Checklist Rápido

**Backend:**
- [ ] DTOs criados
- [ ] Service implementado
- [ ] Controller criado
- [ ] Module criado
- [ ] Registrado em app.module.ts
- [ ] JSON criado em storage/data/
- [ ] Path adicionado em paths.ts
- [ ] Build OK: `npm run build`
- [ ] Teste: `curl http://localhost:3000/api/[feature]`

**Frontend:**
- [ ] Types adicionados em types/api.ts
- [ ] API client em services/api.ts
- [ ] Página criada em pages/
- [ ] Rota adicionada em App.tsx
- [ ] Link na navegação (Layout.tsx)
- [ ] Teste no browser

---

## 🎯 URLs

- **Local:** http://localhost:5173
- **Docker:** http://localhost:8080
- **API:** http://localhost:3000/api
- **Health:** http://localhost:3000/api/health

---

## 📖 Documentação Completa

- **DEVELOPMENT.md** - Guia completo (leia primeiro!)
- **EXAMPLES.md** - Códigos de exemplo
- **QUICKSTART.md** - Como executar
- **README.md** - Visão geral

---

**Última atualização:** Fev 2026
