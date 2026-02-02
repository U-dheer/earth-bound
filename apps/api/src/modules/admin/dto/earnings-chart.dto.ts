import { IsOptional, IsDateString } from 'class-validator';

export class EarningsChartQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export interface EarningsChartDataPoint {
  date: string;
  donations: number;
  offerRedemptions: number;
}

export interface EarningsChartResponse {
  data: EarningsChartDataPoint[];
  summary: {
    totalDonations: number;
    totalOfferRedemptions: number;
    startDate: string;
    endDate: string;
  };
}
