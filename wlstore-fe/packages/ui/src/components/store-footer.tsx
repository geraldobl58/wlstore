export interface StoreFooterLink {
  label: string;
  href: string;
}

export interface StoreFooterColumn {
  title: string;
  links: StoreFooterLink[];
}

export interface StoreFooterProps {
  storeName: string;
  columns?: StoreFooterColumn[];
  /** Ano do copyright. Padrão: ano atual. */
  year?: number;
}

/** Rodapé da loja, igual em todos os apps. Os links são <a> (podem cruzar apps). */
export function StoreFooter({ storeName, columns = [], year = new Date().getFullYear() }: StoreFooterProps) {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
        {columns.length > 0 && (
          <nav aria-label="Rodapé" className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <p className="text-xs font-semibold tracking-wider text-text-2 uppercase">{column.title}</p>
                <ul className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="text-sm text-text transition-colors duration-120 hover:text-link">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}
        <p className="text-sm text-text-2">
          © {year} {storeName}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
