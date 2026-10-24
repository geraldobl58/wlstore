import { createHttpClient, resolveBaseUrl } from '@wlstore/http';

// Tenant fixo enquanto não existe login; depois vem da sessão.
const DEV_TENANT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

export const catalogHttp = createHttpClient({
  baseUrl: resolveBaseUrl({
    server: process.env.CATALOG_API_URL,
    browser: process.env.NEXT_PUBLIC_CATALOG_API_URL,
    fallback: 'http://localhost:8081',
  }),
  getHeaders: () => ({ 'X-Tenant-Id': process.env.TENANT_ID ?? DEV_TENANT_ID }),
});
