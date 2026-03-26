# backEnd.md — Referência de API para o Frontend

> Documento de contrato entre o backend (Fastify + Node.js) e o frontend (Next.js).
> Tudo que o frontend precisa saber para consumir a API sem lacunas.

---

## Índice

1. [Configuração Base](#1-configuração-base)
2. [Autenticação](#2-autenticação)
3. [Headers Obrigatórios](#3-headers-obrigatórios)
4. [Formato de Erros](#4-formato-de-erros)
5. [Paginação](#5-paginação)
6. [Rotas — Auth](#6-rotas--auth)
7. [Rotas — Products](#7-rotas--products)
8. [Rotas — Variants](#8-rotas--variants)
9. [Rotas — Images](#9-rotas--images)
10. [Rotas — Categories](#10-rotas--categories)
11. [Rotas — Brands](#11-rotas--brands)
12. [Rotas — Tags](#12-rotas--tags)
13. [Rotas — PDF](#13-rotas--pdf)
14. [Rotas — Health](#14-rotas--health)
15. [Tipos TypeScript Compartilhados](#15-tipos-typescript-compartilhados)
16. [Configuração do Axios](#16-configuração-do-axios)
17. [Permissões por Role](#17-permissões-por-role)
18. [Comportamentos Importantes](#18-comportamentos-importantes)

---

## 1. Configuração Base

```
Base URL desenvolvimento:  http://localhost:3333
Base URL produção:         https://api.oticamanager.com  (a definir)

Content-Type padrão:       application/json
Encoding:                  UTF-8
```

---

## 2. Autenticação

O backend usa **JWT Bearer Token**. O token é obtido no endpoint `POST /auth/login` e deve ser enviado em todas as rotas protegidas.

```
Authorization: Bearer {access_token}
```

**Payload decodificado do JWT:**
```typescript
interface JWTPayload {
  sub: string            // user.id (UUID)
  tenantId: string       // tenant.id (UUID)
  role: 'admin' | 'employee'
  iat: number            // issued at (unix timestamp)
  exp: number            // expiration (unix timestamp) — 8h após emissão
}
```

**Armazenamento no frontend:**
- Guardar o token em `localStorage` com a chave `@otica:token`
- Guardar os dados do usuário decodificados em `localStorage` com a chave `@otica:user`
- Nunca armazenar em cookie sem flag `httpOnly` (fora do escopo desta fase)

**Expiração:**
- Token expira em **8 horas**
- Quando a API retornar `401`, limpar o token e redirecionar para `/login`
- Não há refresh token nesta fase — usuário precisará fazer login novamente

---

## 3. Headers Obrigatórios

Todo request autenticado deve enviar **os dois headers**:

```
Authorization: Bearer {access_token}
X-Tenant-Slug: {tenant_slug}
```

O `X-Tenant-Slug` identifica o tenant da requisição. Exemplo: `X-Tenant-Slug: otica-central`.

**Como obter o slug:**
- Após o login, o tenant slug vem na resposta de `POST /auth/login`
- Armazenar em `localStorage` com a chave `@otica:tenant-slug`
- Injetar automaticamente em todos os requests via interceptor do Axios

---

## 4. Formato de Erros

Todos os erros seguem o mesmo contrato:

```typescript
interface ApiError {
  message: string       // mensagem legível para o usuário
  code?: string         // código interno opcional (ex: "CONFLICT", "NOT_FOUND")
  errors?: {            // erros de validação de campos (apenas em 422)
    field: string
    message: string
  }[]
}
```

**Exemplos por status:**

```json
// 400 — Bad Request
{ "message": "Requisição inválida" }

// 401 — Unauthorized
{ "message": "Invalid credentials" }

// 403 — Forbidden
{ "message": "Forbidden" }

// 404 — Not Found
{ "message": "Produto não encontrado" }

// 409 — Conflict
{ "message": "SKU já cadastrado para este tenant", "code": "CONFLICT" }

// 422 — Validation Error
{
  "message": "Dados inválidos",
  "errors": [
    { "field": "sku", "message": "SKU é obrigatório" },
    { "field": "bridgeSizeMm", "message": "Deve ser um número positivo" }
  ]
}

// 500 — Internal Server Error
{ "message": "Erro interno. Tente novamente." }
```

**Tratamento global no frontend:**
- `401` → limpar storage e redirecionar para `/login`
- `403` → exibir toast "Sem permissão para esta ação"
- `404` → exibir empty state ou toast "Não encontrado"
- `409` → exibir mensagem de conflito no formulário
- `422` → mapear `errors[]` para os campos do formulário (React Hook Form `setError`)
- `500` → exibir toast genérico de erro

---

## 5. Paginação

Todas as listagens retornam o mesmo envelope paginado:

```typescript
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number        // página atual (começa em 1)
    limit: number       // itens por página
    total: number       // total de itens (para calcular totalPages)
    totalPages: number  // total de páginas
  }
}
```

**Query params padrão de paginação:**
```
?page=1&limit=20
```

Limite máximo permitido pelo backend: `100`. Nunca enviar sem `limit`.

---

## 6. Rotas — Auth

### POST /auth/login

Autentica o usuário e retorna o token JWT.

**Requer autenticação:** não

**Body:**
```typescript
{
  email: string      // email do funcionário
  password: string   // senha em texto puro (HTTPS obrigatório)
}
```

**Response 200:**
```typescript
{
  access_token: string   // JWT Bearer token
  user: {
    id: string
    name: string
    email: string
    role: 'admin' | 'employee'
  }
  tenant: {
    id: string
    name: string
    slug: string           // ← guardar em @otica:tenant-slug
    logoUrl: string | null
  }
}
```

**Erros:**
- `401` — credenciais inválidas (email errado, senha errada ou usuário inativo)
  - A mensagem é sempre a mesma — o backend não revela qual campo errou (segurança)

**Notas:**
- Após sucesso: salvar `access_token`, `user` e `tenant.slug` no localStorage
- Redirecionar para `/catalogo`

---

### POST /auth/logout

Logout stateless — apenas o frontend precisa limpar o storage.

**Requer autenticação:** sim

**Body:** vazio

**Response 200:**
```typescript
{ "message": "Logged out successfully" }
```

**Notas:**
- O backend não invalida o JWT (stateless) — o frontend deve limpar o token do localStorage
- Redirecionar para `/login` após chamar este endpoint

---

## 7. Rotas — Products

### GET /products

Lista variantes do catálogo com filtros. **Retorna variantes, não produtos pai** — a variante é a unidade selecionável no catálogo.

**Requer autenticação:** sim  
**Roles:** `admin`, `employee`

**Query params:**
```typescript
{
  page?:        number   // default: 1
  limit?:       number   // default: 20, max: 100
  q?:           string   // busca livre: nome, sku, sku_variant, color_label
  frameType?:   'grau' | 'sol' | 'clip-on' | 'esportivo'
  categoryId?:  string   // UUID
  brandId?:     string   // UUID
  colorCode?:   string   // ex: "C2" — código exato do fornecedor
  lensType?:    string   // ex: "policarbonato"
  bridgeMin?:   number   // ponte mínima em mm
  bridgeMax?:   number   // ponte máxima em mm
  templeMin?:   number   // haste mínima em mm
  templeMax?:   number   // haste máxima em mm
  tagIds?:      string   // UUIDs separados por vírgula: "uuid1,uuid2"
}
```

**Response 200:** `PaginatedResponse<VariantListItem>`
```typescript
interface VariantListItem {
  variantId:       string         // ID da variante — usar para seleção e PDF
  skuVariant:      string         // ex: "OB 8142 C2"
  colorCode:       string | null  // ex: "C2"
  colorLabel:      string | null  // ex: "Preto Fosco"
  productName:     string         // nome do modelo pai
  productSku:      string         // ex: "OB 8142"
  frameType:       string | null
  lensType:        string | null
  bridgeSizeMm:    number | null
  templeSizeMm:    number | null
  gender:          string | null
  brandName:       string | null
  categoryName:    string | null
  primaryImageUrl: string | null  // URL da imagem thumb (400x400 WebP)
}
```

**Notas:**
- Apenas variantes ativas e não deletadas são retornadas
- A URL de imagem é a thumbnail — usar `primaryImageUrl` para exibir no card
- Se `primaryImageUrl` for `null`, exibir placeholder

---

### GET /products/:id

Retorna um produto pai com todas as suas variantes e imagens.

**Requer autenticação:** sim  
**Roles:** `admin`, `employee`

**Response 200:**
```typescript
interface ProductDetail {
  id:           string
  sku:          string
  name:         string
  description:  string | null
  frameType:    string | null
  lensType:     string | null
  bridgeSizeMm: number | null
  templeSizeMm: number | null
  gender:       string | null
  isActive:     boolean
  createdAt:    string   // ISO 8601
  updatedAt:    string
  category: {
    id:   string
    name: string
    slug: string
  } | null
  brand: {
    id:   string
    name: string
    slug: string
  } | null
  tags: {
    id:   string
    name: string
    slug: string
  }[]
  variants: {
    id:         string
    skuVariant: string
    colorCode:  string | null
    colorLabel: string | null
    isActive:   boolean
    images: {
      id:        string
      url:       string       // URL original (1200x1200 WebP)
      thumbUrl:  string       // URL thumbnail (400x400 WebP)
      isPrimary: boolean
      sortOrder: number
    }[]
  }[]
}
```

**Erros:**
- `404` — produto não encontrado ou deletado

---

### POST /products

Cria um novo produto pai.

**Requer autenticação:** sim  
**Roles:** `admin` apenas

**Body:**
```typescript
{
  sku:          string            // obrigatório, único por tenant
  name:         string            // obrigatório
  description?: string
  categoryId?:  string            // UUID de categoria do mesmo tenant
  brandId?:     string            // UUID de marca do mesmo tenant
  frameType?:   'grau' | 'sol' | 'clip-on' | 'esportivo'
  lensType?:    string
  bridgeSizeMm?: number          // número positivo
  templeSizeMm?: number          // número positivo
  gender?:      'masculino' | 'feminino' | 'unissex' | 'infantil'
  tagIds?:      string[]          // array de UUIDs de tags do mesmo tenant
}
```

**Response 201:**
```typescript
{
  id:        string
  sku:       string
  name:      string
  createdAt: string
}
```

**Erros:**
- `403` — usuário não é admin
- `409` — SKU já existe no tenant
- `404` — `categoryId` ou `brandId` não pertence ao tenant
- `422` — dados inválidos (campos obrigatórios ausentes ou formato incorreto)

---

### PUT /products/:id

Atualiza um produto pai. Todos os campos são opcionais — enviar apenas o que mudar.

**Requer autenticação:** sim  
**Roles:** `admin` apenas

**Body:** mesmo schema do POST, todos os campos opcionais

**Response 200:** `ProductDetail` completo

**Erros:**
- `403` — usuário não é admin
- `404` — produto não encontrado
- `409` — novo SKU já existe no tenant
- `422` — dados inválidos

---

### DELETE /products/:id

Soft delete — o produto não aparece mais nas listagens mas permanece no banco.

**Requer autenticação:** sim  
**Roles:** `admin` apenas

**Response 204:** sem body

**Erros:**
- `403` — usuário não é admin
- `404` — produto não encontrado

---

## 8. Rotas — Variants

### GET /products/:productId/variants

Lista todas as variantes de um produto pai.

**Requer autenticação:** sim  
**Roles:** `admin`, `employee`

**Response 200:**
```typescript
{
  data: {
    id:         string
    skuVariant: string
    colorCode:  string | null
    colorLabel: string | null
    isActive:   boolean
    createdAt:  string
    images: {
      id:        string
      url:       string
      thumbUrl:  string
      isPrimary: boolean
      sortOrder: number
    }[]
  }[]
}
```

**Erros:**
- `404` — produto pai não encontrado

---

### POST /products/:productId/variants

Adiciona uma variante de cor a um produto.

**Requer autenticação:** sim  
**Roles:** `admin` apenas

**Body:**
```typescript
{
  skuVariant:   string    // obrigatório — referência completa, ex: "OB 8142 C2"
  colorCode?:   string    // código do fornecedor, ex: "C2" — null quando sem variante de cor
  colorLabel?:  string    // nome legível, ex: "Preto Fosco"
}
```

**Response 201:**
```typescript
{
  id:         string
  skuVariant: string
  colorCode:  string | null
  colorLabel: string | null
  isActive:   boolean
  createdAt:  string
}
```

**Erros:**
- `403` — usuário não é admin
- `404` — produto pai não encontrado ou não pertence ao tenant
- `409` — `skuVariant` já existe no tenant, ou `colorCode` já existe neste produto
- `422` — dados inválidos

---

### PUT /products/:productId/variants/:variantId

Edita `colorLabel` e/ou `isActive` de uma variante.

**Requer autenticação:** sim  
**Roles:** `admin` apenas

**Body:**
```typescript
{
  colorLabel?: string
  isActive?:   boolean
}
```

**Response 200:** variante atualizada (mesmo shape do POST 201)

**Erros:**
- `403` — usuário não é admin
- `404` — variante não encontrada

---

### DELETE /products/:productId/variants/:variantId

Soft delete da variante.

**Requer autenticação:** sim  
**Roles:** `admin` apenas

**Response 204:** sem body

**Erros:**
- `403` — usuário não é admin
- `404` — variante não encontrada

---

## 9. Rotas — Images

### POST /variants/:variantId/images

Faz upload de uma imagem para uma variante. Enviar como `multipart/form-data`.

**Requer autenticação:** sim  
**Roles:** `admin`, `employee`

**Form fields:**
```
file: File   — imagem JPEG, PNG ou WebP, máx. 10MB
```

**Response 201:**
```typescript
{
  id:        string
  url:       string    // URL original (1200x1200 WebP)
  thumbUrl:  string    // URL thumbnail (400x400 WebP)
  isPrimary: boolean   // true se for a primeira imagem da variante
  sortOrder: number
}
```

**Erros:**
- `400` — arquivo não é imagem ou excede 10MB
- `404` — variante não encontrada ou não pertence ao tenant

**Notas:**
- O backend converte qualquer imagem para WebP automaticamente
- A primeira imagem enviada para uma variante é automaticamente marcada como primária
- Imagens subsequentes não sobrescrevem a primária

---

### DELETE /variants/:variantId/images/:imageId

Remove uma imagem da variante e do storage S3/R2.

**Requer autenticação:** sim  
**Roles:** `admin`, `employee`

**Response 204:** sem body

**Erros:**
- `404` — imagem não encontrada ou não pertence ao tenant

**Notas:**
- Se a imagem deletada era a primária, o backend promove automaticamente a próxima imagem por `sort_order` como primária
- Se era a única imagem, a variante ficará sem imagem primária

---

### PATCH /variants/:variantId/images/:imageId/primary

Define uma imagem como primária da variante (a atual perde o status).

**Requer autenticação:** sim  
**Roles:** `admin`, `employee`

**Body:** vazio

**Response 200:**
```typescript
{
  id:        string
  isPrimary: true
}
```

**Erros:**
- `404` — imagem não encontrada ou não pertence ao tenant

---

## 10. Rotas — Categories

### GET /categories

Lista categorias do tenant.

**Requer autenticação:** sim  
**Roles:** `admin`, `employee`

**Query params:**
```typescript
{
  page?:  number   // default: 1
  limit?: number   // default: 20
  q?:     string   // busca por nome
}
```

**Response 200:** `PaginatedResponse<Category>`
```typescript
interface Category {
  id:        string
  name:      string
  slug:      string
  createdAt: string
}
```

---

### POST /categories

**Requer autenticação:** sim  
**Roles:** `admin` apenas

**Body:**
```typescript
{ name: string }   // slug gerado automaticamente pelo backend
```

**Response 201:** `Category`

**Erros:**
- `403` — não é admin
- `409` — nome já existe no tenant

---

### PUT /categories/:id

**Requer autenticação:** sim  
**Roles:** `admin` apenas

**Body:**
```typescript
{ name: string }
```

**Response 200:** `Category`

**Erros:**
- `403` — não é admin
- `404` — não encontrada
- `409` — novo nome já existe

---

### DELETE /categories/:id

**Requer autenticação:** sim  
**Roles:** `admin` apenas

**Response 204:** sem body

**Erros:**
- `403` — não é admin
- `404` — não encontrada
- `409` — categoria possui produtos vinculados (não é possível deletar)

---

## 11. Rotas — Brands

Mesmo padrão de Categories.

### GET /brands

**Query params:** `page`, `limit`, `q`  
**Response 200:** `PaginatedResponse<Brand>`

```typescript
interface Brand {
  id:        string
  name:      string
  slug:      string
  createdAt: string
}
```

---

### POST /brands

**Body:** `{ name: string }`  
**Response 201:** `Brand`  
**Erros:** `403`, `409`

---

### PUT /brands/:id

**Body:** `{ name: string }`  
**Response 200:** `Brand`  
**Erros:** `403`, `404`, `409`

---

### DELETE /brands/:id

**Response 204**  
**Erros:** `403`, `404`, `409` (marca com produtos vinculados)

---

## 12. Rotas — Tags

Mesmo padrão de Categories e Brands.

### GET /tags

**Query params:** `page`, `limit`, `q`  
**Response 200:** `PaginatedResponse<Tag>`

```typescript
interface Tag {
  id:   string
  name: string
  slug: string
}
```

---

### POST /tags

**Body:** `{ name: string }`  
**Response 201:** `Tag`  
**Erros:** `403`, `409`

---

### PUT /tags/:id

**Body:** `{ name: string }`  
**Response 200:** `Tag`  
**Erros:** `403`, `404`, `409`

---

### DELETE /tags/:id

**Response 204**  
**Erros:** `403`, `404`, `409` (tag com produtos vinculados)

---

## 13. Rotas — PDF

### POST /pdf/generate

Gera o PDF com as variantes selecionadas e retorna como stream de download.

**Requer autenticação:** sim  
**Roles:** `admin`, `employee`

**Body:**
```typescript
{
  variantIds:   string[]       // array de IDs de variantes — mín. 1, máx. 100
  clientName?:  string         // nome do cliente para o cabeçalho do PDF
}
```

**Response 200:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="catalogo-2024-01-15.pdf"
Content-Transfer-Encoding: binary
[binary stream]
```

**Erros:**
- `401` — não autenticado
- `422` — `variantIds` vazio, ou nenhuma variante válida encontrada, ou mais de 100 variantes

**Notas críticas para o frontend:**
- Usar `responseType: 'blob'` no Axios
- **Não usar `window.open`** — popup blockers bloqueiam chamadas assíncronas
- Criar link programático para download:

```typescript
// services/pdf.service.ts
export async function generatePdf(variantIds: string[], clientName?: string) {
  const response = await api.post(
    '/pdf/generate',
    { variantIds, clientName },
    { responseType: 'blob' }
  )

  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().split('T')[0]
  const name = clientName ? clientName.replace(/\s+/g, '-').toLowerCase() : 'catalogo'

  link.href = url
  link.download = `${name}-${date}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

- Timeout de 30 segundos para esta rota (o Puppeteer pode demorar)
- Enquanto carrega: exibir spinner + texto "Gerando PDF..."

**Layout do PDF gerado:**
- Cabeçalho: nome do tenant + data de geração + nome do cliente (se informado)
- Grade 3 colunas em A4
- Por célula: imagem thumb + `skuVariant` + `colorLabel` (se houver) + `productName`
- Rodapé: numeração de páginas

---

## 14. Rotas — Health

### GET /health

Verifica se o backend está operacional. Não requer autenticação.

**Response 200:**
```typescript
{
  status:    'ok'
  db:        'ok'
  timestamp: string   // ISO 8601
}
```

**Response 503** (quando banco indisponível):
```typescript
{
  status: 'error'
  db:     'unavailable'
}
```

---

## 15. Tipos TypeScript Compartilhados

Criar em `src/types/api.ts` no projeto frontend:

```typescript
// ─── Primitivos ────────────────────────────────────────────────────────────────

export type Role = 'admin' | 'employee'
export type FrameType = 'grau' | 'sol' | 'clip-on' | 'esportivo'
export type Gender = 'masculino' | 'feminino' | 'unissex' | 'infantil'

// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string
  user: {
    id:    string
    name:  string
    email: string
    role:  Role
  }
  tenant: {
    id:      string
    name:    string
    slug:    string
    logoUrl: string | null
  }
}

export interface JWTUser {
  sub:      string
  tenantId: string
  role:     Role
  iat:      number
  exp:      number
}

// ─── Paginação ─────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page:       number
    limit:      number
    total:      number
    totalPages: number
  }
}

export interface PaginationParams {
  page?:  number
  limit?: number
}

// ─── Erros ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string
  code?:   string
  errors?: {
    field:   string
    message: string
  }[]
}

// ─── Catalog (listagem de variantes) ──────────────────────────────────────────

export interface VariantListItem {
  variantId:       string
  skuVariant:      string
  colorCode:       string | null
  colorLabel:      string | null
  productName:     string
  productSku:      string
  frameType:       FrameType | null
  lensType:        string | null
  bridgeSizeMm:    number | null
  templeSizeMm:    number | null
  gender:          Gender | null
  brandName:       string | null
  categoryName:    string | null
  primaryImageUrl: string | null
}

export interface CatalogFilters extends PaginationParams {
  q?:          string
  frameType?:  FrameType
  categoryId?: string
  brandId?:    string
  colorCode?:  string
  lensType?:   string
  bridgeMin?:  number
  bridgeMax?:  number
  templeMin?:  number
  templeMax?:  number
  tagIds?:     string    // CSV: "uuid1,uuid2"
}

// ─── Products ──────────────────────────────────────────────────────────────────

export interface VariantImage {
  id:        string
  url:       string
  thumbUrl:  string
  isPrimary: boolean
  sortOrder: number
}

export interface VariantDetail {
  id:         string
  skuVariant: string
  colorCode:  string | null
  colorLabel: string | null
  isActive:   boolean
  createdAt:  string
  images:     VariantImage[]
}

export interface ProductDetail {
  id:           string
  sku:          string
  name:         string
  description:  string | null
  frameType:    FrameType | null
  lensType:     string | null
  bridgeSizeMm: number | null
  templeSizeMm: number | null
  gender:       Gender | null
  isActive:     boolean
  createdAt:    string
  updatedAt:    string
  category:     { id: string; name: string; slug: string } | null
  brand:        { id: string; name: string; slug: string } | null
  tags:         { id: string; name: string; slug: string }[]
  variants:     VariantDetail[]
}

export interface CreateProductBody {
  sku:          string
  name:         string
  description?: string
  categoryId?:  string
  brandId?:     string
  frameType?:   FrameType
  lensType?:    string
  bridgeSizeMm?: number
  templeSizeMm?: number
  gender?:      Gender
  tagIds?:      string[]
}

// ─── Catalog entities ──────────────────────────────────────────────────────────

export interface Category {
  id:        string
  name:      string
  slug:      string
  createdAt: string
}

export interface Brand {
  id:        string
  name:      string
  slug:      string
  createdAt: string
}

export interface Tag {
  id:   string
  name: string
  slug: string
}

// ─── PDF ───────────────────────────────────────────────────────────────────────

export interface GeneratePdfBody {
  variantIds:  string[]
  clientName?: string
}
```

---

## 16. Configuração do Axios

```typescript
// src/lib/axios.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333',
  timeout: 10_000,   // 10s padrão
})

// Injeta token e tenant-slug em todos os requests
api.interceptors.request.use((config) => {
  const token      = localStorage.getItem('@otica:token')
  const tenantSlug = localStorage.getItem('@otica:tenant-slug')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (tenantSlug) {
    config.headers['X-Tenant-Slug'] = tenantSlug
  }

  // PDF precisa de timeout maior (Puppeteer pode demorar)
  if (config.url?.includes('/pdf/generate')) {
    config.timeout = 35_000  // 35s
  }

  return config
})

// Trata erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@otica:token')
      localStorage.removeItem('@otica:user')
      localStorage.removeItem('@otica:tenant-slug')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 17. Permissões por Role

| Recurso | Ação | `employee` | `admin` |
|---|---|:---:|:---:|
| Auth | Login / Logout | ✓ | ✓ |
| Catálogo | Listar variantes (GET /products) | ✓ | ✓ |
| Catálogo | Ver detalhe produto (GET /products/:id) | ✓ | ✓ |
| Catálogo | Listar variantes de produto | ✓ | ✓ |
| Imagens | Upload de imagem | ✓ | ✓ |
| Imagens | Deletar imagem | ✓ | ✓ |
| Imagens | Definir imagem primária | ✓ | ✓ |
| PDF | Gerar PDF | ✓ | ✓ |
| Categories | Listar | ✓ | ✓ |
| Brands | Listar | ✓ | ✓ |
| Tags | Listar | ✓ | ✓ |
| Products | Criar / Editar / Deletar | ✗ | ✓ |
| Variants | Criar / Editar / Deletar | ✗ | ✓ |
| Categories | Criar / Editar / Deletar | ✗ | ✓ |
| Brands | Criar / Editar / Deletar | ✗ | ✓ |
| Tags | Criar / Editar / Deletar | ✗ | ✓ |

**Implementação no frontend:**
- Lê `role` do JWT decodificado (ou do `@otica:user` no localStorage)
- Rotas `/admin/*` protegidas pelo layout `admin/layout.tsx` — redireciona para `/` se não for admin
- Botões e ações de escrita ficam ocultos (`hidden`) para `employee`, não apenas desabilitados

---

## 18. Comportamentos Importantes

### Soft Delete
Produtos e variantes deletados nunca aparecem em listagens. O backend filtra automaticamente. O frontend não precisa tratar isso.

### Isolamento de Tenant
O backend garante que um usuário nunca vê dados de outro tenant. O frontend apenas precisa enviar `X-Tenant-Slug` corretamente em todos os requests.

### Imagem Primária Automática
Ao fazer upload da primeira imagem de uma variante, ela automaticamente se torna primária (`isPrimary: true`). O frontend não precisa chamar o endpoint `/primary` para a primeira imagem.

### Variantes sem Cor
Quando `colorCode` e `colorLabel` são `null`, a variante representa um modelo sem variação de cor (ex: `OB 8123`). O frontend deve tratar `null` graciosamente — exibir um traço (`—`) ou omitir o campo na UI.

### Filtro por Tags (CSV)
O parâmetro `tagIds` deve ser enviado como string CSV: `"uuid1,uuid2,uuid3"`. O backend separa e aplica `AND` (produto deve ter **todas** as tags informadas).

### Busca Livre (`q`)
O parâmetro `q` busca em: `product.name`, `product.sku`, `variant.sku_variant`, `variant.color_label`. O frontend deve aplicar debounce de **300ms** antes de disparar o request.

### Paginação da Seleção de PDF
A seleção de variantes para o PDF é mantida no Zustand no frontend. Ao paginar, a seleção persiste — o backend só recebe os IDs no momento de gerar o PDF, não ao selecionar.

### Limite de Variantes no PDF
Máximo de **100 variantes** por PDF. O frontend deve bloquear o botão "Gerar PDF" e exibir aviso quando esse limite for atingido.

### Variantes Inativas no PDF
Se uma variante selecionada for desativada entre a seleção e a geração do PDF, o backend a ignora silenciosamente. O PDF é gerado com as variantes válidas restantes. Se nenhuma for válida, retorna `422`.

### Timeout do PDF
O endpoint `/pdf/generate` pode demorar até **30 segundos** (Puppeteer). Configurar timeout do Axios para **35 segundos** nesta rota específica (já contemplado na configuração acima).

### Imagens Convertidas para WebP
Todas as imagens são convertidas para WebP pelo backend. O frontend pode assumir que todas as URLs de imagem retornadas pela API são `.webp`.

### Duas URLs de Imagem
Cada imagem retorna `url` (original, 1200×1200) e `thumbUrl` (thumbnail, 400×400). Usar `thumbUrl` em cards do catálogo e listas. Usar `url` apenas em visualizações de detalhe ou zoom.

### Header X-Request-Id
Toda response do backend inclui o header `X-Request-Id` — um UUID único da requisição. Em caso de erro, logar esse valor para facilitar o rastreamento no backend.
