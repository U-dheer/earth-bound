const mailService = require('../services/mail.service');

describe('Mail Service', () => {
	test('should send an email successfully', async () => {
		const result = await mailService.sendEmail('test@example.com', 'Hello World');
		expect(result).toBe(true);
	});
});