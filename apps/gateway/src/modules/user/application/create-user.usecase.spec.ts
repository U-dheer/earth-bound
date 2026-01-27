const { createUser } = require('./create-user.usecase');

describe('createUser', () => {
    test('should create a user successfully', () => {
        const input = { name: 'John Doe', email: 'john@example.com' };
        const result = createUser(input);
        expect(result).toEqual({ id: expect.any(String), ...input });
    });

    test('should throw an error if email is missing', () => {
        const input = { name: 'John Doe' };
        expect(() => createUser(input)).toThrow('Email is required');
    });
});