//@ts-check

const path = require('node:path');

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },

  // Todas as rotas e assets deste microfrontend vivem sob /pricing. No cluster
  // o Ingress manda /pricing/* para este app (mesmo valor em ingress.path no
  // repo de infra); em dev local quem faz isso é o rewrite do shell.
  basePath: '/pricing',

  // Permite que o Next seja servido através do proxy do shell em
  // desenvolvimento (origens diferentes: localhost:3000 -> localhost:4300).
  allowedDevOrigins: ['localhost:3000', '127.0.0.1:3000'],
};

module.exports = nextConfig;
