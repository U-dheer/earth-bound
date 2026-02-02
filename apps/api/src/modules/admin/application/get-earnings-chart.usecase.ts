import { Injectable } from '@nestjs/common';
import { DashboardRepository } from '../infrastructure/dashboard.repository';
import {
  EarningsChartQueryDto,
  EarningsChartDataPoint,
  EarningsChartResponse,
} from '../dto/earnings-chart.dto';

@Injectable()
export class GetEarningsChartUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  private parseLocalDate(dateStr: string): Date {
    // Parse date string as local date (not UTC)
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatDateStr(date: Date): string {
    // Format as YYYY-MM-DD using local date parts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async execute(query: EarningsChartQueryDto): Promise<EarningsChartResponse> {
    // Default to last 30 days if no dates provided
    const today = new Date();
    const endDate = query.endDate
      ? this.parseLocalDate(query.endDate)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startDate = query.startDate
      ? this.parseLocalDate(query.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Set time to cover full days
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get date strings for DB query
    const startDateStr = this.formatDateStr(startDate);
    const endDateStr = this.formatDateStr(endDate);

    // Fetch data from both sources
    const [donationsData, offerRedemptionsData] = await Promise.all([
      this.dashboardRepository.getDonationsByDateRange(
        startDateStr,
        endDateStr,
      ),
      this.dashboardRepository.getOfferRedemptionsByDateRange(
        startDateStr,
        endDateStr,
      ),
    ]);

    // Create a map of all dates in the range
    const dateMap = new Map<string, EarningsChartDataPoint>();

    // Generate all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = this.formatDateStr(currentDate);
      dateMap.set(dateStr, {
        date: dateStr,
        donations: 0,
        offerRedemptions: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Populate donations
    for (const item of donationsData) {
      const dateStr =
        typeof item.date === 'string'
          ? item.date
          : new Date(item.date).toISOString().split('T')[0];

      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr)!.donations = Number(item.total) || 0;
      }
    }

    // Populate offer redemptions
    for (const item of offerRedemptionsData) {
      const dateStr =
        typeof item.date === 'string'
          ? item.date
          : new Date(item.date).toISOString().split('T')[0];

      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr)!.offerRedemptions = Number(item.total) || 0;
      }
    }

    // Convert map to sorted array
    const data = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Calculate totals
    const totalDonations = data.reduce((sum, item) => sum + item.donations, 0);
    const totalOfferRedemptions = data.reduce(
      (sum, item) => sum + item.offerRedemptions,
      0,
    );

    return {
      data,
      summary: {
        totalDonations,
        totalOfferRedemptions,
        startDate: this.formatDateStr(startDate),
        endDate: this.formatDateStr(endDate),
      },
    };
  }
}
