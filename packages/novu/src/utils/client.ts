import { Novu } from '@novu/api';

const NOVU_SECRET_KEY = process.env['NOVU_SECRET_KEY'];

if (!NOVU_SECRET_KEY) {
  throw new Error('NOVU_SECRET_KEY is not set');
}

export const novu = new Novu({
  secretKey: `ApiKey ${NOVU_SECRET_KEY}`,
});
