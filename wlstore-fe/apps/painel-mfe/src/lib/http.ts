import { createHttpClient, resolveBaseUrl } from '@wlstore/http';

// Tenant fixo enquanto não existe login; depois vem da sessão.
const DEV_TENANT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

export const pricingHttp = createHttpClient({
  baseUrl: resolveBaseUrl({
    server: process.env.PRICING_API_URL,
    browser: process.env.NEXT_PUBLIC_PRICING_API_URL,
    fallback: 'http://localhost:8082',
  }),
  getHeaders: () => ({ 'X-Tenant-Id': process.env.TENANT_ID ?? DEV_TENANT_ID }),
});
