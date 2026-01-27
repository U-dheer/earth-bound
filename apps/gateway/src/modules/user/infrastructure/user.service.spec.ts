const { UserService } = require('./user.service');

describe('UserService', () => {
    let userService;

    beforeEach(() => {
        userService = new UserService();
    });

    test('should create a user', () => {
        const user = { name: 'John Doe', email: 'john@example.com' };
        const createdUser = userService.createUser(user);
        expect(createdUser).toEqual(expect.objectContaining(user));
    });

    test('should retrieve a user by id', () => {
        const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
        userService.createUser(user);
        const retrievedUser = userService.getUserById(1);
        expect(retrievedUser).toEqual(user);
    });
});