// Tipos derivados do código real do backend (src/http/routes/*.ts em orla-be),
// não da documentação — backEnd_context.md e backEnd_develop.md divergem entre si
// e do código em alguns pontos (listagem do catálogo é /catalog e não /products,
// não existe filtro lensType, etc.)

// ─── Primitivos ────────────────────────────────────────────────────────────

export type Role = "admin" | "employee"
export type FrameType = "grau" | "sol" | "clip-on" | "esportivo"
export type Gender = "masculino" | "feminino" | "unissex" | "infantil"

// ─── Erros ─────────────────────────────────────────────────────────────────

export interface ApiError {
  code: string
  message: string
  // Zod .flatten().fieldErrors — mapa de campo para lista de mensagens
  errors?: Record<string, string[]>
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface AuthTenant {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  whatsappPhone: string | null
}

export interface LoginResponse {
  token: string
  user: AuthUser
  tenant: AuthTenant
}

// ─── Usuários (gestão via admin) ───────────────────────────────────────────

export interface ManagedUser {
  id: string
  name: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
}

export interface CreateUserBody {
  name: string
  email: string
  password: string
  role: Role
}

export interface UpdateUserBody {
  name?: string
  email?: string
  role?: Role
  isActive?: boolean
  password?: string
}

export interface JWTPayload {
  sub: string
  tenantId: string
  role: Role
  iat: number
  exp: number
}

// ─── Paginação ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
}

// ─── Catálogo (GET /catalog — listagem plana de variantes) ────────────────

export type CatalogSort = "name_asc" | "name_desc" | "newest"

export interface CatalogItem {
  variantId: string
  productId: string
  skuVariant: string
  colorCode: string | null
  colorLabel: string | null
  primaryImageUrl: string | null
  imageUrls: string[]
  productName: string
  productSku: string
  frameType: FrameType | null
  sizeMm: number | null
  bridgeSizeMm: number | null
  templeSizeMm: number | null
  gender: Gender | null
  brandName: string | null
  categoryName: string | null
}

export interface CatalogFilters extends PaginationParams {
  q?: string
  frameType?: FrameType
  categoryId?: string
  brandId?: string
  colorCode?: string
  sizeMin?: number
  sizeMax?: number
  bridgeMin?: number
  bridgeMax?: number
  templeMin?: number
  templeMax?: number
  tagIds?: string // CSV: "uuid1,uuid2"
  sort?: CatalogSort
}

// ─── Products (CRUD admin) ─────────────────────────────────────────────────

export interface ProductImage {
  id: string
  url: string
  isPrimary: boolean
  sortOrder: number
  createdAt: string
}

export interface ProductVariant {
  id: string
  skuVariant: string
  colorCode: string | null
  colorLabel: string | null
  isActive: boolean
  createdAt: string
  images: ProductImage[]
}

export interface ProductTagRef {
  tagId: string
  tag: { id: string; name: string }
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  frameType: FrameType | null
  lensType: string | null
  sizeMm: number | null
  bridgeSizeMm: number | null
  templeSizeMm: number | null
  gender: Gender | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  category: { id: string; name: string } | null
  brand: { id: string; name: string } | null
  productTags: ProductTagRef[]
  variants: ProductVariant[]
}

export interface CreateProductBody {
  sku: string
  name: string
  description?: string
  categoryId?: string
  brandId?: string
  frameType?: FrameType
  sizeMm?: number
  bridgeSizeMm?: number
  templeSizeMm?: number
  gender?: Gender
  tagIds?: string[]
}

export interface UpdateProductBody {
  sku?: string
  name?: string
  description?: string
  categoryId?: string | null
  brandId?: string | null
  frameType?: FrameType
  sizeMm?: number
  bridgeSizeMm?: number
  templeSizeMm?: number
  gender?: Gender
  isActive?: boolean
  tagIds?: string[]
}

// ─── Variants ───────────────────────────────────────────────────────────────

export interface CreateVariantBody {
  skuVariant: string
  colorCode?: string
  colorLabel?: string
}

export interface BulkCreateVariantsBody {
  variants: CreateVariantBody[]
}

export interface UpdateVariantBody {
  colorLabel?: string
  isActive?: boolean
}

// ─── Images ─────────────────────────────────────────────────────────────────

export interface VariantImage {
  id: string
  variantId: string
  storageKey: string
  url: string
  thumbUrl?: string
  isPrimary: boolean
  sortOrder: number
  createdAt: string
}

// ─── Categories / Brands / Tags ────────────────────────────────────────────

export interface Category {
  id: string
  tenantId: string
  name: string
  slug: string
  createdAt: string
}

export interface Brand {
  id: string
  tenantId: string
  name: string
  slug: string
  createdAt: string
}

export interface Tag {
  id: string
  tenantId: string
  name: string
  slug: string
  createdAt: string
}

// ─── PDF ────────────────────────────────────────────────────────────────────

export interface GeneratePdfBody {
  variantIds: string[]
  clientName?: string
}

// ─── Orders (Pedidos) ───────────────────────────────────────────────────────

export type OrderStatus = "pendente" | "atendido"

export interface OrderItem {
  id: string
  orderId: string
  variantId: string | null
  skuVariant: string
  productName: string
  colorLabel: string | null
  quantity: number
}

export interface Order {
  id: string
  tenantId: string
  userId: string
  cnpj: string
  contactPhone: string
  status: OrderStatus
  createdAt: string
  items: OrderItem[]
  user?: { id: string; name: string; email: string }
}

export interface CreateOrderBody {
  cnpj: string
  contactPhone: string
  items: { variantId: string; quantity: number }[]
}

export interface TenantSettings {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  whatsappPhone: string | null
}
