const { createAdmin } = require('./create-admin.usecase');

describe('createAdmin', () => {
    it('should create an admin successfully', () => {
        const adminData = { name: 'Admin', email: 'admin@example.com' };
        const result = createAdmin(adminData);
        expect(result).toEqual(expect.objectContaining(adminData));
    });
});