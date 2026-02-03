import {
  BadRequestException,
  Body,
  Inject,
  Injectable,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { RefreshToken } from './schema/refreshToken.schema';
import { signUpDataDto } from './dtos/signUpDataDto';
import * as bcrypt from 'bcrypt';
import { loginDataDto } from './dtos/loginDataDto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dtos/refreshTokenDto';
import { ResetOTP } from './schema/resetOTP.schema';
import { MailService } from 'src/services/mail.service';
import { randomInt } from 'crypto';
import axios, { post } from 'axios';
import { CreateUserDto } from './dtos/signUp.dto';
import { TokenConfig, getRefreshTokenExpiryDate } from './config/token.config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetOTP.name)
    private readonly resetOTPModel: Model<ResetOTP>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signUp(signUpData: CreateUserDto) {
    try {
      console.log('Received signUpData:', signUpData);
      const exsitingUser = await this.userModel.findOne({
        email: signUpData.email,
      });
      if (exsitingUser) {
        throw new BadRequestException('User already exists');
      }

      if (signUpData.password !== signUpData.passwordConfirm) {
        throw new BadRequestException('Passwords are not identical');
      }

      let hashedPassword = await bcrypt.hash(signUpData.password, 10);

      const user = await this.userModel.create({
        email: signUpData.email,
        password: hashedPassword,
        role: signUpData.role,
      });
      await this.postTheSignUpData(signUpData, user);
    } catch (error) {
      console.error('Error in signUp:', error.message);
      console.error(error);
      throw new BadRequestException(error.message);
    }

    return { message: 'User created successfully' };
  }

  async login(loginData: loginDataDto) {
    const user = await this.userModel.findOne({ email: loginData.email });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isCorrectPassword = await bcrypt.compare(
      loginData.password,
      user.password,
    );
    if (!isCorrectPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.role,
      user.tokenVersion,
    );
    return {
      ...tokens,
      userId: user._id,
    };
  }

  async generateTokens(userId: string, role: string, tokenVersion: number = 0) {
    const accessToken = await this.jwtService.signAsync(
      { userId, role, tokenVersion },
      { expiresIn: TokenConfig.accessToken.expiresIn },
    );
    const refreshToken = await this.jwtService.signAsync(
      { userId, role, tokenVersion },
      { expiresIn: TokenConfig.refreshToken.expiresIn },
    );
    await this.storeRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  /**
   * Generate only a new access token (used during refresh to keep original refresh token)
   */
  async generateAccessToken(
    userId: string,
    role: string,
    tokenVersion: number = 0,
  ) {
    const accessToken = await this.jwtService.signAsync(
      { userId, role, tokenVersion },
      { expiresIn: TokenConfig.accessToken.expiresIn },
    );
    return accessToken;
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    const expiryDate = getRefreshTokenExpiryDate();

    await this.refreshTokenModel.updateOne(
      { userId },
      {
        $set: { expiryDate, refreshToken },
      },
      {
        upsert: true,
      },
    );
  }

  async refreshTokens(refreshToken: string) {
    // First, verify the refresh token JWT is valid and not expired
    let payload: any;
    try {
      console.log('Verifying refresh token JWT...');
      payload = await this.jwtService.verifyAsync(refreshToken);
      console.log('Refresh token JWT verified successfully, payload:', payload);
    } catch (error) {
      console.log('Refresh token JWT verification failed:', error.message);
      throw new UnauthorizedException(
        'Refresh token has expired or is invalid',
      );
    }

    // Then check if it exists in the database
    const storedRefreashToken = await this.refreshTokenModel.findOne({
      refreshToken: refreshToken,
      expiryDate: { $gt: new Date() },
    });

    if (!storedRefreashToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userModel.findById(storedRefreashToken.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify token version from JWT matches (hasn't been revoked before)
    const tokenVersion = payload.tokenVersion ?? 0;
    const userTokenVersion = user.tokenVersion ?? 0;
    if (tokenVersion !== userTokenVersion) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Generate only a new access token - keep the same refresh token
    // This ensures the session expires when the original refresh token expires
    const accessToken = await this.generateAccessToken(
      storedRefreashToken.userId,
      user.role,
      userTokenVersion, // Use same tokenVersion - don't increment
    );

    // Return new access token but keep the SAME refresh token
    return {
      accessToken,
      refreshToken, // Return the same refresh token (not a new one)
    };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    console.log('Changing password for userId:', userId);
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    console.log(oldPassword, user.password);
    console.log('Old password match:', isMatch);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException('New password must be different');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { password: hashed } },
    );

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const OTP = randomInt(100000, 999999).toString();
    const expiryDate = new Date(Date.now() + 3600 * 1000);
    const resetOTP = new this.resetOTPModel({
      userId: user._id,
      OTP: OTP,
      expiryDate: expiryDate,
    });
    await resetOTP.save();
    await this.mailService.sendPasswordResetEmail(email, OTP);
    return { message: 'Password reset OTP sent to your email' };
  }

  async resetPassword(newPassword: string, OTP: string) {
    const OTPEntry = await this.resetOTPModel.findOne({
      OTP: OTP,
      expiryDate: { $gt: new Date() },
    });
    if (!OTPEntry) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.updateOne(
      { _id: OTPEntry.userId },
      { $set: { password: hashedPassword } },
    );

    await this.resetOTPModel.deleteOne({ _id: OTPEntry._id });

    return { message: 'Password has been reset successfully' };
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.userModel
        .findById(payload.userId)
        .select('-password');
      if (!user) {
        throw new UnauthorizedException('Invalid token: User not found');
      }

      // Check if token version matches (token not revoked)
      const tokenVersion = payload.tokenVersion ?? 0;
      const userTokenVersion = user.tokenVersion ?? 0;

      if (tokenVersion !== userTokenVersion) {
        throw new UnauthorizedException('Token has been revoked');
      }

      return { valid: true, user };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getMe(userId: string) {
    if (!userId) throw new BadRequestException('User ID is required');
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new NotFoundException('User not found');

    if (user.role === 'USER') {
      const userInApi = await axios.get(
        `http://localhost:3000/api/user/${userId}`,
      );

      if (!user) throw new NotFoundException('User not found');
      return userInApi.data;
    } else if (user.role === 'BUSINESS') {
      const businessInApi = await axios.get(
        `http://localhost:3000/api/bussiness/${userId}`,
      );

      if (!businessInApi) throw new NotFoundException('Business not found');
      return businessInApi.data;
    } else if (user.role === 'ORGANIZER') {
      const organizerInApi = await axios.get(
        `http://localhost:3000/api/organizer/${userId}`,
      );

      if (!organizerInApi) throw new NotFoundException('Organizer not found');
      return organizerInApi.data;
    } else if (user.role === 'ADMIN') {
      const adminInApi = await axios.get(
        `http://localhost:3000/api/admin/${userId}`,
      );

      if (!adminInApi) throw new NotFoundException('Admin not found');
      return adminInApi.data;
    } else {
      return user;
    }
  }

  /**
   * Logout user by invalidating all tokens
   * - Increments tokenVersion to invalidate all existing JWTs
   * - Removes refresh token from database
   */
  async logout(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Increment token version to invalidate ALL existing tokens
    const newTokenVersion = (user.tokenVersion || 0) + 1;
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { tokenVersion: newTokenVersion } },
    );

    // Remove refresh token from database
    await this.refreshTokenModel.deleteOne({ userId });

    return { message: 'Logged out successfully. All tokens invalidated.' };
  }

  async getmeThroughToken(token: string) {
    if (!token) throw new BadRequestException('Token is required');
    const payload = await this.jwtService.verifyAsync(token);
    const user = await this.userModel
      .findById(payload.userId)
      .select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  signUpData;

  async getAllBusinesses() {
    return this.userModel.find({ role: 'BUSINESS' }).select('-password');
  }

  async getAllBusinessesNotActivated() {
    return this.userModel
      .find({ role: 'BUSINESS', isActive: false })
      .select('-password');
  }

  async getOneUser(userId: string) {
    try {
      const user = await this.userModel.findById(userId).select('-password');
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async verifyBusiness(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (user.isActive === false) {
      user.isActive = true;
    } else {
      user.isActive = false;
    }

    await user.save();
    return { message: 'verified successfully' };
  }

  async getAllOrganizers() {
    return this.userModel.find({ role: 'ORGANIZER' }).select('-password');
  }

  async getAllOrganizersNotActivated() {
    return this.userModel
      .find({ role: 'ORGANIZER', isActive: false })
      .select('-password');
  }

  async getAllOrganizersActivated() {
    return this.userModel
      .find({ role: 'ORGANIZER', isActive: true })
      .select('-password');
  }

  async toggleOrganizerStatus(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Organizer not found');
    }
    if (user.role !== 'ORGANIZER') {
      throw new BadRequestException('User is not an organizer');
    }
    user.isActive = !user.isActive;
    await user.save();
    return {
      message: `Organizer status toggled to ${user.isActive ? 'active' : 'inactive'}`,
    };
  }

  async toggleUserActiveStatus(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allowedRoles = ['ORGANIZER', 'BUSINESS', 'USER'];
    if (!allowedRoles.includes(user.role)) {
      throw new BadRequestException(
        `Cannot toggle active status for role: ${user.role}`,
      );
    }

    user.isActive = !user.isActive;
    await user.save();

    return {
      message: `${user.role} status toggled to ${user.isActive ? 'active' : 'inactive'}`,
      userId: user._id,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async getAllUsers() {
    return this.userModel.find({ role: 'USER' }).select('-password');
  }

  async postTheSignUpData(signUpData: CreateUserDto, user: any) {
    console.log('Account number in AuthService:', signUpData.accountNumber);
    signUpData.id = user._id.toString();

    if (user.role === 'USER') {
      const response = await axios.post(
        'http://localhost:3000/api/user/create',
        signUpData,
      );
      return response.data;
    } else if (user.role === 'BUSINESS') {
      const response = await axios.post(
        'http://localhost:3000/api/bussiness/create',
        signUpData,
      );
      return response.data;
    } else if (user.role === 'ORGANIZER') {
      const response = await axios.post(
        'http://localhost:3000/api/organizer/create',
        signUpData,
      );
      return response.data;
    } else if (user.role === 'ADMIN') {
      const response = await axios.post(
        'http://localhost:3000/api/admin/create',
        signUpData,
      );
      return response.data;
    } else {
      return { message: 'No additional data to post' };
    }
  }

  async updateUser(userId: string, dto: Partial<CreateUserDto>) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update only allowed fields
    const allowedFields = ['email', 'name', 'role', 'redeemPoints'];
    for (const field of allowedFields) {
      if (dto[field] !== undefined) {
        user[field] = dto[field];
      }
    }

    await user.save();
    return { message: 'User updated successfully' };
  }
}
