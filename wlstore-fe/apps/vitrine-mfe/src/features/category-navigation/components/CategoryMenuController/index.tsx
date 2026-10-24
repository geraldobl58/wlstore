'use client';

import { useCategoryMenuState } from '../../hooks/use-category-menu-state';
import { useGetCategoryNavigation } from '../../hooks/use-get-category-navigation';
import { CategoryBar } from '../CategoryBar';
import { CategoryPanel } from '../CategoryPanel';

export function CategoryMenuController() {
  const { categories, highlights, isLoading, error, refetch } = useGetCategoryNavigation();
  const menu = useCategoryMenuState();

  const active = categories.find((category) => category.slug === menu.activeSlug) ?? categories[0];

  return (
    <div className="relative z-40 border-b bg-card" onMouseLeave={menu.close}>
      <CategoryBar
        highlights={highlights}
        open={menu.open}
        panelId={menu.panelId}
        triggerRef={menu.triggerRef}
        onToggle={menu.toggle}
      />
      <CategoryPanel
        id={menu.panelId}
        open={menu.open}
        categories={categories}
        active={active}
        isLoading={isLoading}
        errorMessage={error ? 'Não foi possível carregar as categorias.' : undefined}
        onRetry={() => refetch()}
        onActivate={menu.setActiveSlug}
      />
    </div>
  );
}
