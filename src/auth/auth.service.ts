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
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginedUser: any) {

    const user = await this.usersService.loginByEmailAndPassword(loginedUser.email, loginedUser.password);
    console.log(user);
    const payload = { email: user.email, sub: user.id, role: user.role };

    // Create access token (short-lived)
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    // Create refresh token (long-lived)
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '30d' }
    );

    // Store refresh token securely (hashed) in database
    await this.usersService.storeRefreshToken(user.id, refreshToken);

    // Update last login time
    await this.usersService.updateLastLogin(user.id);

    console.log({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        balance: user.balance,
        totalSpent: user.totalSpent,
        totalOrders: user.totalOrders,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        // Include reseller fields if applicable
        ...(user.role === 'RESELLER' && {
          commission: user.commission,
          totalEarnings: user.totalEarnings,
          referralCode: user.referralCode,
          referredBy: user.referredBy,
          downlineCount: user.downlineCount,
        }),
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        isVerified: user.isVerified,
      },
    })

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        balance: user.balance,
        totalSpent: user.totalSpent,
        totalOrders: user.totalOrders,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        // Include reseller fields if applicable
        ...(user.role === 'RESELLER' && {
          commission: user.commission,
          totalEarnings: user.totalEarnings,
          referralCode: user.referralCode,
          referredBy: user.referredBy,
          downlineCount: user.downlineCount,
        }),
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        isVerified: user.isVerified,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);
      const userId = payload.sub;

      console.log(userId);

      // Check if token is in database and not revoked
      const isValid = await this.usersService.validateRefreshToken(userId, refreshToken);

      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const user = await this.usersService.findById(userId);
      console.log(user);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newAccessToken = this.jwtService.sign(
        { email: user.email, sub: user.id, role: user.role },
        { expiresIn: '1h' }
      );

      // Optionally generate new refresh token for rotation
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '30d' }
      );

      // Update refresh token in database
      await this.usersService.storeRefreshToken(user.id, newRefreshToken);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(createUserDto: CreateUserDto) {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new UnauthorizedException('User with this email already exists');
      }

      // Create user
      const user = await this.usersService.create(createUserDto);

      // Generate OTP for email verification
      const otp = this.generateOTP();
      await this.usersService.setOtpSecret(user.id, otp);

      // Send verification email
      await this.sendVerificationEmail(user.email, otp);

      // For development, auto-login after registration
      // In production, you might want to require email verification first
      if (process.env.NODE_ENV === 'development') {
        return this.login(user);
      }

      // For production, return user info without auto-login
      const payload = { email: user.email, sub: user.id, role: user.role };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '30d' });

      await this.usersService.storeRefreshToken(user.id, refreshToken);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          balance: user.balance || 0,
          totalSpent: user.totalSpent || 0,
          totalOrders: user.totalOrders || 0,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          createdAt: user.createdAt,
          isVerified: user.isVerified,
        },
        message: 'Registration successful',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Registration failed');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message: 'If an account with that email exists, password reset instructions have been sent.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour from now

    await this.usersService.setResetToken(email, token, expiryDate);

    // Send password reset email
    await this.sendPasswordResetEmail(email, token);

    return {
      message: 'Password reset instructions sent to your email',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      await this.usersService.resetPassword(token, newPassword);
      return {
        message: 'Password reset successful',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Password reset failed');
    }
  }

  async verifyOTP(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.otpSecret !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Check if OTP is expired (optional - you can add OTP expiry to user model)
    // For now, we'll assume OTPs are valid for 10 minutes
    
    await this.usersService.verifyUser(user.id);

    return {
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: true,
      },
    };
  }

  async logout(userId: string) {
    try {
      // Invalidate refresh token
      await this.usersService.revokeRefreshToken(userId);
      return {
        message: 'Logout successful',
      };
    } catch (error) {
      throw new UnauthorizedException('Logout failed');
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendVerificationEmail(email: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || 'noreply@gamingplatform.com',
        to: email,
        subject: 'Verify Your Email - Gaming Platform',
        text: `Your verification code is: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Gaming Platform!</h2>
            <p>Thank you for registering with us. Please use the following verification code to complete your registration:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Gaming Platform Team</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error to prevent registration failure due to email issues
    }
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || 'noreply@gamingplatform.com',
        to: email,
        subject: 'Reset Your Password - Gaming Platform',
        text: `Click the following link to reset your password: ${resetUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested to reset your password for your Gaming Platform account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Gaming Platform Team</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new UnauthorizedException('Failed to send password reset email');
    }
  }
}