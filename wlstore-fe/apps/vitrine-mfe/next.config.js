//@ts-check

const path = require('node:path');

/**
 * A vitrine é o app padrão: atende `/` e tudo que nenhum outro microfrontend
 * reivindica. Os outros apps vivem sob o próprio basePath.
 *
 * No cluster quem roteia cada basePath para o seu app é o Ingress (Next.js
 * Multi-Zones). Por isso o build de produção NÃO tem rewrites: a vitrine não
 * conhece os outros apps e não é rebuildada quando eles publicam versão nova.
 *
 * - `nx dev` (NODE_ENV=development): proxy para a porta local de cada app,
 *   para tudo funcionar em localhost:3000 como no cluster.
 * - Build de produção: sem rewrites, a não ser que a variável `env` do app
 *   seja informada (ex.: PAINEL_URL=http://painel-mfe:4300).
 *
 * `basePath` e `port` precisam bater com o next.config.js e o project.json de
 * cada app (e com o ingress.path no repo de infra).
 */
const MICROFRONTENDS = [{ basePath: '/painel', env: 'PAINEL_URL', port: 4300 }];

const isProduction = process.env.NODE_ENV === 'production';

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  // O monorepo tem mais de um lockfile; fixamos a raiz para o Turbopack não
  // inferir o diretório errado.
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },

  // Pacotes do workspace exportam TypeScript puro (sem build); o Next compila.
  transpilePackages: ['@wlstore/http', '@wlstore/ui'],

  // Como cada app usa o próprio basePath, os assets (/<basePath>/_next/*) já
  // caem no rewrite de :path*.
  async rewrites() {
    return MICROFRONTENDS.flatMap(({ basePath, env, port }) => {
      const url = process.env[env] || (isProduction ? undefined : `http://localhost:${port}`);
      if (!url) return [];
      return [
        { source: basePath, destination: `${url}${basePath}` },
        { source: `${basePath}/:path*`, destination: `${url}${basePath}/:path*` },
      ];
    });
  },
};

module.exports = nextConfig;
