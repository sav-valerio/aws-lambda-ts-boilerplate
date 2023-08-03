import success from '@utils/success';

describe('test example endpoint', () => {
    it('should return a 200 status code', async () => {
        const res = await success();

        expect(res.statusCode).toBe(200);
    });
});