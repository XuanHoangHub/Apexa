import { cp, mkdir, readFile, rm, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const project = process.cwd();
const output = path.resolve(project, 'dist');
if (path.dirname(output) !== project || path.basename(output) !== 'dist') {
  throw new Error('Build staging must stay in the project dist directory');
}
await stat(path.join(project, '.open-next/worker.js'));
await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'server'), { recursive: true });
await cp(path.join(project, '.open-next'), path.join(output, 'server'), {
  recursive: true,
  filter: (source) =>
    !['assets', 'cache'].includes(
      path
        .relative(path.join(project, '.open-next'), source)
        .split(path.sep)[0],
    ),
});
await cp(path.join(project, '.open-next/assets'), path.join(output, 'client'), {
  recursive: true,
});
await writeFile(
  path.join(output, 'server/index.js'),
  "export { default } from './worker.js';\n",
);
await mkdir(path.join(output, '.openai'), { recursive: true });
await writeFile(
  path.join(output, '.openai/hosting.json'),
  await readFile('.openai/hosting.json'),
);
console.log(
  'Staged official Next.js build with OpenNext Worker adapter in dist/',
);
