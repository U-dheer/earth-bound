const { AuthService } = require('../auth/auth.service');

describe('AuthService', () => {
    let authService;

    beforeEach(() => {
        authService = new AuthService();
    });

    test('should authenticate user successfully', () => {
        const result = authService.authenticate('testUser', 'testPassword');
        expect(result).toBe(true);
    });

    test('should fail to authenticate with wrong credentials', () => {
        const result = authService.authenticate('testUser', 'wrongPassword');
        expect(result).toBe(false);
    });
});