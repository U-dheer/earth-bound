import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  /**
   * Validates an email address format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async sendPasswordResetEmail(to: string, OTP: string) {
    // Validate email before attempting to send
    if (!to || !this.isValidEmail(to)) {
      console.error(`Invalid email address provided: ${to}`);
      throw new BadRequestException('Invalid email address format');
    }

    console.log(
      `Preparing to send password reset email to ${to} with OTP: ${OTP}`,
    );
    try {
      const templatePath = path.join(
        __dirname,
        '../templates/password-reset.html',
      );
      let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

      // Replace placeholders
      htmlTemplate = htmlTemplate
        .replace('{{OTP}}', OTP)
        .replace('{{YEAR}}', new Date().getFullYear().toString());

      const MailOptions = {
        from: 'EarthBound <udithadheerendra10@gmail.com>',
        to,
        subject: 'Password Reset Verification Code',
        html: htmlTemplate,
      };

      await this.transporter.sendMail(MailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}
