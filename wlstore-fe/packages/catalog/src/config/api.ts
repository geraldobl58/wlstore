import { createHttpClient, resolveBaseUrl } from '@wlstore/http';

// Tenant fixo enquanto não existe login; depois vem da sessão.
const DEV_TENANT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

/**
 * Instância única para o catalog-service. Usada só no servidor (Server
 * Actions): em cada app que renderiza uma feature deste pacote, defina
 * CATALOG_API_URL com o endereço interno do serviço.
 */
export const api = createHttpClient({
  baseUrl: resolveBaseUrl({
    server: process.env.CATALOG_API_URL,
    fallback: 'http://localhost:8081',
  }),
  getHeaders: () => ({ 'X-Tenant-Id': process.env.TENANT_ID ?? DEV_TENANT_ID }),
});
