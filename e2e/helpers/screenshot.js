import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.resolve(__dirname, '../../docs/screenshots');

export async function shot(page, name) {
  if (!/^step\d+-[a-z]$/.test(name)) {
    throw new Error(
      `Screenshot name "${name}" must match stepN-<letter>, e.g. step1-a or step10-c`,
    );
  }
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${name}.png`),
    fullPage: false,
  });
}
