import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  id: string;

  redeemPoints: number;

  accountNumber: string;

  redee_points?: number;
}

// export class UpdateUserDto {
//   id?: string;

//   @ApiProperty({ required: false })
//   radeemPoint?: number;

//   @ApiProperty({ required: false })
//   accountNumber?: string;
// }
