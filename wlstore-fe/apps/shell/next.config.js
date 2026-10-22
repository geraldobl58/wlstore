//@ts-check

const path = require('node:path');

/**
 * Microfrontends que o shell encaminha em DESENVOLVIMENTO LOCAL.
 *
 * No cluster, shell e microfrontends dividem o mesmo host e quem roteia cada
 * basePath para o seu app é o Ingress (Next.js Multi-Zones). Por isso o build
 * de produção NÃO tem rewrites: o shell não precisa conhecer os mfes e não é
 * rebuildado quando uma equipe publica um mfe novo.
 *
 * - `nx dev` (NODE_ENV=development): proxy para a porta local de cada mfe.
 * - Build de produção: sem rewrites, a não ser que a variável `env` do mfe
 *   seja informada (ex.: CATALOG_URL=http://catalog-mfe:4200).
 *
 * `basePath` e `port` precisam bater com o next.config.js e o project.json de
 * cada app (e com o registro em packages/ui/src/lib/registry.ts).
 */
const MICROFRONTENDS = [
  { basePath: '/catalog', env: 'CATALOG_URL', port: 4200 },
  { basePath: '/pricing', env: 'PRICING_URL', port: 4300 },
];

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

  // Em dev local o shell faz o papel do Ingress: encaminha cada basePath para o
  // seu microfrontend. Como cada mfe usa o próprio basePath, os assets
  // (/<basePath>/_next/*) já caem no rewrite de :path*.
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
