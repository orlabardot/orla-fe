# Orla Backend — Referência para o Frontend

> Base URL: `http://localhost:3333`
> Todas as rotas (exceto `/health` e `/auth/login`) exigem autenticação JWT.

---

## 1. Autenticação

### Como funciona

1. O frontend envia `POST /auth/login` com email, senha e o header `x-tenant-slug`
2. O backend retorna um `token` JWT (expira em 8h)
3. Todas as próximas requests devem incluir:
   - `Authorization: Bearer <token>`
   - `x-tenant-slug: <slug>` (ex: `demo`)

### JWT Payload

```typescript
{
  sub: string       // user ID
  tenantId: string
  role: string      // 'admin' | 'employee'
}
```

### Roles

| Role       | Pode listar/visualizar | Pode criar/editar/deletar | Pode gerar PDF |
|------------|------------------------|---------------------------|----------------|
| `admin`    | Sim                    | Sim                       | Sim            |
| `employee` | Sim                    | Não (403)                 | Sim            |

---

## 2. Tenant (Multi-tenancy)

Toda request precisa identificar o tenant. O backend resolve de 2 formas:

1. **Header**: `x-tenant-slug: demo`
2. **Subdomínio**: `demo.seuapp.com`

O frontend deve sempre enviar o header `x-tenant-slug` em toda request.

### Seed padrão

| Tenant  | Slug   | Admin            | Senha      |
|---------|--------|------------------|------------|
| Demo Ótica | `demo` | admin@demo.com | admin123   |

---

## 3. Endpoints

### 3.1 Auth

#### `POST /auth/login`
Rate limit: **5 tentativas/minuto por IP**

```typescript
// Request
{ email: string, password: string }

// Response 200
{
  token: "eyJhbG...",
  user: { id, name, email, role }
}
```

#### `POST /auth/logout`
Auth: obrigatória

```typescript
// Response 200
{ message: "Logged out successfully" }
```

#### `GET /auth/me`
Auth: obrigatória

```typescript
// Response 200
{ user: { id, tenantId, role, name, email } }
```

---

### 3.2 Categories

#### `GET /categories`
Auth: obrigatória | Admin: não

```typescript
// Response 200
{
  data: [
    { id, tenantId, name, slug, createdAt }
  ]
}
```

#### `POST /categories`
Auth: obrigatória | Admin: sim

```typescript
// Request
{ name: string }  // 1-100 chars, slug gerado automaticamente

// Response 201
{ data: { id, tenantId, name, slug, createdAt } }
```

#### `PUT /categories/:id`
Auth: obrigatória | Admin: sim

```typescript
// Request
{ name: string }

// Response 200
{ data: { id, tenantId, name, slug, createdAt } }
```

#### `DELETE /categories/:id`
Auth: obrigatória | Admin: sim — Response: `204 No Content`

---

### 3.3 Brands

Mesma estrutura de Categories.

| Método | Path | Admin |
|--------|------|-------|
| GET | `/brands` | Não |
| POST | `/brands` | Sim |
| PUT | `/brands/:id` | Sim |
| DELETE | `/brands/:id` | Sim |

Request/Response idênticos a Categories (`{ name }` → `{ id, tenantId, name, slug, createdAt }`).

---

### 3.4 Tags

Mesma estrutura de Categories/Brands.

| Método | Path | Admin |
|--------|------|-------|
| GET | `/tags` | Não |
| POST | `/tags` | Sim |
| PUT | `/tags/:id` | Sim |
| DELETE | `/tags/:id` | Sim |

---

### 3.5 Products

#### `GET /products` — Listagem com filtros e paginação
Auth: obrigatória | Admin: não

**Query params** (todos opcionais):

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `page` | number | 1 | Página atual |
| `limit` | number | 20 | Itens por página (max 100) |
| `q` | string | — | Busca por nome, SKU, SKU variante, cor |
| `frameType` | string | — | `grau`, `sol`, `clip-on`, `esportivo` |
| `categoryId` | UUID | — | Filtrar por categoria |
| `brandId` | UUID | — | Filtrar por marca |
| `colorCode` | string | — | Filtrar por código de cor |
| `lensType` | string | — | Filtrar por tipo de lente |
| `bridgeMin` | number | — | Ponte mínima (mm) |
| `bridgeMax` | number | — | Ponte máxima (mm) |
| `templeMin` | number | — | Haste mínima (mm) |
| `templeMax` | number | — | Haste máxima (mm) |
| `tagIds` | string | — | CSV de UUIDs: `"uuid1,uuid2"` |

