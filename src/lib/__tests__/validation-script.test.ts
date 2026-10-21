// @vitest-environment node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');
const commands = ['run ts-check', 'run lint:build', 'run i18n:check', 'run i18n:missing', 'test'];

function runValidation(failingCommand = ''): { status: number | null; commands: string[] } {
  const directory = mkdtempSync(join(tmpdir(), 'sica-validation-'));
  try {
    const log = join(directory, 'calls');
    writeFileSync(join(directory, 'npm'), '#!/bin/sh\nprintf "%s\\n" "$*" >> "$VALIDATION_CALL_LOG"\nif [ "$*" = "$VALIDATION_FAIL_COMMAND" ]; then exit 23; fi\n', { mode: 0o755 });
    const result = spawnSync('bash', ['scripts/validate.sh'], {
      cwd: root,
      env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, COZE_WORKSPACE_PATH: root, VALIDATION_CALL_LOG: log, VALIDATION_FAIL_COMMAND: failingCommand },
      encoding: 'utf8',
    });
    return { status: result.status, commands: readFileSync(log, 'utf8').trim().split('\n') };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe('validation exit status', () => {
  it('runs all required checks when they pass', () => {
    expect(runValidation()).toEqual({ status: 0, commands });
  });

  it.each(commands)('fails and stops when %s fails', (command) => {
    const result = runValidation(command);
    expect(result.status).toBe(23);
    expect(result.commands).toEqual(commands.slice(0, commands.indexOf(command) + 1));
  });
});
