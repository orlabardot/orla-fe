# frontEnd.md — Design System & Plano de Desenvolvimento Frontend

> **Produto:** Ótica Manager
> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Shadcn/ui · Radix UI
> **Identidade:** Dark mode · Accent off-white · Playfair Display + Inter · Filtros no topo
> **Contexto:** `context.md` — Catálogo de Óculos com Geração de PDF

---

## Índice

1. [Decisões Técnicas Fundamentais](#1-decisões-técnicas-fundamentais)
2. [Identidade Visual](#2-identidade-visual)
3. [Design Tokens](#3-design-tokens)
4. [Breakpoints e Grid](#4-breakpoints-e-grid)
5. [Tipografia](#5-tipografia)
6. [Componentes do Design System](#6-componentes-do-design-system)
7. [Layout e Navegação](#7-layout-e-navegação)
8. [Páginas e Fluxos](#8-páginas-e-fluxos)
9. [Estrutura do Projeto](#9-estrutura-do-projeto)
10. [Plano de Desenvolvimento](#10-plano-de-desenvolvimento)
11. [Acessibilidade e Performance](#11-acessibilidade-e-performance)
12. [Checklist de Entrega](#12-checklist-de-entrega)

---

## 1. Decisões Técnicas Fundamentais

### Tema: Dark mode como padrão

O dark mode é o tema principal da aplicação — não uma opção secundária. O light mode pode ser oferecido futuramente, mas não é prioridade desta fase. A interface é construída **dark-first**: todas as decisões de cor, contraste e sombra partem do fundo escuro.

`next-themes` com `defaultTheme="dark"` e `forcedTheme` no layout principal para evitar flash de tema errado no SSR.

### Estilização: Tailwind CSS + Shadcn/ui + Radix UI

- **Tailwind CSS** como base utilitária — sem CSS-in-JS
- **Shadcn/ui** — componentes copiados para o projeto, totalmente customizáveis ao tema escuro
- **Radix UI** — primitivos de acessibilidade (Dialog, Dropdown, Tooltip, Sheet)
- Todos os componentes Shadcn serão reestilizados para o tema dark da Ótica Manager

### Filtros: Topbar (não sidebar)

Os filtros ficam em uma barra horizontal abaixo da topbar principal — estilo catálogo de e-commerce. Em mobile, colapsam em um botão "Filtros" que abre um Sheet bottom drawer. Essa escolha maximiza a área de grid de cards na vertical.

### Gerenciamento de Estado

- **Server State**: TanStack Query — cache, loading/error states para todas as chamadas à API
- **Client State**: Zustand — lista de variantes selecionadas para PDF, estado dos filtros, UI state
- **Form State**: React Hook Form + Zod

### Comunicação com API

Axios com instância configurada — interceptors para JWT e tratamento global de erros 401.

---

## 2. Identidade Visual

### Nome e Conceito

**Ótica Manager** — ferramenta interna de gestão de catálogo para óticas. O posicionamento é profissional, sofisticado e clean. A interface deve transmitir a mesma elegância que uma ótica premium transmite ao seu cliente: escura, espaçosa, com tipografia refinada.

### Filosofia de Design

- **Fundo escuro profundo** — não é um cinza genérico, é um preto com leve tom quente
- **Accent off-white** — o branco é a cor de ação e destaque. Funciona como ouro visual sem ser literal
- **Imagens como protagonistas** — a UI recua para dar espaço às fotos dos produtos
- **Tipografia com personalidade** — Playfair Display em títulos cria sofisticação sem peso
- **Espaço generoso** — densidade equilibrada, nunca sufocante

### Referências de Tom Visual

A interface se inspira em plataformas como:
- **Notion** (dark) — espaço e hierarquia tipográfica
- **Linear** — precisão e elegância em ferramentas de trabalho
- **Bottega Veneta / Loewe** (websites de moda) — imagem como foco absoluto, interface que some

---

## 3. Design Tokens

### Paleta de Cores

```typescript
// tailwind.config.ts
const colors = {
  // Base escura — fundos da aplicação
  // Nota: não é preto puro. Tem leve tom quente para suavizar
  base: {
    950: '#0c0c0d',  // ← fundo raiz da página
    900: '#141415',  // ← fundo de surfaces (cards, sidebar)
    800: '#1c1c1e',  // ← fundo elevado (inputs, dropdowns)
    700: '#242426',  // ← hover states de surfaces
    600: '#2e2e31',  // ← bordas e divisores
    500: '#3a3a3e',  // ← bordas de foco (não brand)
  },

  // Off-white — accent principal (ações, destaques, seleção)
  // Não é #ffffff puro — tem 2% de warm para combinar com o fundo
  offwhite: {
    50:  '#f7f7f5',  // ← backgrounds sutis (selected state)
    100: '#efefe9',  // ← hover de elementos off-white
    200: '#e0e0d6',  // ← versão suave para badges
    300: '#c8c8bb',  // ← texto secundário claro
    400: '#a8a89a',  // ← texto muted
    DEFAULT: '#f0f0eb', // ← brand accent principal
  },

  // Texto
  text: {
    primary:   '#f0f0eb',  // ← mesmo do offwhite DEFAULT
    secondary: '#a8a89a',  // ← offwhite.400
    muted:     '#6b6b65',  // ← texto de suporte, placeholders
    inverse:   '#0c0c0d',  // ← texto sobre fundo claro (botão filled)
  },

  // Semânticas — tons suaves para não gritar em dark mode
  success: {
    DEFAULT: '#4ade80',
    subtle:  '#052e16',
    text:    '#86efac',
  },
  warning: {
    DEFAULT: '#fbbf24',
    subtle:  '#1c1003',
    text:    '#fde68a',
  },
  danger: {
    DEFAULT: '#f87171',
    subtle:  '#1c0303',
    text:    '#fca5a5',
  },
}
```

### CSS Variables (Dark-first)

```css
/* src/app/globals.css */

:root {
  /* === BACKGROUNDS === */
  --bg-page:     #0c0c0d;   /* fundo raiz */
  --bg-surface:  #141415;   /* cards, painéis */
  --bg-elevated: #1c1c1e;   /* inputs, dropdowns, modais */
  --bg-hover:    #242426;   /* hover em surfaces */
  --bg-muted:    #1c1c1e;   /* fundo de elementos secundários */

  /* === TEXTO === */
  --text-primary:   #f0f0eb;
  --text-secondary: #a8a89a;
  --text-muted:     #6b6b65;
  --text-inverse:   #0c0c0d;

  /* === BORDAS === */
  --border-subtle:  #2e2e31;   /* divisores, bordas de card */
  --border-default: #3a3a3e;   /* inputs, elementos interativos */
  --border-strong:  #f0f0eb33; /* 20% off-white — hover, focus suave */
  --border-brand:   #f0f0eb;   /* seleção ativa */

  /* === BRAND ACCENT (off-white) === */
  --brand:       #f0f0eb;
  --brand-hover: #e0e0d6;
  --brand-muted: #f0f0eb14;  /* 8% — backgrounds sutis de seleção */
  --brand-subtle:#f0f0eb0a;  /* 4% — hover muito suave */

  /* === SOMBRAS (dark mode usa sombras mais densas) === */
  --shadow-sm:   0 1px 3px 0 rgb(0 0 0 / 0.4);
  --shadow-md:   0 4px 12px 0 rgb(0 0 0 / 0.5);
  --shadow-lg:   0 8px 30px 0 rgb(0 0 0 / 0.6);
  --shadow-card: 0 1px 1px 0 rgb(0 0 0 / 0.3), 0 0 0 1px #2e2e31;

  /* === FOCUS RING === */
  --ring: #f0f0eb40;  /* off-white 25% para ring de foco */
}
```

### Tokens de Opacidade para Off-white

O accent off-white em dark mode é versátil — diferentes opacidades criam hierarquia:

| Uso | Valor | Opacidade |
|---|---|---|
| Texto primário / ação | `#f0f0eb` | 100% |
| Borda de seleção ativa | `#f0f0eb` | 100% |
| Borda hover | `#f0f0eb33` | 20% |
| Background de item selecionado | `#f0f0eb14` | 8% |
| Background hover sutil | `#f0f0eb0a` | 4% |
| Focus ring | `#f0f0eb40` | 25% |

---

## 4. Breakpoints e Grid

### Breakpoints

```typescript
screens: {
  sm:  '480px',    // mobile landscape
  md:  '768px',    // tablet portrait
  lg:  '1024px',   // tablet landscape / laptop
  xl:  '1280px',   // desktop
  '2xl': '1536px'  // widescreen
}
```

### Layout Principal

```
Mobile (< 768px):
┌──────────────────────────┐
│  Topbar          56px    │
├──────────────────────────┤
│  Filter bar              │  ← colapsada, botão "Filtros"
├──────────────────────────┤
│                          │
│  Grid de cards           │
│  (full width)            │
│                          │
└──────────────────────────┘

Tablet (768px–1023px):
┌──────────────────────────────┐
│  Topbar              56px    │
├──────────────────────────────┤
│  Filter bar (scroll horiz.)  │
├──────────────────────────────┤
│                              │
│  Grid de cards               │
│                              │
└──────────────────────────────┘

Desktop (≥ 1024px):
┌──────────────────────────────────────┐
│  Topbar                      64px    │
├──────────────────────────────────────┤
│  Filter bar (completa)               │
├──────────────────────────────────────┤
│                                      │
│  Grid de cards (max-width: 1440px)   │
│                                      │
└──────────────────────────────────────┘
```

### Grid do Catálogo

```typescript
// Colunas por breakpoint
'grid-cols-2'                  // < 480px  — 2 colunas
'sm:grid-cols-2'               // 480px    — 2 colunas
'md:grid-cols-3'               // 768px    — 3 colunas
'lg:grid-cols-4'               // 1024px   — 4 colunas
'xl:grid-cols-5'               // 1280px   — 5 colunas
'2xl:grid-cols-6'              // 1536px   — 6 colunas

// Gap
'gap-3 md:gap-4'
```

---

## 5. Tipografia

### Fontes

**Playfair Display** — serif elegante para títulos e elementos de destaque.
**Inter** — sans-serif precisa para corpo de texto, labels, UI elements.
**JetBrains Mono** — monospace para SKUs, códigos de referência, valores técnicos (ponte, haste em mm).

```typescript
// src/app/layout.tsx
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
})
```

### Escala Tipográfica

| Token | Fonte | Tamanho | Peso | Uso |
|---|---|---|---|---|
| `display-lg` | Playfair | 36px | 700 | Hero do dashboard |
| `display-md` | Playfair | 28px | 600 | Título de página |
| `display-sm` | Playfair | 22px | 600 | Título de seção, modal |
| `heading` | Playfair | 18px | 600 | Subtítulo de card grande |
| `body-lg` | Inter | 15px | 400 | Texto padrão de interface |
| `body-md` | Inter | 13px | 400 | Labels, descrições |
| `body-sm` | Inter | 11px | 400 | Metadata, timestamps |
| `ui-md` | Inter | 13px | 500 | Botões, navegação |
| `ui-sm` | Inter | 11px | 500 | Badges, status |
| `sku` | JetBrains Mono | 12px | 500 | Códigos de referência (OB 8142 C2) |
| `measure` | JetBrains Mono | 11px | 400 | Medidas técnicas (14.5mm) |

### Regra de Aplicação

```
Playfair → títulos de página, headings de seção, nome do produto no card
Inter    → tudo que é UI: botões, inputs, labels, navegação, filtros, paginação
Mono     → sku_variant, color_code, bridge_size_mm, temple_size_mm
```

---

## 6. Componentes do Design System

### Hierarquia

```
Primitivos (Shadcn/ui customizados para dark)
      ↓
Componentes de Domínio (específicos da Ótica Manager)
      ↓
Composições de Página (layouts, seções completas)
```

---

### 6.1 Primitivos Shadcn Customizados

Todos reestilizados para o tema dark off-white:

**Button**
```
Variantes:
  primary   → bg: #f0f0eb  text: #0c0c0d  hover: #e0e0d6  (ação principal)
  secondary → bg: #1c1c1e  text: #f0f0eb  border: #3a3a3e  hover: #242426
  ghost     → bg: transparent  text: #a8a89a  hover: bg #f0f0eb0a text #f0f0eb
  danger    → bg: #1c0303  text: #fca5a5  border: #f87171/30
  icon      → bg: transparent  text: #6b6b65  hover: text #f0f0eb  (ícones de ação)

Tamanhos:
  sm  → h-8  px-3  text-xs  (ações inline, tabela)
  md  → h-9  px-4  text-sm  (padrão)
  lg  → h-11 px-6  text-sm  (ação principal da página)
```

**Input**
```
bg: #1c1c1e
border: #3a3a3e
border-focus: #f0f0eb
text: #f0f0eb
placeholder: #6b6b65
font: Inter 13px
```

**Badge**
```
Variantes:
  default  → bg #f0f0eb14  text #f0f0eb  border #f0f0eb33
  success  → bg #052e16    text #86efac
  warning  → bg #1c1003    text #fde68a
  danger   → bg #1c0303    text #fca5a5
  muted    → bg #1c1c1e    text #6b6b65
```

**Select / Dropdown**
```
trigger: Input style
content: bg #1c1c1e  border #2e2e31  shadow: --shadow-lg
item hover: bg #f0f0eb0a  text #f0f0eb
item selected: bg #f0f0eb14  text #f0f0eb
```

**Dialog / Sheet**
```
overlay:  bg rgb(0 0 0 / 0.7)  backdrop-blur: 4px
content:  bg #141415  border #2e2e31  shadow: --shadow-lg
header:   font Playfair 22px weight 600
```

**Skeleton**
```
bg: #1c1c1e
shimmer: linear-gradient(90deg, #1c1c1e, #242426, #1c1c1e)
animation: 1.5s ease-in-out infinite
```

---

### 6.2 Componentes de Domínio

#### VariantCard

O componente mais crítico da aplicação. Toda a experiência do catálogo gira em torno dele.

```
Estado default:
┌──────────────────────────┐
│                          │  ← border: 1px solid #2e2e31
│   ┌──────────────────┐   │     bg: #141415
│   │                  │   │
│   │    [imagem]      │   │  ← aspect-ratio: 1/1, object-cover
│   │                  │   │     bg fallback: #1c1c1e
│   └──────────────────┘   │
│                          │
│  OB 8142 C2              │  ← font: JetBrains Mono 12px, color: #f0f0eb
│  Preto Fosco             │  ← font: Inter 11px, color: #a8a89a
│  Ray Optics              │  ← font: Inter 11px, color: #6b6b65
└──────────────────────────┘

Estado hover:
- border: 1px solid #f0f0eb33
- sombra: 0 4px 20px rgb(0 0 0 / 0.5)
- checkbox aparece (canto sup. esq.)
- cursor: pointer

Estado selected:
- border: 1px solid #f0f0eb
- bg: #f0f0eb0a
- checkbox: marcado (✓ off-white sobre fundo escuro)
- sku_variant: color #f0f0eb (mais brilhante)

Estado loading:
- Skeleton ocupa toda a área da imagem
- Skeleton lines substituem os textos

Estado inactive:
- opacity: 0.4
- overlay com texto "Inativo" centralizado
- pointer-events: none
```

**Interface TypeScript:**
```typescript
interface VariantCardProps {
  variant: {
    id: string
    skuVariant: string
    colorCode: string | null
    colorLabel: string | null
    primaryImageUrl: string | null
    product: {
      name: string
      sku: string
    }
    brand: { name: string } | null
  }
  selected: boolean
  onToggle: (id: string) => void
  loading?: boolean
}
```

**Responsividade:** em mobile, o checkbox fica sempre visível (sem depender de hover — touch não tem hover).

---

#### FilterBar (Topbar de Filtros)

Barra horizontal posicionada logo abaixo da topbar principal.

```
Desktop:
┌────────────────────────────────────────────────────────────────────────────┐
│  [🔍 Buscar por nome, SKU ou referência...]  [Tipo ▼] [Marca ▼] [Categ. ▼]│
│  [Lente ▼]  [Cor: ___]  [Ponte: 10–22mm ▼]  [Haste: 120–160mm ▼] [Tags ▼]│
│                                                                            │
│  Filtros ativos:  [Grau ×]  [Ray Optics ×]  [ponte: 14–18mm ×]  [Limpar] │
└────────────────────────────────────────────────────────────────────────────┘

Tablet (scroll horizontal nos filtros):
┌──────────────────────────────────────────────┐
│  [🔍 Buscar...____________]      [Filtros ▼] │
│  → → [Tipo ▼] [Marca ▼] [Categ. ▼] → → →  │  ← scroll horizontal
│                                              │
│  [Grau ×]  [Ray ×]              [Limpar]    │
└──────────────────────────────────────────────┘

Mobile:
┌───────────────────────────────────────────┐
│  [🔍 Buscar...]          [⚙ Filtros (3)] │  ← badge com count de filtros ativos
│                                           │
│  [Grau ×]  [+2 mais]          [Limpar]  │
└───────────────────────────────────────────┘
↓ botão "Filtros" abre Sheet bottom com todos os filtros
```

**Comportamento:**
- Estado dos filtros sincronizado com URL query params (`useSearchParams`)
- Busca com debounce de 300ms
- Cada filtro ativo gera um badge removível
- `[Limpar]` remove todos os filtros de uma vez
- Filtros de range (ponte, haste) abrem um Popover com Slider duplo

---

#### SelectionBar

Barra flutuante na base da tela. Aparece ao selecionar o primeiro item.

```
Desktop:
┌──────────────────────────────────────────────────────────────────────────────┐
│  ▪▪▪ (3 thumbnails)  +9 mais     12 produtos selecionados   [Limpar]  [PDF →]│
└──────────────────────────────────────────────────────────────────────────────┘

Mobile:
┌──────────────────────────────────────────────────────┐
│  12 selecionados            [Ver ▲]      [PDF →]     │
└──────────────────────────────────────────────────────┘
```

**Estilos:**
```
bg: #141415
border-top: 1px solid #2e2e31
backdrop-filter: blur(12px)
position: fixed bottom-0
animation: slide-up (translate-y: 100% → 0, duration: 200ms, ease-out)

Botão PDF:
  bg: #f0f0eb  text: #0c0c0d  font: Inter 13px 500
  hover: #e0e0d6
  loading: spinner off-white + "Gerando..."

Thumbnails:
  w-8 h-8  rounded-sm  object-cover
  border: 1px solid #2e2e31
  overflow: hidden
  -ml-1 (stacked)
```

---

#### PDFModal

```
┌──────────────────────────────────────────────────────┐  bg: #141415
│  Gerar catálogo                                  [×] │  header: Playfair 22px
│  ─────────────────────────────────────────────────── │  border: #2e2e31
│                                                      │
│  12 produtos selecionados                            │  Inter 13px #a8a89a
│                                                      │
│  Preview                                             │  Inter 11px #6b6b65
│  ┌────┐┌────┐┌────┐┌────┐  +8 mais                 │
│  │img ││img ││img ││img │                            │  thumbnails 48×48
│  └────┘└────┘└────┘└────┘                            │
│                                                      │
│  Nome do cliente                                     │  Inter 13px #a8a89a
│  ┌──────────────────────────────────────────────┐   │
│  │ Ex: Ótica São Paulo Ltda                      │  │  Input estilizado
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Cancelar]                    [Gerar e baixar →]   │
└──────────────────────────────────────────────────────┘
```

---

#### DashboardStatCard

```
┌───────────────────────────────┐  bg: #141415
│  Modelos cadastrados          │  border: 1px solid #2e2e31
│                               │  border-radius: 8px
│  1.247                        │  número: Playfair 36px #f0f0eb
│  ↑ +23 este mês               │  variação: Inter 12px success.text
└───────────────────────────────┘
```

---

#### DataTable

Usado nas páginas admin (produtos, marcas, categorias, tags).

```
Desktop — tabela padrão:
┌──────────────────────────────────────────────────────────────────┐
│ bg: #141415  border: #2e2e31                                     │
│ header: Inter 11px 500 uppercase tracking-wide color: #6b6b65   │
│ row hover: bg #f0f0eb0a                                          │
│ row border-bottom: 1px solid #2e2e31                             │
│ text: Inter 13px #f0f0eb / #a8a89a                               │
│ sku column: JetBrains Mono 12px                                  │
└──────────────────────────────────────────────────────────────────┘

Mobile — colapsa para cards:
┌─────────────────────────────────┐
│ bg: #141415  border: #2e2e31    │
│                                 │
│ OB 8142          [···]          │
│ Modelo X · Ray Optics           │
│ 3 variantes                     │
└─────────────────────────────────┘
```

---

#### ImageUploader

Drop zone para upload de imagens de variante.

```
Estado vazio:
┌────────────────────────────────────────────┐  border: 2px dashed #3a3a3e
│                                            │  bg: #0c0c0d
│      ↑                                     │  border-radius: 8px
│   Arraste imagens aqui                     │
│   ou clique para selecionar                │  Inter 13px #6b6b65
│                                            │
│   JPG, PNG ou WebP · máx. 10MB            │  Inter 11px #6b6b65
└────────────────────────────────────────────┘

Estado drag-over:
  border: 2px dashed #f0f0eb
  bg: #f0f0eb0a

Estado com imagens:
┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────┐
│img ★ │ │ img  │ │ img  │ │  +  Adicionar│
│[del] │ │[★][×]│ │[★][×]│ └──────────────┘
└──────┘ └──────┘ └──────┘

★ = imagem primária (off-white icon)
```

---

#### EmptyState

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         ○  (ícone circular outline, 48px)           │
│         sem fundo, stroke: #3a3a3e                  │
│                                                     │
│     Nenhum produto encontrado                       │  Playfair 18px #f0f0eb
│                                                     │
│  Ajuste os filtros ou busque por outro termo.       │  Inter 13px #6b6b65
│                                                     │
│              [Limpar filtros]                       │  Button ghost
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 6.3 Tokens de Espaçamento

Sistema baseado em múltiplos de 4px:

| Token | Valor | Uso |
|---|---|---|
| `space-1` | 4px | Gap mínimo inline |
| `space-2` | 8px | Padding de badge, ícone |
| `space-3` | 12px | Gap label → input |
| `space-4` | 16px | Padding interno de card |
| `space-5` | 20px | Gap entre grupos de filtro |
| `space-6` | 24px | Padding de seção |
| `space-8` | 32px | Margem entre seções |
| `space-12` | 48px | Espaçamento hero |

### 6.4 Border Radius

```typescript
borderRadius: {
  none: '0',
  sm:   '4px',    // badges, imagens de thumbnail
  md:   '6px',    // botões, inputs
  lg:   '8px',    // cards, dropdowns, modais
  xl:   '12px',   // sheets, painéis grandes
  full: '9999px', // avatars, pills de filtro ativo
}
```

### 6.5 Sombras

Em dark mode, sombras são densas — o fundo já é escuro, então a sombra precisa de opacidade maior para criar profundidade:

```typescript
boxShadow: {
  card:    '0 1px 1px 0 rgb(0 0 0 / 0.3), 0 0 0 1px #2e2e31',
  hover:   '0 4px 20px 0 rgb(0 0 0 / 0.5)',
  modal:   '0 20px 60px 0 rgb(0 0 0 / 0.7)',
  'ring':  '0 0 0 3px #f0f0eb40',    // focus ring off-white
  'ring-danger': '0 0 0 3px #f8717140',
}
```

---

## 7. Layout e Navegação

### Topbar Principal

```
Mobile (56px):
┌──────────────────────────────────────────┐
│ [☰]   Ótica Manager          [Avatar ▼] │
└──────────────────────────────────────────┘

Desktop (64px):
┌────────────────────────────────────────────────────────────────────┐
│  Ótica Manager          [Dashboard] [Catálogo] [Admin ▼]  [Avatar]│
└────────────────────────────────────────────────────────────────────┘

Estilo topbar:
  bg: #141415
  border-bottom: 1px solid #2e2e31
  position: sticky top-0  z-index: 50

Logo/Nome:
  "Ótica" → Playfair 18px italic #f0f0eb
  "Manager" → Inter 18px 300 #6b6b65

Nav links (desktop):
  Inter 13px 500
  active: #f0f0eb
  inactive: #6b6b65  hover: #a8a89a
  active indicator: underline off-white 1px bottom

Avatar menu:
  Dropdown com: "Meu perfil", "Configurações" (admin), divisor, "Sair"
```

### Sidebar (Mobile — Sheet lateral)

Abre pelo botão hamburguer na topbar mobile:

```
┌──────────────────────────────────────┐
│  Ótica Manager                   [×] │  bg: #141415
├──────────────────────────────────────┤  border-right: #2e2e31
│                                      │
│  🏠  Dashboard                       │
│  📋  Catálogo                        │
│  ────────────────────                │
│  (admin only)                        │
│  📦  Produtos                        │
│  🏷   Marcas                          │
│  📂  Categorias                      │
│  🔖  Tags                            │
│                                      │
│  ────────────────────                │
│  [Avatar]  Nome do usuário           │
│            employee / admin          │
│  [Sair]                              │
└──────────────────────────────────────┘

Item ativo:
  bg: #f0f0eb0a
  border-left: 2px solid #f0f0eb
  text: #f0f0eb

Item inativo:
  text: #6b6b65  hover: #a8a89a  bg hover: #f0f0eb0a
```

---

## 8. Páginas e Fluxos

### 8.1 Login

```
Página pública. Sem topbar, sem nav. Fundo: #0c0c0d.

┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│           Ótica                              │  Playfair 32px italic
│           Manager                            │  Inter 32px 300 #6b6b65
│                                              │
│  ─────────────────────────────────────────   │  separator #2e2e31
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ E-mail                                 │  │
│  │ [_____________________________________]│  │
│  │                                        │  │
│  │ Senha                                  │  │
│  │ [_____________________________________]│  │
│  │                                    [👁]│  │
│  │                                        │  │
│  │         [  Entrar  ]                   │  │  Button primary full-width
│  └────────────────────────────────────────┘  │  bg: #141415  border: #2e2e31
│                                              │  card-width: 400px
│                                              │
└──────────────────────────────────────────────┘

Erro: Toast destrutivo + shake no card
Sucesso: redirect /catalogo
```

---

### 8.2 Dashboard (`/`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOPBAR                                                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Bom dia, Carla                                                      │  Playfair 28px
│  Aqui está o resumo do catálogo hoje.                                │  Inter 13px #a8a89a
│                                                                      │
│  ┌────────────────┐ ┌────────────────┐ ┌──────────────┐ ┌─────────┐ │
│  │  1.247         │ │  3.891         │ │  48          │ │  12     │ │  StatCards
│  │  Modelos       │ │  Variantes     │ │  Marcas      │ │  Categ. │ │
│  └────────────────┘ └────────────────┘ └──────────────┘ └─────────┘ │
│                                                                      │
│  ──────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Adicionados recentemente                                            │  Playfair 18px
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                            │
│  │ card │  │ card │  │ card │  │ card │                            │  VariantCards preview
│  └──────┘  └──────┘  └──────┘  └──────┘                            │  (não selecionáveis)
│                                                                      │
│  [Ver catálogo completo →]                                           │  Button ghost
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Mobile: stat cards em 2×2, sem seção "recentes"
```

---

### 8.3 Catálogo (`/catalogo`) — Página principal

```
Desktop:
┌───────────────────────────────────────────────────────────────────────────┐
│  TOPBAR (sticky)                                                          │
├───────────────────────────────────────────────────────────────────────────┤
│  FILTER BAR (sticky, logo abaixo da topbar)                               │
│  [🔍 Buscar por nome, referência ou cor...]  [Tipo ▼][Marca ▼][Categ. ▼] │
│  [Lente ▼][Cor: ___][Ponte ▼][Haste ▼][Tags ▼]           [Limpar filtros]│
│  ────────────────────────────────────────────────────────────────────── │
│  Filtros:  [Grau ×]  [Ray Optics ×]                                       │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  847 variantes encontradas                              [⊞ 4] [⊞ 5] [⊞ 6]│  ← toggle colunas
│                                                                           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                          │
│  │      │ │   ✓  │ │      │ │      │ │      │                          │  grid de cards
│  │      │ │      │ │      │ │      │ │      │                          │
│  │OB..2 │ │OB..4 │ │OB..7 │ │RA..1 │ │RA..3 │                          │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                          │
│                                                                           │
│  ...                                                                      │
│                                                                           │
│       ←  1  2  3  ...  43  →                                             │  paginação centrada
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│  ▪▪▪ +9   12 selecionados              [Limpar]       [Gerar PDF →]      │  SelectionBar
└───────────────────────────────────────────────────────────────────────────┘

Mobile:
┌─────────────────────────────────────────┐
│  TOPBAR                                 │
├─────────────────────────────────────────┤
│  [🔍 Buscar...]          [⚙ Filtros 2] │
│  [Grau ×]  [Ray ×]          [Limpar]   │
├─────────────────────────────────────────┤
│  847 variantes                          │
│                                         │
│  ┌────────────┐  ┌────────────┐         │
│  │            │  │     ✓      │         │
│  │   [img]    │  │   [img]    │         │
│  │ OB 8142 C2 │  │ OB 8142 C4 │         │
│  │ Preto Fosco│  │ Dourado    │         │
│  └────────────┘  └────────────┘         │
│  ┌────────────┐  ┌────────────┐         │
│  │            │  │            │         │
│  └────────────┘  └────────────┘         │
│                                         │
│       ←  1  2  3  →                     │
│                                         │
├─────────────────────────────────────────┤
│  12 selecionados   [Ver ▲]   [PDF →]   │
└─────────────────────────────────────────┘
```

**Fluxo de seleção → PDF:**
```
1. Clique no card → toggle seleção (visual imediato, Zustand)
2. SelectionBar aparece com slide-up ao selecionar o primeiro
3. Usuário continua selecionando (navega entre páginas, filtros)
4. Clica "Gerar PDF →" → PDFModal abre
5. Preenche nome do cliente (opcional) → "Gerar e baixar"
6. Botão: spinner + "Gerando PDF..." (POST /pdf/generate)
7. Response blob → download automático via link programático
8. Toast: "Catálogo gerado com sucesso"
9. Modal fecha, seleção limpa
```

---

### 8.4 Admin — Produtos (`/admin/produtos`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Produtos                                       [+ Novo produto]     │  Playfair 22px
├──────────────────────────────────────────────────────────────────────┤
│  [🔍 Buscar por nome ou SKU]      [Marca ▼]  [Tipo ▼]  [Status ▼]   │
├──────────────────────────────────────────────────────────────────────┤
│  SKU          │ Nome        │ Marca    │ Variantes │ Status │ Ações  │
│  ─────────────┼─────────────┼──────────┼───────────┼────────┼──────  │
│  OB 8142      │ Modelo X    │ Ray      │ 3         │ ● Ativo│ [···]  │
│  OB 8123      │ Modelo Y    │ OB       │ 1         │ ● Ativo│ [···]  │
├──────────────────────────────────────────────────────────────────────┤
│  ← 1 de 63 páginas  →                                                │
└──────────────────────────────────────────────────────────────────────┘

SKU column: JetBrains Mono 12px
[···] abre Dropdown: Editar / Gerenciar variantes / Desativar
```

---

### 8.5 Formulário de Produto

Formulário em seções lógicas com validação em tempo real:

```
Seção 1 — Identificação
  SKU *             Nome *
  Marca             Categoria
  Descrição (textarea, opcional)

Seção 2 — Atributos Técnicos
  Tipo de armação   [grau] [sol] [clip-on] [esportivo]  ← radio pills
  Tipo de lente     [Select]
  Gênero            [Select]
  Tamanho da ponte  [____ mm]   ← Input com sufixo "mm", font: mono
  Tamanho da haste  [____ mm]

Seção 3 — Tags
  [Command combobox — busca + seleciona tags + criar nova inline]

─────────────────────────────────────────────────────────────
[Cancelar]                              [Salvar produto →]
```

Após salvar → redirect para `/admin/produtos/:id/variantes`

---

### 8.6 Gerenciamento de Variantes

```
┌───────────────────────────────────────────────────────────────┐
│ ← Produtos    OB 8142 — Modelo X               [+ Variante]   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  OB 8142 C2                    Preto Fosco       [···]  │  │  Playfair bold + mono
│  │  ┌──────┐ ┌──────┐ ┌──────┐   ┌─────────────────────┐  │  │
│  │  │img ★ │ │ img  │ │ img  │   │   + Adicionar img   │  │  │
│  │  └──────┘ └──────┘ └──────┘   └─────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  OB 8142 C4                    Dourado           [···]  │  │
│  │  ┌──────┐                      ┌─────────────────────┐  │  │
│  │  │img ★ │                      │   + Adicionar img   │  │  │
│  │  └──────┘                      └─────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

★ = imagem primária (badge off-white)
[···] = Dropdown: Editar cor label / Desativar variante

---

## 9. Estrutura do Projeto

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx           ← auth guard + AppLayout
│   │   │   ├── page.tsx             ← dashboard
│   │   │   ├── catalogo/
│   │   │   │   └── page.tsx
│   │   │   └── admin/
│   │   │       ├── layout.tsx       ← role guard (admin only)
│   │   │       ├── produtos/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── novo/page.tsx
│   │   │       │   └── [id]/
│   │   │       │       ├── editar/page.tsx
│   │   │       │       └── variantes/page.tsx
│   │   │       ├── marcas/page.tsx
│   │   │       ├── categorias/page.tsx
│   │   │       └── tags/page.tsx
│   │   ├── layout.tsx               ← root: fonts, Providers, next-themes
│   │   └── globals.css              ← CSS variables, resets, base styles
│   │
│   ├── components/
│   │   ├── ui/                      ← Shadcn components (customizados dark)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── command.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── pagination.tsx
│   │   │
│   │   ├── domain/
│   │   │   ├── variant-card/
│   │   │   │   └── variant-card.tsx
│   │   │   ├── filter-bar/
│   │   │   │   ├── filter-bar.tsx
│   │   │   │   ├── filter-bar-mobile.tsx
│   │   │   │   ├── filter-range-popover.tsx
│   │   │   │   └── active-filter-badges.tsx
│   │   │   ├── selection-bar/
│   │   │   │   └── selection-bar.tsx
│   │   │   ├── pdf-modal/
│   │   │   │   └── pdf-modal.tsx
│   │   │   ├── dashboard-stat-card/
│   │   │   │   └── dashboard-stat-card.tsx
│   │   │   ├── data-table/
│   │   │   │   ├── data-table.tsx
│   │   │   │   └── data-table-mobile.tsx
│   │   │   ├── image-uploader/
│   │   │   │   └── image-uploader.tsx
│   │   │   └── empty-state/
│   │   │       └── empty-state.tsx
│   │   │
│   │   └── layout/
│   │       ├── app-layout.tsx       ← topbar + slot conteúdo
│   │       ├── topbar.tsx
│   │       ├── sidebar-sheet.tsx    ← nav mobile (Sheet)
│   │       └── providers.tsx        ← QueryClient + Sonner + next-themes
│   │
│   ├── hooks/
│   │   ├── use-selection.ts         ← Zustand: variantes selecionadas
│   │   ├── use-filters.ts           ← filtros sincronizados com URL
│   │   ├── use-generate-pdf.ts      ← mutação + blob download
│   │   ├── use-auth.ts              ← dados do usuário logado
│   │   └── use-debounce.ts
│   │
│   ├── services/
│   │   ├── api.ts                   ← instância Axios + interceptors
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── variants.service.ts
│   │   ├── images.service.ts
│   │   ├── catalog.service.ts
│   │   └── pdf.service.ts
│   │
│   ├── stores/
│   │   ├── selection.store.ts       ← Set<variantId> + métodos
│   │   └── ui.store.ts              ← sidebar open, grid columns
│   │
│   ├── lib/
│   │   ├── query-client.ts
│   │   ├── axios.ts
│   │   └── utils.ts                 ← cn(), formatters
│   │
│   ├── types/
│   │   ├── api.ts
│   │   └── domain.ts
│   │
│   └── schemas/
│       ├── product.schema.ts
│       ├── variant.schema.ts
│       └── auth.schema.ts
│
├── tailwind.config.ts               ← tokens completos
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 10. Plano de Desenvolvimento

### Fase 0 — Setup e Design System Base
- [ ] Next.js 14 + TypeScript + Tailwind inicializados
- [ ] `tailwind.config.ts` com paleta completa (base, offwhite, semânticas)
- [ ] `globals.css` com CSS variables dark, reset e base styles
- [ ] `next-themes` configurado (`defaultTheme: 'dark'`)
- [ ] Fontes: Playfair Display + Inter + JetBrains Mono via `next/font`
- [ ] Shadcn/ui inicializado e reestilizado para dark
- [ ] Componentes Shadcn instalados e customizados
- [ ] Axios com interceptors de auth e tenant
- [ ] TanStack Query configurado
- [ ] Zustand stores criados (`selection`, `ui`)
- [ ] Sonner configurado com tema dark

### Fase 1 — Layout e Auth
- [ ] `AppLayout` com topbar sticky
- [ ] `Topbar` com logo "Ótica Manager" (Playfair + Inter), nav, avatar
- [ ] `SidebarSheet` mobile (Sheet com nav completa)
- [ ] Auth guard no route group `(app)`
- [ ] Admin guard no route group `admin/`
- [ ] Página de login (formulário, validação, feedback)
- [ ] `useAuth` hook
- [ ] Logout com limpeza de token

### Fase 2 — Dashboard
- [ ] `DashboardStatCard` component
- [ ] Page `/` com 4 stat cards e seção recentes
- [ ] Skeleton states
- [ ] Responsive (2 cols mobile, 4 cols desktop)

### Fase 3 — Catálogo (feature principal)
- [ ] `VariantCard` com todos os estados (default, hover, selected, loading, inactive)
- [ ] Grid responsivo (2→6 colunas)
- [ ] `FilterBar` desktop (todos os filtros em topbar)
- [ ] `FilterBar` mobile (botão + Sheet bottom drawer)
- [ ] `ActiveFilterBadges` com remoção individual
- [ ] `FilterRangePopover` para ponte e haste (Slider duplo)
- [ ] `useFilters` sincronizado com URL (`useSearchParams`)
- [ ] Busca com debounce 300ms
- [ ] Toggle de colunas (4 / 5 / 6) no desktop
- [ ] `SelectionBar` flutuante com animação slide-up
- [ ] Zustand `selection.store` persistindo entre páginas
- [ ] Sheet "Ver seleção" com thumbnails
- [ ] `PDFModal` com preview e campo de nome do cliente
- [ ] `useGeneratePDF` (POST + blob download)
- [ ] Toast de sucesso/erro
- [ ] `EmptyState` para sem resultados
- [ ] Paginação

### Fase 4 — Gerenciamento Admin
- [ ] `DataTable` reutilizável (TanStack Table)
- [ ] Adaptação mobile do DataTable (cards)
- [ ] CRUD Marcas
- [ ] CRUD Categorias
- [ ] CRUD Tags
- [ ] Listagem de Produtos com DataTable
- [ ] Formulário de criação/edição de produto (radio pills para frameType)
- [ ] Gerenciamento de variantes com `ImageUploader`
- [ ] Drag-and-drop no ImageUploader
- [ ] Confirmação antes de deletar (Dialog)

### Fase 5 — Polish
- [ ] Animações de transição entre páginas
- [ ] Revisão de todos os skeleton states
- [ ] Error boundaries em todas as rotas
- [ ] Página 404 customizada
- [ ] Teste em 320px, 375px, 768px, 1024px, 1280px
- [ ] Audit de contraste WCAG AA
- [ ] Lighthouse ≥ 85 em Performance
- [ ] `tsc --noEmit` limpo

---

## 11. Acessibilidade e Performance

### Acessibilidade

- Contraste mínimo 4.5:1 — off-white (#f0f0eb) sobre fundo #141415 = ~13:1 ✓
- Contraste de texto secundário (#a8a89a) sobre #0c0c0d = ~6.5:1 ✓
- Navegação por teclado em todos os componentes (Radix garante)
- `alt` descritivo em todas as imagens: `"OB 8142 C2 — Preto Fosco"`
- Focus ring visível: `box-shadow: 0 0 0 3px #f0f0eb40`
- `SelectionBar` com `role="status"` e `aria-live="polite"`

### Performance

**Imagens:**
- `next/image` em todo o catálogo — lazy loading + WebP automático
- `priority` nas primeiras 10 imagens do grid (above the fold)
- Thumbnails 400×400 no catálogo, originais apenas em zoom
- `sizes` correto por breakpoint para não baixar imagem oversized

**Dados:**
- `staleTime: 60_000` no catálogo — evita refetch ao voltar de página
- Prefetch de página seguinte enquanto usuário está na atual
- Filtros na URL — Back/Forward do browser funciona sem refetch

**Bundle:**
- `next/dynamic` para: `PDFModal`, `ImageUploader`, `DataTable`, `FilterBar`
- Shadcn: apenas componentes usados instalados

**PDF Download:**
```typescript
// Correto — não usa window.open (bloqueado por popup blockers)
const response = await api.post('/pdf/generate', payload, {
  responseType: 'blob'
})
const url = URL.createObjectURL(new Blob([response.data]))
const link = document.createElement('a')
link.href = url
link.download = `catalogo-${clientName ?? 'otica-manager'}-${date}.pdf`
link.click()
URL.revokeObjectURL(url)
```

---

## 12. Checklist de Entrega

### Setup e Design System
- [ ] Tailwind tokens (paleta, tipografia, espaçamento, sombras, radius)
- [ ] CSS variables dark definidas em `globals.css`
- [ ] Fontes Playfair + Inter + JetBrains Mono carregadas
- [ ] Shadcn reestilizado para dark off-white
- [ ] Sem hardcode de cores fora do `tailwind.config.ts`

### Componentes
- [ ] VariantCard (default, hover, selected, loading, inactive)
- [ ] FilterBar desktop + mobile
- [ ] SelectionBar com animação
- [ ] PDFModal com estados (idle, loading, success, error)
- [ ] DashboardStatCard
- [ ] DataTable responsivo
- [ ] ImageUploader (drag-and-drop + preview + primária)
- [ ] EmptyState

### Páginas
- [ ] Login
- [ ] Dashboard
- [ ] Catálogo (filtros, seleção, PDF)
- [ ] Admin: Produtos, Variantes, Marcas, Categorias, Tags

### Qualidade
- [ ] Responsivo: 320px / 375px / 768px / 1024px / 1280px / 1536px
- [ ] Contraste WCAG AA em todos os elementos
- [ ] Navegação por teclado funcional
- [ ] `tsc --noEmit` sem erros
- [ ] Lighthouse Performance ≥ 85
- [ ] Download de PDF funcional em Chrome, Firefox e Safari
