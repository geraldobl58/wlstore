# WLStore — Microfrontends com Next.js + Nx

Monorepo [Nx](https://nx.dev) com arquitetura de **microfrontends** em Next.js
([Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones)). Cada
microfrontend é uma aplicação Next independente (build, deploy e runtime
próprios) e espelha um serviço do backend. Todos são servidos **no mesmo
domínio**, cada um sob o seu `basePath`.

## Arquitetura

```
                         navegador
                             │
                             ▼
       ┌──────────────────────────────────────────────┐
       │  cluster: NGINX Ingress (develop.wlstore.local)│
       │  dev local: o próprio shell (rewrites)         │
       └─────┬────────────────┬─────────────────┬──────┘
             │ /              │ /catalog/*      │ /pricing/*
             ▼                ▼                 ▼
     ┌──────────────┐ ┌────────────────┐ ┌────────────────┐
     │ shell :3000  │ │ catalog-mfe    │ │ pricing-mfe    │
     │ basePath: /  │ │ :4200          │ │ :4300          │
     │ (host)       │ │ /catalog       │ │ /pricing       │
     └──────────────┘ └───────┬────────┘ └───────┬────────┘
                              │                  │
                       catalog-service    pricing-service   (backend Java)

        packages/ui  ← navegação e registro compartilhados por todos
        packages/http ← cliente HTTP (ky) dos microfrontends
```

O usuário enxerga **um único domínio**. Quem decide qual app atende cada
caminho:

- **No cluster:** o NGINX Ingress. O shell não faz proxy e não conhece os mfes
  no build. Por isso um time publica o seu mfe sem rebuildar o shell.
- **Em dev local** (`pnpm dev`): o shell faz o papel do Ingress, com `rewrites`
  para a porta local de cada mfe.

### Projetos

| Projeto | Caminho | Porta (dev) | `basePath` | Papel | Backend |
| --- | --- | --- | --- | --- | --- |
| `shell` | `apps/shell` | 3000 | `/` | Host: home e layout raiz | — |
| `catalog-mfe` | `apps/catalog-mfe` | 4200 | `/catalog` | Microfrontend | `catalog-service` |
| `pricing-mfe` | `apps/pricing-mfe` | 4300 | `/pricing` | Microfrontend | `pricing-service` |
| `ui` | `packages/ui` | — | — | Lib compartilhada (`@wlstore/ui`) | — |
| `http` | `packages/http` | — | — | Cliente HTTP com ky (`@wlstore/http`) | serviços Java |
| `catalog` | `packages/catalog` | — | — | Features de catálogo usadas por vários apps, como o menu de categorias (`@wlstore/catalog`). Cada app executa as Server Actions no próprio servidor: defina `CATALOG_API_URL` em todo app que renderiza o menu | `catalog-service` |

### Decisões de projeto

- **`basePath` por microfrontend.** Cada app serve tudo sob o próprio prefixo,
  o que evita colisão de rotas. Os assets do Next (`/catalog/_next/*`) caem na
  mesma regra de roteamento das páginas, sem regra extra.
- **Roteamento fora do shell em produção.** O Ingress roteia por prefixo. O
  shell só tem links (`<a href="/catalog">`), e o deploy de um mfe não depende
  do shell.
- **Portas fixas** (só para dev local), definidas no `project.json` de cada app
  e repetidas na lista do `next.config.js` do shell.
- **Navegação entre microfrontends usa `<a>`, não `next/link`.** Cada app é um
  runtime Next separado, então a navegação entre eles é uma navegação de
  documento completa. `next/link` faria client-side routing para uma rota que
  não existe no app atual.
- **Isolamento de runtime.** Um microfrontend que cai derruba apenas a sua
  própria rota; o resto do site continua no ar.

## Pré-requisitos

- Node.js 22+ (o `ky`, usado em `packages/http`, exige 22 ou superior)
- [pnpm](https://pnpm.io) 10+ (`corepack enable`)

## Começando

```sh
pnpm install
pnpm dev
```

Acesse:

- <http://localhost:3000> — shell
- <http://localhost:3000/catalog> — catálogo **servido através do shell** (como o usuário acessa)
- <http://localhost:3000/pricing> — preços, idem
- <http://localhost:4200/catalog> e <http://localhost:4300/pricing> — cada mfe isolado (útil para depurar)

> `pnpm dev` roda `nx run shell:dev`, que via `dependsOn` sobe automaticamente
> os microfrontends junto. Não é preciso abrir vários terminais.

## Scripts

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Sobe o shell **e** seus microfrontends |
| `pnpm dev:all` | Sobe todos os apps em paralelo |
| `pnpm build` | Build de produção de todos os projetos |
| `pnpm start` | Sobe todos os apps em modo produção |
| `pnpm lint` | ESLint em todo o workspace |
| `pnpm typecheck` | Checagem de tipos |
| `pnpm graph` | Abre o grafo de dependências do Nx |

Para um projeto específico: `npx nx <target> <projeto>` (ex.: `npx nx build catalog-mfe`).

## Variáveis de ambiente

Em dev local o shell encaminha cada mfe para `http://localhost:<porta>`. Para
apontar um mfe para outro endereço (ex.: depurar contra um mfe remoto), use a
variável dele:

| Variável | Padrão em dev | Descrição |
| --- | --- | --- |
| `CATALOG_URL` | `http://localhost:4200` | URL base do `catalog-mfe` |
| `PRICING_URL` | `http://localhost:4300` | URL base do `pricing-mfe` |

No **build de produção** essas variáveis não são usadas (o roteamento é do
Ingress). Se forem informadas no build, o shell volta a fazer proxy.

## Código compartilhado

`packages/ui` (`@wlstore/ui`) é consumido por todos os apps. O Next
transpila a lib direto do source, sem passo de build separado.

```tsx
import { MicrofrontendNav, MICROFRONTENDS } from '@wlstore/ui';
```

O registro em [`packages/ui/src/lib/registry.ts`](packages/ui/src/lib/registry.ts)
é a fonte de verdade da **navegação**. A barra é gerada a partir dele, então um
app novo aparece na navegação de todos os outros automaticamente.

### UI: shadcn/ui + Tailwind v4

Os componentes shadcn ficam em `packages/ui/src/components/ui` e o tema em
[`packages/ui/src/styles/globals.css`](packages/ui/src/styles/globals.css), com
as cores, fontes, raios e sombras do design system WLStore. Cada app importa o
tema no seu `global.css` (`@import '@wlstore/ui/globals.css'`) e aplica as
fontes com `fontVariables` no `<html>`.

```tsx
import { Button } from '@wlstore/ui/components/ui/button';

<Button>Adicionar ao carrinho</Button>
<p className="text-text-2">Secundário</p>
<span className="bg-status-success-bg text-status-success-fg">Frete grátis</span>
```

Para adicionar componentes, rode na raiz `pnpm ui:add dialog sheet` (não use o
`shadcn add` direto: o script corrige o import de `cn` que o CLI gera errado
neste monorepo). Use os tokens (`bg-primary`, `text-link`, `bg-brand-50`),
nunca hex: o lojista troca a escala `--brand-*`.

`packages/http` (`@wlstore/http`) concentra as chamadas aos backends, com ky
encapsulado e erros normalizados em `ApiError`. Cada microfrontend cria o seu
cliente, porque a base URL é diferente por serviço:

```ts
import { createHttpClient, resolveBaseUrl } from '@wlstore/http';

export const catalogHttp = createHttpClient({
  baseUrl: resolveBaseUrl({
    server: process.env.CATALOG_API_URL,
    browser: process.env.NEXT_PUBLIC_CATALOG_API_URL,
    fallback: 'http://localhost:8081',
  }),
  getHeaders: () => ({ 'X-Tenant-Id': tenantId }),
});
```

Detalhes em [`packages/http/README.md`](packages/http/README.md).

---

## Como criar um novo microfrontend

O exemplo cria o **`inventory-mfe`**, servido em `/inventory`, na porta
**4400**, espelhando o `inventory-service`. Troque nome, caminho e porta
conforme o seu caso.

> **Convenção:** nome `<domínio>-mfe`, `basePath` `/<domínio>`, portas locais a
> partir de 4200 (`catalog` 4200, `pricing` 4300, o próximo 4400…). Duas
> portas iguais fazem o segundo app falhar ao subir em dev.

### 1. Gere a aplicação

```sh
npx nx g @nx/next:app apps/inventory-mfe --style=none --linter=eslint --e2eTestRunner=none
```

### 2. Configure o `basePath` e a porta

**`apps/inventory-mfe/next.config.js`**:

```js
//@ts-check

const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },

  basePath: '/inventory',

  allowedDevOrigins: ['localhost:3000', '127.0.0.1:3000'],
};

module.exports = nextConfig;
```

**`apps/inventory-mfe/project.json`**, com a porta fixa nos targets:

```json
{
  "targets": {
    "dev": { "options": { "command": "next dev --port 4400" } },
    "start": { "options": { "command": "next start --port 4400" } },
    "serve-static": { "options": { "command": "next start --port 4400" } }
  }
}
```

### 3. Registre a rota de dev no shell

Em **`apps/shell/next.config.js`**, adicione uma linha na lista
`MICROFRONTENDS`:

```js
const MICROFRONTENDS = [
  { basePath: '/catalog', env: 'CATALOG_URL', port: 4200 },
  { basePath: '/pricing', env: 'PRICING_URL', port: 4300 },
  { basePath: '/inventory', env: 'INVENTORY_URL', port: 4400 },
];
```

Isso só vale para `pnpm dev`. Em produção, quem roteia é o Ingress (passo 8).

### 4. Suba o app junto com o shell

Em **`apps/shell/project.json`**, inclua o novo projeto no `dependsOn` do `dev`:

```json
"dependsOn": [
  { "projects": ["catalog-mfe", "pricing-mfe", "inventory-mfe"], "target": "dev" }
]
```

### 5. Adicione ao registro compartilhado

Em **`packages/ui/src/lib/registry.ts`**:

```ts
export const MICROFRONTENDS = [
  { key: 'shell', label: 'Home', basePath: '/' },
  { key: 'catalog', label: 'Catálogo', basePath: '/catalog' },
  { key: 'pricing', label: 'Preços', basePath: '/pricing' },
  { key: 'inventory', label: 'Estoque', basePath: '/inventory' },
] as const;
```

### 6. Use o layout compartilhado

Em **`apps/inventory-mfe/src/app/layout.tsx`**:

```tsx
import { MicrofrontendNav } from '@wlstore/ui';
import './global.css';

export const metadata = {
  title: 'Estoque | WLStore',
  description: 'Microfrontend de estoque',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <MicrofrontendNav active="inventory" />
        {children}
      </body>
    </html>
  );
}
```

### 7. Sincronize e valide

```sh
pnpm install          # linka o app ao workspace pnpm
npx nx sync           # atualiza as referências de projeto do TypeScript
pnpm typecheck
pnpm build
pnpm dev
```

Confirme que <http://localhost:3000/inventory> responde **através do shell**
(não só em `localhost:4400`) e que a navegação alterna entre os microfrontends.

### 8. Deploy (CI + infra)

1. **CI deste repo**: em `.github/workflows/deploy.yml`, adicione um item no
   `APPS_JSON` do job `plan`:
   ```json
   {
     "app": "inventory-mfe",
     "context": "./wlstore-fe",
     "dockerfile": "./wlstore-fe/Dockerfile",
     "build-args": "APP=inventory-mfe\nPORT=4400",
     "paths": ["wlstore-fe/apps/inventory-mfe/", "wlstore-fe/packages/", "..."]
   }
   ```
   Copie os demais `paths` do `catalog-mfe`.
2. **Repo de infra**: crie `projects/wlstore/apps/inventory-mfe/` copiando o
   `pricing-mfe/` e trocando nome, porta (`service.port: 4400`) e caminho
   (`ingress.path` e probes em `/inventory`). O `ingress.host` fica igual ao
   do shell.
3. Faça commit e push dos dois repos. O ArgoCD cria
   `wlstore-inventory-mfe-<env>` sozinho, e o Ingress passa a mandar
   `/inventory/*` para o app novo, **sem rebuild do shell**.

### Checklist

- [ ] App gerado em `apps/<nome>-mfe`
- [ ] `basePath: '/<nome>'` no `next.config.js`
- [ ] Porta única fixada nos targets do `project.json`
- [ ] Linha na lista `MICROFRONTENDS` do `next.config.js` do shell (dev)
- [ ] `dependsOn` do `shell:dev` atualizado
- [ ] Entrada nova em `MICROFRONTENDS` do `registry.ts`
- [ ] `<MicrofrontendNav active="<nome>" />` no layout
- [ ] `npx nx sync` executado, `pnpm typecheck` e `pnpm build` passando
- [ ] Item no `APPS_JSON` do workflow
- [ ] `projects/wlstore/apps/<nome>-mfe/` no repo de infra (`ingress.path` == `basePath`)

---

## Deploy

Cada microfrontend é uma imagem e um deploy independentes. Um único
[`Dockerfile`](Dockerfile) serve todos os apps (`--build-arg APP=<app>
--build-arg PORT=<porta>`).

- **CI** (`.github/workflows/deploy.yml`): builda e faz deploy **só dos apps
  afetados** pelo push. Push na `develop` vai para o ambiente develop; merge na
  `main` vai para prod.
- **Roteamento:** no repo de infra, todos os fronts dividem o `ingress.host` do
  ambiente, e cada mfe tem `ingress.path` igual ao seu `basePath`. Não faça
  strip do prefixo no Ingress: o app espera recebê-lo.

Localmente, o Nx também detecta os projetos afetados:

```sh
npx nx affected -t build
```

## Solução de problemas

| Sintoma | Causa provável |
| --- | --- |
| `/<mfe>` retorna 404 no `pnpm dev` | O mfe não está no ar, falta a linha na lista do `next.config.js` do shell, ou a porta diverge |
| `/<mfe>` retorna 404 no cluster | Falta o app em `projects/wlstore/apps/`, ou `ingress.path` ≠ `basePath` |
| Página do microfrontend sem CSS/JS | O `basePath` diverge do prefixo da rota (`ingress.path` ou rewrite) |
| `EADDRINUSE` ao subir | Dois projetos com a mesma porta em `project.json` |
| Aviso de cross-origin em dev | Falta `allowedDevOrigins: ['localhost:3000']` no config do microfrontend |
| `The workspace is out of sync` | Rode `npx nx sync` |
| Link entre microfrontends recarrega errado | Uso de `next/link` no lugar de `<a>` para rota de outro app |

## Saiba mais

- [Next.js — Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones)
- [Next.js — basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath)
- [Next.js — rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)
- [Nx — Next.js](https://nx.dev/docs/technologies/react/next)
- [Nx — affected](https://nx.dev/ci/features/affected)
