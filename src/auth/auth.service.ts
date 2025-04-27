import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };

    // Create access token (short-lived)
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    // Create refresh token (long-lived)
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '30d' }
    );

    // Store refresh token securely (hashed) in database
    await this.usersService.storeRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);
      const userId = payload.sub;

      // Check if token is in database and not revoked
      const isValid = await this.usersService.validateRefreshToken(userId, refreshToken);

      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const user = await this.usersService.findOne(userId);
      const newAccessToken = this.jwtService.sign(
        { email: user?.email, sub: user?.id },
        { expiresIn: '1h' }
      );

      return {
        access_token: newAccessToken
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    // Generate OTP for email verification
    const otp = this.generateOTP();
    await this.usersService.setOtpSecret(user.id, otp);

    // Send verification email
    await this.sendVerificationEmail(user.email, otp);

    return {
      message: 'User registered successfully. Please check your email for verification.',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    await this.usersService.setResetToken(email, token);

    // Send password reset email
    await this.sendPasswordResetEmail(email, token);

    return {
      message: 'Password reset instructions sent to your email',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    await this.usersService.resetPassword(token, newPassword);
    return {
      message: 'Password reset successful',
    };
  }

  async verifyOTP(email: string, otp: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.otpSecret !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.usersService.verifyUser(user.id);

    return {
      message: 'Email verified successfully',
    };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendVerificationEmail(email: string, otp: string) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@example.com',
      to: email,
      subject: 'Verify Your Email',
      text: `Your verification code is: ${otp}`,
      html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
    });
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@example.com',
      to: email,
      subject: 'Reset Your Password',
      text: `Click the following link to reset your password: ${resetUrl}`,
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });
  }
}