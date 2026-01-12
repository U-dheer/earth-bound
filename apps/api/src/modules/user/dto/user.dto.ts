import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User unique identifier (UUID)',
  })
  id: string;

  @ApiProperty({
    required: true,
    example: 100,
    description: 'User redeem points',
  })
  redeemPoints: number;

  @ApiProperty({
    required: true,
    example: '1234567890',
    description: 'User account number',
  })
  accountNumber: string;
}

export class UpdateUserDto {
  id?: string;

  @ApiProperty({ required: false })
  radeemPoint?: number;

  @ApiProperty({ required: false })
  accountNumber?: string;
}
