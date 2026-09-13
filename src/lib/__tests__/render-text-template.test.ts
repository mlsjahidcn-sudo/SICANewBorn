import { describe, it, expect } from 'vitest';
import { renderTextTemplate } from '@/lib/email';

describe('renderTextTemplate', () => {
  it('substitutes a simple {{var}} placeholder', () => {
    expect(renderTextTemplate('Hi {{name}}!', { name: 'Sara' })).toBe('Hi Sara!');
  });

  it('substitutes multiple placeholders in order', () => {
    expect(
      renderTextTemplate('{{greeting}} {{firstName}}, your code is {{code}}.', {
        greeting: 'Hello',
        firstName: 'Sara',
        code: 'A42',
      }),
    ).toBe('Hello Sara, your code is A42.');
  });

  it('treats {{{var}}} the same as {{var}} (no escape needed in text)', () => {
    expect(renderTextTemplate('Hello {{{name}}}', { name: '<b>Sara</b>' })).toBe(
      'Hello <b>Sara</b>',
    );
  });

  it('renders missing variables as [varName] (no silent blanks)', () => {
    expect(renderTextTemplate('Hi {{name}}, your code is {{code}}.', { name: 'Sara' })).toBe(
      'Hi Sara, your code is [code].',
    );
  });

  it('renders empty-string variables as [varName] (treats them as missing)', () => {
    expect(renderTextTemplate('Hi {{name}}', { name: '' })).toBe('Hi [name]');
  });

  it('supports unicode and emoji values', () => {
    expect(renderTextTemplate('Welcome {{name}} 🎉', { name: '你好' })).toBe(
      'Welcome 你好 🎉',
    );
  });

  it('does NOT interpret old macro syntax (drops it as literal text)', () => {
    // The new renderer does not understand $IF_X$/$ELSE$/$ENDIF$, $ESC$var$,
    // $GREET$, $FACTS$, $CTA$. The migration cleans the seeded body_text to
    // remove these. If any leak through, they render literally.
    expect(renderTextTemplate('$IF_X$truthy$ELSE$falsy$ENDIF$', { X: 'yes' })).toBe(
      '$IF_X$truthy$ELSE$falsy$ENDIF$',
    );
  });
});