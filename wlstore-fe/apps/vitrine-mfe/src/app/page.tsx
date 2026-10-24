import { ProductShelf } from '../features/products/components/ProductShelf';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

// ?q= vem da busca do cabeçalho; ?categoria= e ?marca=, do menu de
// categorias. Sem nenhum deles, a home abre com a vitrine de novidades.
const HomePage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;
  const title = first(params.q)?.trim() || undefined;
  const categorySlug = first(params.categoria);
  const brand = first(params.marca);

  if (title || categorySlug || brand) {
    return (
      <main>
        <ProductShelf
          title={title ? `Resultados para “${title}”` : (brand ?? 'Produtos')}
          layout="grid"
          query={{ title, categorySlug, brand, size: 24 }}
        />
      </main>
    );
  }

  return (
    <main>
      <ProductShelf
        eyebrow="Acabou de chegar"
        title="Novidades"
        query={{ sort: 'createdAt,desc', size: 12 }}
      />
    </main>
  );
};

export default HomePage;
