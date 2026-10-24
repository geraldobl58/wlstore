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
  transpilePackages: ['@wlstore/http', '@wlstore/ui', '@wlstore/catalog'],

  // Todas as rotas e assets deste microfrontend vivem sob /catalog. No cluster
  // o Ingress manda /catalog/* para este app (mesmo valor em ingress.path no
  // repo de infra); em dev local quem faz isso é o rewrite do shell.
  basePath: '/catalog',

  // Permite que o Next seja servido através do proxy do shell em
  // desenvolvimento (origens diferentes: localhost:3000 -> localhost:4200).
  allowedDevOrigins: ['localhost:3000', '127.0.0.1:3000'],
};

module.exports = nextConfig;
