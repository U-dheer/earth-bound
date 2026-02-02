import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  offerCode?: string;

  @IsOptional()
  @IsString()
  offerTitle?: string;

  @IsOptional()
  @IsNumber()
  discountPercentage?: number;

  @IsOptional()
  @IsNumber()
  redeemamountForGetTheOffer?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  validUpTo?: Date;
}
