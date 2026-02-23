import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDefaultRuleset } from './create-default-ruleset';

describe('createDefaultRuleset', () => {
    it('should create a default ruleset with current timestamp', () => {
        const now = 1234567890;
        vi.useFakeTimers();
        vi.setSystemTime(now);

        const ruleset = createDefaultRuleset();

        expect(ruleset).toEqual({
            createdAt: now,
            isDomainWide: false,
            pages: [],
        });

        vi.useRealTimers();
    });
});
