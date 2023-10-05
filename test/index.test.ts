import random from '@utils/random';

describe('test example', () => {
    it('should return a string', async () => {
        const res = random();

        expect(typeof res).toBe('string');
    });
});