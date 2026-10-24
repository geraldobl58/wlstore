# WLStore — Microfrontends com Next.js + Nx

Monorepo [Nx](https://nx.dev) com arquitetura de **microfrontends** em Next.js
([Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones)). Cada
microfrontend é uma aplicação Next **independente**: build, deploy, versão e
runtime próprios, sem importar código de nenhum outro app. Todos são servidos
**no mesmo domínio**, cada um sob o seu `basePath`.

Os apps se dividem por **área do produto**, não por serviço do backend: a
vitrine mostra dados de catálogo, preço e estoque, mas é um app só.

## Arquitetura

```
                         navegador
                             │
                             ▼
       ┌───────────────────────────────────────────────┐
       │  cluster: NGINX Ingress (develop.wlstore.local) │
       │  dev local: rewrites da vitrine (app padrão)    │
       └──────────────┬─────────────────────┬────────────┘
                      │ /  (todo o resto)   │ /painel/*
                      ▼                     ▼
             ┌─────────────────┐   ┌─────────────────┐
             │ vitrine-mfe     │   │ painel-mfe      │
             │ :3000           │   │ :4300           │
             │ basePath: /     │   │ /painel         │
             └───────┬─────────┘   └────────┬────────┘
                     │                      │
          catalog-service (+ preço       pricing-service
          copiado por eventos)           (backend Java)

   packages/ui   ← design system, StoreHeader/StoreFooter (versionado)
   packages/http ← cliente HTTP (ky) (versionado)
```

O usuário enxerga **um único domínio**. Quem decide qual app atende cada
caminho:

- **No cluster:** o NGINX Ingress. Nenhum app conhece os outros no build, e
  cada time publica o seu sem rebuildar ninguém.
- **Em dev local** (`pnpm dev`): a vitrine, app padrão em `/`, faz o papel do
  Ingress com `rewrites` para a porta local de cada app.

### Projetos

| Projeto | Caminho | Porta (dev) | `basePath` | Papel | Backend |
| --- | --- | --- | --- | --- | --- |
| `vitrine-mfe` | `apps/vitrine-mfe` | 3000 | `/` | Loja: home, busca, menu de categorias, vitrines e listagens, exibição de preço | `catalog-service` |
| `painel-mfe` | `apps/painel-mfe` | 4300 | `/painel` | Painel do lojista: gestão de preços (depois estoque e pedidos) | `pricing-service` |
| `ui` | `packages/ui` | — | — | Design system, `StoreHeader`, `StoreFooter` (`@wlstore/ui`) | — |
| `http` | `packages/http` | — | — | Cliente HTTP com ky (`@wlstore/http`) | serviços Java |

### Regras

- **Um app nunca importa outro.** A regra `@nx/enforce-module-boundaries`
  barra no lint. O que um app mostra é dele: o card de produto, o preço no card
  e o menu de categorias são da vitrine.
- **`packages/` é só plataforma, sem domínio:** design system, cabeçalho,
  rodapé e cliente HTTP. O cabeçalho é estrutura com espaços (`actions`,
  `children`), e cada app preenche com o seu conteúdo.
- **Pacotes de plataforma serão versionados.** Hoje os apps usam
  `workspace:*`; com a separação em repositórios, `ui` e `http` passam a ser
  publicados com versão, e cada app atualiza quando quiser.
- **Comunicação entre apps** só por URL (links, filtros, busca), cookie de
  sessão e backend. Nada de estado JavaScript compartilhado.
- **Dados de vários serviços na mesma tela:** em listas, o catálogo traz uma
  cópia (ex.: `priceFromCents`, atualizado por eventos do pricing-service). Na
  tela de um item só, a Server Action do app consulta os serviços em paralelo.

### Decisões de projeto

- **`basePath` por microfrontend.** Cada app serve tudo sob o próprio prefixo,
  o que evita colisão de rotas. Os assets do Next (`/painel/_next/*`) caem na
  mesma regra de roteamento das páginas. A vitrine, app padrão, não tem
  `basePath`.
- **Roteamento fora dos apps em produção.** O Ingress roteia por prefixo. Os
  `rewrites` da vitrine só existem em dev.
- **Portas fixas** (só para dev local), definidas no `project.json` de cada app
  e repetidas na lista `MICROFRONTENDS` do `next.config.js` da vitrine.
- **Navegação entre microfrontends usa `<a>`, não `next/link`.** Cada app é um
  runtime Next separado, então a navegação entre eles é uma navegação de
  documento completa. Dentro do mesmo app, use `next/link`.
- **Isolamento de runtime.** Um microfrontend que cai derruba apenas as suas
  rotas; o resto do site continua no ar.

## Pré-requisitos

- Node.js 22+ (o `ky`, usado em `packages/http`, exige 22 ou superior)
- [pnpm](https://pnpm.io) 10+ (`corepack enable`)
- Backend rodando (`catalog-service` em `:8081`) para a vitrine ter dados

## Começando

```sh
pnpm install
pnpm dev
```

Acesse:

- <http://localhost:3000> — vitrine (como o usuário acessa)
- <http://localhost:3000/painel> — painel do lojista, **servido através da vitrine**
- <http://localhost:4300/painel> — painel isolado (útil para depurar)

> `pnpm dev` roda `nx run vitrine-mfe:dev`, que via `dependsOn` sobe o painel
> junto. É só conveniência de dev: não existe dependência de build entre os
> apps.

## Scripts

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Sobe a vitrine **e** os outros apps |
| `pnpm dev:all` | Sobe todos os apps em paralelo |
| `pnpm build` | Build de produção de todos os projetos |
| `pnpm start` | Sobe todos os apps em modo produção |
| `pnpm lint` | ESLint em todo o workspace |
| `pnpm test` | Testes (Vitest) de todos os projetos |
| `pnpm typecheck` | Checagem de tipos |
| `pnpm graph` | Abre o grafo de dependências do Nx |

Para um projeto específico: `npx nx <target> <projeto>` (ex.: `npx nx build painel-mfe`).

## Variáveis de ambiente

| Variável | App | Padrão | Descrição |
| --- | --- | --- | --- |
| `CATALOG_API_URL` | vitrine-mfe | `http://localhost:8081` | catalog-service (chamado só no servidor) |
| `TENANT_ID` | vitrine-mfe | tenant de dev | Tenant das chamadas, até existir login |
| `PAINEL_URL` | vitrine-mfe (dev) | `http://localhost:4300` | Para onde a vitrine encaminha `/painel` em dev |

No **build de produção** o `PAINEL_URL` não é usado (o roteamento é do
Ingress). Se for informado no build, a vitrine volta a fazer proxy.

## Código compartilhado

### UI: shadcn/ui + Tailwind v4

Os componentes shadcn ficam em `packages/ui/src/components/ui` e o tema em
[`packages/ui/src/styles/globals.css`](packages/ui/src/styles/globals.css), com
as cores, fontes, raios e sombras do design system WLStore. Cada app importa o
tema no seu `global.css` (`@import '@wlstore/ui/globals.css'`) e aplica as
fontes com `fontVariables` no `<html>`.

```tsx
import { StoreFooter, StoreHeader } from '@wlstore/ui';
import { Button } from '@wlstore/ui/components/ui/button';

<StoreHeader storeName="WLStore" search={{ action: '/' }}>
  {/* linha extra do app, ex.: menu de categorias */}
</StoreHeader>
<Button>Adicionar ao carrinho</Button>
```

Para adicionar componentes shadcn, rode na raiz `pnpm ui:add dialog sheet`
(não use o `shadcn add` direto: o script corrige o import de `cn` que o CLI gera
errado neste monorepo). Use os tokens (`bg-primary`, `text-link`,
`bg-brand-50`), nunca hex: o lojista troca a escala `--brand-*`.

### HTTP

`packages/http` (`@wlstore/http`) encapsula o ky e normaliza erros em
`ApiError`. Cada app cria o seu cliente em `src/config/api.ts`, porque a base
URL é diferente por serviço:

```ts
import { createHttpClient, resolveBaseUrl } from '@wlstore/http';

export const api = createHttpClient({
  baseUrl: resolveBaseUrl({
    server: process.env.CATALOG_API_URL,
    fallback: 'http://localhost:8081',
  }),
  getHeaders: () => ({ 'X-Tenant-Id': tenantId }),
});
```

### Features

Cada app organiza o seu código em `src/features/<feature>/` (`actions/`,
`components/`, `hooks/`, `http/`, `types/`), conforme
[`skills/SKILLS.md`](skills/SKILLS.md): componente → hook (TanStack Query) →
Server Action → `http/` → backend, com testes ao lado de cada arquivo.

---

## Como criar um novo microfrontend

O exemplo cria o **`checkout-mfe`**, servido em `/checkout`, na porta **4400**.
Troque nome, caminho e porta conforme o seu caso.

> **Convenção:** um app por **área do produto** (checkout, conta, painel), nome
> `<area>-mfe`, `basePath` `/<area>`, portas locais a partir de 4300
> (`painel` 4300, o próximo 4400…). Duas portas iguais fazem o segundo app
> falhar ao subir em dev.

### 1. Gere a aplicação

```sh
npx nx g @nx/next:app apps/checkout-mfe --style=none --linter=eslint --e2eTestRunner=none
```

### 2. Configure o `basePath` e a porta

**`apps/checkout-mfe/next.config.js`**:

```js
//@ts-check

const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
  transpilePackages: ['@wlstore/http', '@wlstore/ui'],
  basePath: '/checkout',
  allowedDevOrigins: ['localhost:3000', '127.0.0.1:3000'],
};

module.exports = nextConfig;
```

**`apps/checkout-mfe/project.json`**, com a porta fixa nos targets:

```json
{
  "targets": {
    "dev": { "options": { "command": "next dev --port 4400" } },
    "start": { "options": { "command": "next start --port 4400" } },
    "serve-static": { "options": { "command": "next start --port 4400" } }
  }
}
```

### 3. Registre a rota de dev na vitrine

Em **`apps/vitrine-mfe/next.config.js`**, adicione uma linha na lista
`MICROFRONTENDS`:

```js
const MICROFRONTENDS = [
  { basePath: '/painel', env: 'PAINEL_URL', port: 4300 },
  { basePath: '/checkout', env: 'CHECKOUT_URL', port: 4400 },
];
```

E inclua o app no `dependsOn` do `dev` em **`apps/vitrine-mfe/project.json`**,
para subir junto no `pnpm dev`. Isso só vale para dev; em produção, quem roteia
é o Ingress.

### 4. Adicione ao registro e use o cabeçalho da loja

Em **`packages/ui/src/lib/registry.ts`**, uma entrada nova em `MICROFRONTENDS`.
No layout do app, use `StoreHeader` e `StoreFooter` do `@wlstore/ui`, como na
vitrine.

### 5. Sincronize e valide

```sh
pnpm install
npx nx sync           # atualiza as referências de projeto do TypeScript
pnpm lint && pnpm test && pnpm build
pnpm dev
```

Confirme que <http://localhost:3000/checkout> responde **através da vitrine**.

### 6. Deploy

1. **CI:** um item no `APPS_JSON` do workflow de deploy (`APP=checkout-mfe`,
   `PORT=4400`).
2. **Infra:** `projects/wlstore/apps/checkout-mfe/` no repo de infra, com
   `service.port: 4400` e `ingress.path` e probes em `/checkout`, no mesmo
   `ingress.host` da vitrine.

### Checklist

- [ ] App gerado em `apps/<area>-mfe`
- [ ] `basePath: '/<area>'` e `transpilePackages` no `next.config.js`
- [ ] Porta única fixada nos targets do `project.json`
- [ ] Linha na lista `MICROFRONTENDS` do `next.config.js` da vitrine e no `dependsOn` do dev
- [ ] Entrada nova em `MICROFRONTENDS` do `registry.ts`
- [ ] `StoreHeader`/`StoreFooter` no layout
- [ ] `npx nx sync`, `pnpm lint`, `pnpm test` e `pnpm build` passando
- [ ] Item no workflow de deploy e pasta no repo de infra (`ingress.path` == `basePath`)

---

## Deploy

Cada microfrontend é uma imagem e um deploy independentes. Um único
[`Dockerfile`](Dockerfile) serve todos os apps (`--build-arg APP=<app>
--build-arg PORT=<porta>`).

- **Roteamento:** no repo de infra, todos os fronts dividem o `ingress.host` do
  ambiente, e cada app tem `ingress.path` igual ao seu `basePath` (a vitrine
  fica em `/`). Não faça strip do prefixo no Ingress: o app espera recebê-lo.
- **Migração pendente:** o workflow de deploy (`.github/workflows/deploy.yml`
  na raiz do repo) e o repo de infra ainda descrevem `shell`, `catalog-mfe` e
  `pricing-mfe`. Eles serão refeitos na separação em repositórios, com
  `vitrine-mfe` (`/`, porta 3000) e `painel-mfe` (`/painel`, porta 4300).

Localmente, o Nx detecta os projetos afetados:

```sh
npx nx affected -t build
```

## Solução de problemas

| Sintoma | Causa provável |
| --- | --- |
| `/<app>` retorna 404 no `pnpm dev` | O app não está no ar, falta a linha na lista do `next.config.js` da vitrine, ou a porta diverge |
| `/<app>` retorna 404 no cluster | Falta o app em `projects/wlstore/apps/`, ou `ingress.path` ≠ `basePath` |
| Página de um app sem CSS/JS | O `basePath` diverge do prefixo da rota (`ingress.path` ou rewrite) |
| Vitrine com "Não foi possível carregar os produtos" | catalog-service fora do ar, ou `CATALOG_API_URL` errado |
| `EADDRINUSE` ao subir | Dois projetos com a mesma porta em `project.json` |
| Aviso de cross-origin em dev | Falta `allowedDevOrigins: ['localhost:3000']` no config do app |
| `The workspace is out of sync` | Rode `npx nx sync` |
| `Imports of apps are forbidden` no lint | Um app importou código de outro; mova para o app dono ou para um pacote de plataforma |
| Link entre microfrontends recarrega errado | Uso de `next/link` no lugar de `<a>` para rota de outro app |

## Saiba mais

- [Next.js — Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones)
- [Next.js — basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath)
- [Next.js — rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)
- [Vercel — Microfrontends](https://vercel.com/docs/microfrontends)
- [Nx — affected](https://nx.dev/ci/features/affected)
