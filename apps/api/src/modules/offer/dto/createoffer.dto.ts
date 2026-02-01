import { Type } from 'class-transformer';

export class CreateOfferDto {
  offer_id: string;
  description: string;
  offerCode: string;
  offerTitle: string;
  discountPercentage: number;
  redeemamountForGetTheOffer: number;

  @Type(() => Date)
  validUpTo: Date;
}
