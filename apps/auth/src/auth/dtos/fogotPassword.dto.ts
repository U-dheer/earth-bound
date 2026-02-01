import { IsEmail, IsNotEmpty } from 'class-validator';

export class forgotPasswordDto {
  constructor(email: string) {
    this.email = email;
    console.log(`forgotPasswordDto initialized with email: ${email}`);
  }
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
