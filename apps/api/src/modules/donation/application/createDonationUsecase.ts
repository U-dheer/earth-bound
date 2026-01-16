import { BadRequestException, Injectable } from '@nestjs/common';
import { DonationService } from '../infrastructure/donation.service';
import { CreateDonationDto } from '../dto/createDonation.dto';
import { UserService } from 'src/modules/user/infrastructure/user.service';
import { generateRedeemPoints } from 'src/utils/redeem_points_generater';

@Injectable()
export class CreateDonationUsecase {
  constructor(
    private readonly donationService: DonationService,
    private readonly userService: UserService,
  ) {}

  async execute(data: CreateDonationDto, id: string) {
    try {
      const donation = await this.donationService.createDonation(data, id);

      const user = await this.userService.findUserById(data.userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const newRedeemPointsAmount = generateRedeemPoints(donation.amount);
      console.log('New Redeem Points Amount:', newRedeemPointsAmount);

      await this.userService.updateUser(data.userId, {
        redeemPoints: user.redeemPoints + newRedeemPointsAmount,
      });

      return donation;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create donation',
      );
    }
  }
}
