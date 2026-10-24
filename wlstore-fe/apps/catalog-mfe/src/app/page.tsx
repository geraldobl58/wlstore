import { Products } from '../features/products/components';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

// ?categoria= e ?marca= chegam dos links do menu de categorias.
const CatalogPage = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const params = await searchParams;
  return (
    <>
      <Products
        categorySlug={first(params.categoria)}
        brand={first(params.marca)}
      />
    </>
  );
};

export default CatalogPage;
