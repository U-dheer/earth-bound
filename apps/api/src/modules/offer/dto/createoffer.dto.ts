import { Type } from 'class-transformer';

export class CreateOfferDto {
  offer_id: string;
  description: string;
  offerCode: string;
  offerTitle: string;
  discountPercentage: number;
  bussinessId: string;

  @Type(() => Date)
  validUpTo: Date;
}
