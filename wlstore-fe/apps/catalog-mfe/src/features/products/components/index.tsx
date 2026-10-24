import { ApiError } from '@wlstore/http';
import { listProducts } from '../api';

// Server Component: a chamada sai do servidor do mfe, então não depende de CORS
// no catalog-service nem expõe a URL interna do serviço ao navegador.
export const Products = async ({ categorySlug, brand }: { categorySlug?: string; brand?: string }) => {
  try {
    const { data } = await listProducts({ categorySlug, brand, status: 'ACTIVE' });
    return (
      <ul>
        {data.map((product) => (
          <li key={product.id}>
            {product.title} — {product.brand}
          </li>
        ))}
      </ul>
    );
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Erro inesperado.';
    return <p>Não foi possível carregar os produtos: {message}</p>;
  }
};
