//@ts-check

const path = require('node:path');

/**
 * URL do microfrontend `blog`.
 * - Em desenvolvimento aponta para a porta local do app blog (4200).
 * - Em produção defina BLOG_URL com a URL interna/externa do serviço deployado.
 */
const BLOG_URL = process.env.BLOG_URL || 'http://localhost:4200';

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  // O monorepo tem mais de um lockfile; fixamos a raiz para o Turbopack não
  // inferir o diretório errado.
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },

  // O shell é o host: ele encaminha (proxy) as rotas /blog para o microfrontend.
  // Como o app blog usa basePath '/blog', seus assets (/blog/_next/*) já caem
  // no rewrite de :path* abaixo.
  async rewrites() {
    return [
      {
        source: '/blog',
        destination: `${BLOG_URL}/blog`,
      },
      {
        source: '/blog/:path*',
        destination: `${BLOG_URL}/blog/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