```typescript
// Response 200
{
  data: [
    {
      id, sku, name, description, frameType, lensType,
      bridgeSizeMm, templeSizeMm, gender, isActive,
      createdAt, updatedAt,
      category: { id, name } | null,
      brand: { id, name } | null,
      productTags: [{ tagId, tag: { id, name } }],
      variants: [
        {
          id, skuVariant, colorCode, colorLabel, isActive,
          images: [{ id, url, isPrimary, sortOrder, createdAt }]
        }
      ]
    }
  ],
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### `GET /products/:id` — Produto com variantes e imagens
Auth: obrigatória | Admin: não

```typescript
// Response 200
{
  data: {
    id, sku, name, description, frameType, lensType,
    bridgeSizeMm, templeSizeMm, gender, isActive,
    createdAt, updatedAt,
    category: { id, name } | null,
    brand: { id, name } | null,
    productTags: [{ tagId, tag: { id, name } }],
    variants: [
      {
        id, skuVariant, colorCode, colorLabel, isActive,
        createdAt, updatedAt,
        images: [{ id, storageKey, url, isPrimary, sortOrder, createdAt }]
      }
    ]
  }
}
```

#### `POST /products` — Criar produto
Auth: obrigatória | Admin: sim

```typescript
// Request
{
  sku: string,                                              // obrigatório, único por tenant
  name: string,                                             // obrigatório
  description?: string,
  categoryId?: UUID,
  brandId?: UUID,
  frameType?: "grau" | "sol" | "clip-on" | "esportivo",
  lensType?: string,
  bridgeSizeMm?: number,
  templeSizeMm?: number,
  gender?: "masculino" | "feminino" | "unissex" | "infantil",
  tagIds?: UUID[]
}

// Response 201
{ data: { ...produto completo com relations } }
```

#### `PUT /products/:id` — Editar produto
Auth: obrigatória | Admin: sim

```typescript
// Request (todos opcionais)
{
  name?: string,
  description?: string,
  categoryId?: UUID | null,    // enviar null para remover
  brandId?: UUID | null,       // enviar null para remover
  frameType?: string,
  lensType?: string,
  bridgeSizeMm?: number,
  templeSizeMm?: number,
  gender?: string,
  isActive?: boolean,
  tagIds?: UUID[]              // substitui todas as tags
}

// Response 200
{ data: { ...produto atualizado } }
```

#### `DELETE /products/:id` — Soft delete
Auth: obrigatória | Admin: sim — Response: `204 No Content`

---

### 3.6 Variants

#### `GET /products/:id/variants`
Auth: obrigatória | Admin: não

```typescript
// Response 200
{
  data: [
    {
      id, productId, tenantId, skuVariant, colorCode, colorLabel,
      isActive, createdAt, updatedAt,
      images: [{ id, storageKey, url, isPrimary, sortOrder, createdAt }]
    }
  ]
}
```

#### `POST /products/:id/variants`
Auth: obrigatória | Admin: sim

```typescript
// Request
{
  skuVariant: string,       // obrigatório, único por tenant
  colorCode?: string,       // único por produto
  colorLabel?: string
}

// Response 201
{ data: { ...variante com images: [] } }
```

#### `PUT /products/:id/variants/:variantId`
Auth: obrigatória | Admin: sim

```typescript
// Request (todos opcionais)
{ colorLabel?: string, isActive?: boolean }

// Response 200
{ data: { ...variante atualizada } }
```

#### `DELETE /products/:id/variants/:variantId`
Auth: obrigatória | Admin: sim — Response: `204 No Content` (soft delete)

---

### 3.7 Images

#### `POST /variants/:variantId/images` — Upload
Auth: obrigatória | Admin: sim | Content-Type: `multipart/form-data`

- Campo do form: **file** (binário)
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`
- Tamanho máximo: **10MB**
- Processamento: converte para WebP, cria thumbnail (400x400)
- Se é a primeira imagem da variante, vira `isPrimary: true` automaticamente

```typescript
// Response 201
{
  data: {
    id, variantId, storageKey, url, thumbUrl,
    isPrimary, sortOrder, createdAt
  }
}
```

#### `DELETE /variants/:variantId/images/:imageId`
Auth: obrigatória | Admin: sim — Response: `204 No Content`

Se a imagem deletada era primary, a próxima imagem é promovida automaticamente.

#### `PATCH /variants/:variantId/images/:imageId/primary`
Auth: obrigatória | Admin: sim

