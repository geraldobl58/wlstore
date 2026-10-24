import ky, { HTTPError } from 'ky';
import type { KyInstance } from 'ky';

export type HttpClient = KyInstance;

export interface HttpClientOptions {
  /** URL base do serviço (ex.: http://localhost:8081). Cada mfe passa a sua. */
  baseUrl: string;
  /**
   * Headers recalculados a cada requisição (tenant, token…). Função, e não
   * objeto, para que o valor seja lido na hora da chamada.
   */
  getHeaders?: () => Record<string, string | undefined>;
  timeout?: number;
}

export interface ResolveBaseUrlOptions {
  /** Usada quando o código roda no servidor (Server Components, Route Handlers). */
  server?: string;
  /** Usada no navegador. Precisa ser `NEXT_PUBLIC_*` para chegar ao bundle. */
  browser?: string;
  fallback: string;
}

/**
 * No servidor o Next enxerga qualquer env; no navegador só as `NEXT_PUBLIC_*`.
 * Por isso o mfe informa as duas e a escolha acontece aqui.
 */
export function resolveBaseUrl({ server, browser, fallback }: ResolveBaseUrlOptions): string {
  const isServer = typeof window === 'undefined';
  return (isServer ? server ?? browser : browser) ?? fallback;
}

/**
 * Erro único para qualquer falha de chamada. Os serviços Java respondem com
 * `ProblemDetail` (`detail`, `errors`), que é o que chega na UI.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    /** 0 = falha de rede (serviço fora do ar, DNS, timeout). */
    readonly status: number,
    /** Erros de validação por campo (400 do `@Valid`). */
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ProblemDetail {
  title?: string;
  detail?: string;
  errors?: Record<string, string>;
}

export function createHttpClient({ baseUrl, getHeaders, timeout = 15_000 }: HttpClientOptions): HttpClient {
  return ky.create({
    prefix: baseUrl,
    timeout,
    retry: 0,
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    hooks: {
      beforeRequest: [
        ({ request }) => {
          for (const [name, value] of Object.entries(getHeaders?.() ?? {})) {
            if (value) request.headers.set(name, value);
          }
        },
      ],
      beforeError: [
        ({ error }) => {
          // Sem `response` = falha de rede. A mensagem crua do ky carrega a URL
          // interna do serviço, que não deve aparecer na tela.
          if (!(error instanceof HTTPError)) {
            return new ApiError('Não foi possível falar com o servidor. Tente de novo.', 0);
          }

          // No ky v2 o corpo já chega pré-parsed em `error.data`.
          const body = error.data as ProblemDetail | undefined;
          return new ApiError(
            body?.detail ?? body?.title ?? error.message,
            error.response.status,
            body?.errors,
          );
        },
      ],
    },
  });
}
