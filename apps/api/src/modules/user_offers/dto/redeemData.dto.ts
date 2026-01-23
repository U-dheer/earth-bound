import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class RedeemDataDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  offerId: string;
}
