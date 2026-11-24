/**
 * Gera public/renders/*.webp a partir dos modelos 3D (mesmo código do site).
 * Uso: npm run build && npm run render:products
 */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const port = 4179;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1700, height: 1000 } });
  page.on('console', (m) => m.type() === 'error' && console.error('[studio]', m.text()));
  await page.goto(`http://localhost:${port}/studio.html`);
  await page.waitForFunction(() => window.__DONE__ === true, null, { timeout: 600000 });
  const err = await page.evaluate(() => window.__ERROR__);
  if (err) throw new Error(err);
  const renders = await page.evaluate(() => window.__RENDERS__);
  const dir = resolve('public/renders');
  mkdirSync(dir, { recursive: true });
  for (const [id, url] of Object.entries(renders)) {
    writeFileSync(resolve(dir, `${id}.webp`), Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log(`✔ ${Object.keys(renders).length} renders salvos em public/renders`);
} finally {
  await browser.close();
  server.kill();
}
