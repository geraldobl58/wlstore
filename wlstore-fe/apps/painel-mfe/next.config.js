//@ts-check

const path = require('node:path');

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },

  // Pacotes do workspace exportam TypeScript puro (sem build); o Next compila.
  transpilePackages: ['@wlstore/http', '@wlstore/ui'],

  // Todas as rotas e assets do painel do lojista vivem sob /painel. No cluster
  // o Ingress manda /painel/* para este app (mesmo valor em ingress.path no
  // repo de infra); em dev local quem faz isso é o rewrite da vitrine.
  basePath: '/painel',

  // Permite que o Next seja servido através do proxy da vitrine em
  // desenvolvimento (origens diferentes: localhost:3000 -> localhost:4300).
  allowedDevOrigins: ['localhost:3000', '127.0.0.1:3000'],
};

module.exports = nextConfig;