```typescript
// Response 200
{ data: { id, variantId, storageKey, url, isPrimary: true, sortOrder, createdAt } }
```

---

### 3.8 PDF

#### `POST /pdf/generate` — Gerar catálogo PDF
Auth: obrigatória | Admin: não

```typescript
// Request
{
  variantIds: UUID[],        // min 1, max 100
  clientName?: string        // nome do cliente no cabeçalho do PDF
}

// Response 200
// Content-Type: application/pdf
// Content-Disposition: attachment; filename="catalogo-2026-03-22.pdf"
// Body: <Buffer PDF>
```

O PDF é um grid 3 colunas com: imagem primária da variante, SKU, cor, nome do produto. Cabeçalho com nome do tenant e data. Rodapé com data de geração.

---

## 4. Padrão de Erros

Todas as respostas de erro seguem o formato:

```typescript
{
  code: string,
  message: string,
  errors?: Record<string, string[]>  // apenas para erros de validação Zod
}
```

| Status | Code | Quando |
|--------|------|--------|
| 400 | `BAD_REQUEST` | Formato inválido, arquivo inválido, tenant não identificado |
| 401 | `UNAUTHORIZED` | Sem token, token expirado, credenciais inválidas |
| 403 | `FORBIDDEN` | Usuário não é admin |
| 404 | `RESOURCE_NOT_FOUND` | Recurso não existe ou pertence a outro tenant |
| 409 | `CONFLICT` | SKU duplicado, slug duplicado |
| 422 | `VALIDATION_ERROR` | Zod validation, regra de negócio violada |
| 429 | (rate limit) | Muitas requests |
| 500 | `INTERNAL_SERVER_ERROR` | Erro inesperado (nunca vaza detalhes) |

---

## 5. Headers obrigatórios

Toda request autenticada deve enviar:

```
Authorization: Bearer <jwt_token>
x-tenant-slug: demo
Content-Type: application/json        (para requests com body)
```

O backend retorna em toda response:

```
X-Request-Id: <uuid>                  (para rastreabilidade)
```

---

## 6. Modelo de Dados (resumo visual)

```
Tenant
 ├── User (admin | employee)
 ├── Category
 ├── Brand
 ├── Tag
 └── Product
      ├── category? → Category
      ├── brand? → Brand
      ├── tags[] → Tag (via ProductTag)
      └── variants[] → ProductVariant
           └── images[] → VariantImage
```

**Regras importantes:**
- **Soft delete** em Products e Variants (`deletedAt`)
- **Hard delete** em Categories, Brands, Tags e Images
- **Isolamento total por tenant**: nenhum recurso cruza tenants
- **Imagens pertencem à variante**, não ao produto
- Cada variante pode ter N imagens, mas apenas 1 é `isPrimary`

---

## 7. Seed — Dados iniciais

Após rodar `npm run db:seed`, o banco terá:

| Entidade | Dados |
|----------|-------|
| Tenant | Demo Ótica (`demo`) |
| User | admin@demo.com / admin123 (role: admin) |
| Categories | Armações, Solares |
| Brands | Oakley, Ray-Ban |

---

## 8. Como rodar localmente

```bash
# Subir o banco
docker compose up -d

# Instalar dependências
npm install

# Rodar migrações + seed
npx prisma migrate dev
npm run db:seed

# Iniciar servidor (porta 3333)
npm run dev
```

### Exemplo rápido com curl

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -H "x-tenant-slug: demo" \
  -d '{"email":"admin@demo.com","password":"admin123"}' | jq -r '.token')

# Listar produtos
curl -s http://localhost:3333/products \
  -H "x-tenant-slug: demo" \
  -H "Authorization: Bearer $TOKEN" | jq

# Gerar PDF
curl -o catalogo.pdf -X POST http://localhost:3333/pdf/generate \
  -H "Content-Type: application/json" \
  -H "x-tenant-slug: demo" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"variantIds":["<uuid>"],"clientName":"Ótica São Paulo"}'
```

---

## 9. Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 20 + TypeScript (strict) |
| Framework HTTP | Fastify v5 |
| ORM | Prisma v5 + PostgreSQL 16 |
| Validação | Zod |
| Auth | JWT (@fastify/jwt) + bcryptjs |
| Storage | AWS S3 / Cloudflare R2 |
| Imagens | sharp (resize + WebP) |
| PDF | Puppeteer (HTML → PDF A4) |
| Testes | Vitest (22 testes E2E) |
| CI | GitHub Actions |
