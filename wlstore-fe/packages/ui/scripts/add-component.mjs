// Wrapper do `shadcn add` para este pacote.
//
// O CLI do shadcn (4.x) gera `import { cn } from "cn"` neste monorepo em vez de
// usar o alias `utils` do components.json, e ainda instala o pacote npm `cn`,
// que não tem nada a ver. Aqui rodamos o add, trocamos o import por caminho
// relativo (exigido pelo @nx/enforce-module-boundaries dentro do próprio pacote) e
// removemos o pacote.
//
// Uso (na raiz): pnpm ui:add button dialog
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const components = process.argv.slice(2);
if (components.length === 0) {
  console.error('Informe os componentes: pnpm ui:add button dialog');
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { stdio: 'inherit', cwd: new URL('..', import.meta.url) });

run(`pnpm dlx shadcn@latest add ${components.join(' ')} --yes`);

const uiDir = new URL('../src/components/ui', import.meta.url).pathname;
for (const file of readdirSync(uiDir)) {
  const path = join(uiDir, file);
  const source = readFileSync(path, 'utf8');
  const fixed = source.replace(/from ["'](cn|@wlstore\/ui\/lib\/utils)["']/g, 'from "../../lib/utils"');
  if (fixed !== source) writeFileSync(path, fixed);
}

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
if (pkg.dependencies?.cn) run('pnpm remove cn');
