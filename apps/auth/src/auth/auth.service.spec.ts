const { Test, TestingModule } = require('@nestjs/testing');
const { AuthService } = require('./auth.service');

describe('AuthService', () => {
	let service;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AuthService],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});