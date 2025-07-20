import { Novu } from '@novu/api';

const NOVU_SECRET_KEY =
  process.env['NOVU_SECRET_KEY'] || '7a795c99b9b2a2739ca065a29dac7195';

if (!NOVU_SECRET_KEY) {
  throw new Error('NOVU_SECRET_KEY is not set');
}

export const novu = new Novu({
  secretKey: `ApiKey ${NOVU_SECRET_KEY}`,
});
