#!/usr/bin/env node
'use strict';

const target = process.env.HEALTHCHECK_URL || process.env.RENDER_EXTERNAL_URL ? `${(process.env.HEALTHCHECK_URL || process.env.RENDER_EXTERNAL_URL).replace(/\/$/, '')}/api/health` : '';

async function main() {
  if (!target) {
    console.log('Health check skipped: set HEALTHCHECK_URL or RENDER_EXTERNAL_URL.');
    return;
  }
  const response = await fetch(target, { signal: AbortSignal.timeout(15000) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status !== 'ok') throw new Error(`Health endpoint failed (${response.status})`);
  console.log(`Health check passed: ai=${payload.ai || 'unknown'} uptime=${payload.uptimeSeconds || 0}s`);
}

main().catch((error) => { console.error(`Health check failed: ${error.message}`); process.exitCode = 1; });
