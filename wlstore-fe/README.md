# MyWorkspace — Microfrontends com Next.js + Nx

Monorepo [Nx](https://nx.dev) com arquitetura de **microfrontends** em Next.js.
Cada microfrontend é uma aplicação Next independente (build, deploy e runtime
próprios), unificada em um único domínio pelo app **shell**, que atua como host
e faz proxy das rotas via `rewrites`.

## Arquitetura

```
                    navegador
                        │
                        ▼
        ┌───────────────────────────────┐
        │   shell  ·  :3000  ·  host    │
        │   rewrites: /blog/:path*      │
        └───────────────┬───────────────┘
                        │ proxy
                        ▼
        ┌───────────────────────────────┐
        │   blog  ·  :4200              │
        │   basePath: /blog             │
        └───────────────────────────────┘

        packages/ui  ← compartilhado por todos
```

O usuário enxerga **um único domínio** (`localhost:3000`). O shell encaminha
tudo sob `/blog` para o app `blog`, incluindo páginas, assets (`/blog/_next/*`)
e rotas de API (`/blog/api/*`).

### Projetos

| Projeto | Caminho | Porta | `basePath` | Papel |
| --- | --- | --- | --- | --- |
| `shell` | `apps/shell` | 3000 | `/` | Host — proxy e layout raiz |
| `blog` | `apps/blog` | 4200 | `/blog` | Microfrontend |
| `ui` | `packages/ui` | — | — | Lib compartilhada (`@my-workspace/ui`) |

### Decisões de projeto

- **`basePath` por microfrontend.** Cada app remoto serve tudo sob o seu próprio
  prefixo. Isso evita colisão de rotas e faz os assets do Next (`/blog/_next/*`)
  já caírem no mesmo rewrite das páginas — sem regra extra de proxy.
- **Portas fixas.** Definidas em `project.json` de cada app, para que o destino
  do proxy do shell seja estável.
- **Navegação entre microfrontends usa `<a>`, não `next/link`.** Cada app é um
  runtime Next separado; a navegação entre eles é uma navegação de documento
  completa. `next/link` faria client-side routing para uma rota que não existe
  no app atual.
- **Isolamento de runtime.** Um microfrontend que cai derruba apenas a sua
  própria rota; o resto do site continua no ar.

## Pré-requisitos

- Node.js 20+
- [pnpm](https://pnpm.io) 10+ (`corepack enable`)

## Começando

```sh
pnpm install
pnpm dev
```

Acesse:

- <http://localhost:3000> — shell
- <http://localhost:3000/blog> — blog **servido através do shell** (caminho real de uso)
- <http://localhost:4200/blog> — blog isolado (útil para depurar)

> `pnpm dev` roda `nx run shell:dev`, que via `dependsOn` sobe automaticamente o
> microfrontend `blog` junto. Não é preciso abrir dois terminais.

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

Para um projeto específico: `npx nx <target> <projeto>` (ex.: `npx nx build blog`).

## Variáveis de ambiente

O shell descobre cada microfrontend por variável de ambiente, com fallback para
a porta local de desenvolvimento:

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `BLOG_URL` | `http://localhost:4200` | URL base do microfrontend `blog` |

Em produção, aponte cada variável para a URL interna ou pública do serviço
correspondente:

```sh
BLOG_URL=https://blog.internal.suaempresa.com pnpm start
```

## Código compartilhado

`packages/ui` (`@my-workspace/ui`) é consumido por todos os apps — o Next
transpila a lib direto do source, sem passo de build separado.

```tsx
import { MicrofrontendNav, MICROFRONTENDS } from '@my-workspace/ui';
```

O registro em [`packages/ui/src/lib/registry.ts`](packages/ui/src/lib/registry.ts)
é a **única** fonte de verdade sobre quais microfrontends existem. A barra de
navegação é gerada a partir dele, então um app novo aparece na navegação de
todos os outros automaticamente.

---

## Como criar um novo microfrontend

O exemplo abaixo cria um microfrontend chamado **`shop`**, servido em `/shop`,
na porta **4300**. Troque o nome, o caminho e a porta conforme o seu caso.

> **Convenção de portas:** shell `3000`, e cada microfrontend a partir de `4200`
> (`blog` 4200, `shop` 4300, o próximo 4400…). Duas portas iguais fazem o
> segundo app falhar ao subir.

### 1. Gere a aplicação

```sh
npx nx g @nx/next:app apps/shop --style=none --linter=eslint --e2eTestRunner=none
```

### 2. Configure o `basePath` e a porta

**`apps/shop/next.config.js`** — todo o app precisa viver sob `/shop`:

```js
//@ts-check

const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },

  basePath: '/shop',

  allowedDevOrigins: ['localhost:3000', '127.0.0.1:3000'],
};

module.exports = nextConfig;
```

**`apps/shop/project.json`** — fixe a porta nos targets:

```json
{
  "targets": {
    "dev": { "options": { "command": "next dev --port 4300" } },
    "start": { "options": { "command": "next start --port 4300" } },
    "serve-static": { "options": { "command": "next start --port 4300" } }
  }
}
```

### 3. Registre a rota no shell

Em **`apps/shell/next.config.js`**, adicione a URL e o par de rewrites:

```js
const SHOP_URL = process.env.SHOP_URL || 'http://localhost:4300';

async rewrites() {
  return [
    // …rewrites existentes
    { source: '/shop', destination: `${SHOP_URL}/shop` },
    { source: '/shop/:path*', destination: `${SHOP_URL}/shop/:path*` },
  ];
}
```

Os **dois** rewrites são necessários: `/shop` (a raiz exata) e `/shop/:path*`
(tudo abaixo dela, incluindo `/shop/_next/*` e `/shop/api/*`).

### 4. Suba o app junto com o shell

Em **`apps/shell/project.json`**, inclua o novo projeto no `dependsOn` do `dev`:

```json
"dev": {
  "options": { "command": "next dev --port 3000" },
  "dependsOn": [
    { "projects": ["blog", "shop"], "target": "dev" }
  ]
}
```

### 5. Adicione ao registro compartilhado

Em **`packages/ui/src/lib/registry.ts`**:

```ts
export const MICROFRONTENDS = [
  { key: 'shell', label: 'Home', basePath: '/' },
  { key: 'blog', label: 'Blog', basePath: '/blog' },
  { key: 'shop', label: 'Loja', basePath: '/shop' },
] as const;
```

O `basePath` aqui deve ser **idêntico** ao do `next.config.js` do app.

### 6. Use o layout compartilhado

Em **`apps/shop/src/app/layout.tsx`**:

```tsx
import { MicrofrontendNav } from '@my-workspace/ui';
import './global.css';

export const metadata = {
  title: 'Shop | my-workspace',
  description: 'Microfrontend de loja',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <MicrofrontendNav active="shop" />
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
pnpm build
pnpm dev
```

Confirme que <http://localhost:3000/shop> responde **através do shell** (não só
em `localhost:4300`) e que a navegação alterna entre os microfrontends.

### Checklist

- [ ] App gerado em `apps/<nome>`
- [ ] `basePath: '/<nome>'` no `next.config.js`
- [ ] Porta única fixada nos targets do `project.json`
- [ ] Par de rewrites (`/<nome>` e `/<nome>/:path*`) no shell
- [ ] `dependsOn` do `shell:dev` atualizado
- [ ] Entrada nova em `MICROFRONTENDS`
- [ ] `<MicrofrontendNav active="<nome>" />` no layout
- [ ] `npx nx sync` executado e `pnpm build` passando
- [ ] Variável `<NOME>_URL` documentada e configurada no deploy

---

## Deploy

Cada microfrontend é deployado como um serviço Next independente. Depois:

1. Aponte as variáveis `*_URL` do shell para as URLs dos serviços.
2. Exponha publicamente **apenas o shell** — os microfrontends podem ficar em
   rede interna, já que todo o tráfego passa pelo proxy.
3. Garanta que cada serviço mantenha o seu `basePath` (não faça strip do prefixo
   no load balancer; o app espera recebê-lo).

Como o Nx faz cache e detecta projetos afetados, o CI pode buildar e deployar
somente o que mudou:

```sh
npx nx affected -t build
```

## Solução de problemas

| Sintoma | Causa provável |
| --- | --- |
| `/blog` retorna 404 no shell | O app `blog` não está no ar, ou `BLOG_URL` aponta para o lugar errado |
| Página do microfrontend sem CSS/JS | Falta o rewrite `/<nome>/:path*`, ou o `basePath` diverge do prefixo da rota |
| `EADDRINUSE` ao subir | Dois projetos com a mesma porta em `project.json` |
| Aviso de cross-origin em dev | Falta `allowedDevOrigins: ['localhost:3000']` no config do microfrontend |
| `The workspace is out of sync` | Rode `npx nx sync` |
| Link entre microfrontends recarrega errado | Uso de `next/link` no lugar de `<a>` para rota de outro app |

## Saiba mais

- [Nx — Next.js](https://nx.dev/docs/technologies/react/next)
- [Next.js — rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)
- [Next.js — basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath)
- [Nx — affected](https://nx.dev/ci/features/affected)
