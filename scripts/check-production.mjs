import assert from 'node:assert/strict';
import { build } from 'esbuild';

const result = await build({
  entryPoints: ['lib/production/model.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});
const model = await import(
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
);
const first = model.emptyData();
const second = model.emptyData();
first.tasks.push({ id: 'one', title: 'Task' });
assert.equal(second.tasks.length, 0, 'new projects must not share arrays');
assert.equal(model.demo.data.scenes.length, 3);
assert.ok(
  model.demo.data.shots.every((shot) =>
    model.demo.data.scenes.some((scene) => scene.id === shot.scene),
  ),
);
const scenes = model.parseScenes(
  'Title: Test\r\n\r\nINT. ROOM - NIGHT\r\n\r\nA quiet room.\r\n\r\nEXT. BEACH - DAY\r\n\r\nWaves.',
);
assert.equal(scenes.length, 2);
assert.equal(scenes[0].time, 'Night');
assert.equal(scenes[1].location, 'BEACH');
assert.ok(scenes[0].synopsis.includes('A quiet room.'));
assert.notEqual(scenes[0].id, scenes[1].id);
assert.equal(model.parseScenes('No scene headings here').length, 0);
assert.equal(model.safeUrl('javascript:alert(1)'), '');
assert.equal(model.safeUrl('data:text/html,hello'), '');
assert.equal(
  model.safeUrl('https://example.com/reference'),
  'https://example.com/reference',
);
const csv = model.csv([
  { id: 'r1', title: '=SUM(1,2)', notes: 'Line one\n"Line two"' },
]);
assert.ok(
  csv.includes('"\'=SUM(1,2)"'),
  'CSV formula payloads must be escaped',
);
assert.ok(csv.includes('""Line two""'), 'CSV quotes must be escaped');
console.log(
  'PASS independent project state, sample references, script parsing, safe URLs, CSV escaping',
);

const origin = process.env.PRODUCTION_TEST_ORIGIN ?? 'http://localhost:3010';
let serverReachable = false;
try {
  await fetch(origin, { signal: AbortSignal.timeout(2000) });
  serverReachable = true;
} catch {
  console.log(
    `INFO: Server at ${origin} is not running. Skipped live HTTP route checks.`,
  );
}

if (serverReachable) {
  for (const route of [
    '/production',
    '/production?project=demo&tab=overview',
    '/production?project=demo&tab=shots',
  ]) {
    const response = await fetch(origin + route, {
      signal: AbortSignal.timeout(30000),
    });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes('Production Suite'));
    assert.ok(
      !html.includes('Không gian quản lý sản xuất đang được hoàn thiện'),
      'real suite must replace the placeholder',
    );
  }
  console.log('PASS Production Suite route and deep-link responses');
}
