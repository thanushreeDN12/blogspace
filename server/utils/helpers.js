import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// wraps async route handlers so errors reach the error middleware
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// deletes a stored upload like "/uploads/abc.png"
export function removeFile(p) {
  if (!p) return;
  const file = path.join(__dirname, '..', p);
  fs.unlink(file, () => {});
}
