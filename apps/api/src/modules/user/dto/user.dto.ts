export class CreateUserDto {
  id: string;

  redeemPoints: number;

  accountNumber: string;

  name: string;

  email: string;
}

// export class UpdateUserDto {
//   id?: string;

//   @ApiProperty({ required: false })
//   radeemPoint?: number;

//   @ApiProperty({ required: false })
//   accountNumber?: string;
// }
