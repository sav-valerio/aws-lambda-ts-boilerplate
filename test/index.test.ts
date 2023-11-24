import random from '@utils/random';

import { describe, it, expect } from 'vitest';

describe('test example', () => {
    it('should return a string', async () => {
        const res = random();

        expect(typeof res).toBe('string');
    });
});