#!/usr/bin/env node

import { startServer } from './server.js';

const secretKey = process.env.MONEROO_SECRET_KEY;

if (!secretKey) {
  process.stderr.write(
    'Error: MONEROO_SECRET_KEY environment variable is required.\n' +
      'Get your secret key from https://app.moneroo.io/ → Developers → API Keys\n',
  );
  process.exit(1);
}

startServer(secretKey).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Fatal: ${message}\n`);
  process.exit(1);
});
