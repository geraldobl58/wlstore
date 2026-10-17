//@ts-check

const path = require('node:path');

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },

  // Garante que todas as rotas e assets deste microfrontend vivam sob /blog.
  // É isso que permite ao shell fazer o proxy sem colisão de rotas.
  basePath: '/blog',

  // Permite que o Next seja servido através do proxy do shell em
  // desenvolvimento (origens diferentes: localhost:3000 -> localhost:4200).
  allowedDevOrigins: ['localhost:3000', '127.0.0.1:3000'],

  // Opcional: caso utilize assets estáticos separados ou CDN dedicada.
  // assetPrefix: process.env.BLOG_ASSET_PREFIX,
};

module.exports = nextConfig;
