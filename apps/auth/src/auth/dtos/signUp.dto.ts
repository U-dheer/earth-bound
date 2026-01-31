export class CreateUserDto {
  // ID Fields
  id: string;

  // Name & Description
  name: string;
  description?: string;

  // Contact Information
  email: string;
  phone_number?: string;

  // Financial Fields
  accountNumber: string;
  mainAccountNumber?: string; // ⚠️ CONFLICT: Duplicate account field (unclear distinction between accountNumber and mainAccountNumber)

  // User/Points Fields
  redeemPoints: number;

  // Business Fields
  address?: string;
  city?: string;

  // Role Field
  role: string;

  // Security Fields
  password: string;
  passwordConfirm: string;
}
