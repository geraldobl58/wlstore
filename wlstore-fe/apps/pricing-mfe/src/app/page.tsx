import { Badge } from '@wlstore/ui/components/ui/badge';
import { Button } from '@wlstore/ui/components/ui/button';

const PricingPage = () => {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <h1 className="text-3xl font-bold">Preços</h1>
      <div className="flex items-center gap-3">
        <Badge>Semana dos celulares</Badge>
        <Button>Definir preço</Button>
        <Button variant="outline">Ver histórico</Button>
      </div>
    </main>
  );
};

export default PricingPage;
